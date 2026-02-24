#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const QUESTIONS_PATH = path.join(projectRoot, "src/data/questions.json");
const KEY_POINTS_PATH = path.join(projectRoot, "src/data/key-points.json");
const PUBLIC_DIR = path.join(projectRoot, "public");
const args = process.argv.slice(2);

const CATEGORIES = [
  "electrical_theory",
  "wiring_diagram",
  "laws",
  "construction_method",
  "equipment_material",
  "inspection",
];
const QUESTION_TYPES = ["multiple_choice", "true_false", "image_tap"];

const errors = [];
const warnings = [];
const failOnWarn = args.includes("--fail-on-warn");
const baselinePath = getOptionValue("--baseline");
const writeBaselinePath = getOptionValue("--write-baseline");

function addError(message) {
  errors.push(message);
}

function addWarning(message) {
  warnings.push(message);
}

function getOptionValue(optionName) {
  const index = args.indexOf(optionName);
  if (index === -1) {
    return null;
  }

  const value = args[index + 1];
  if (!value || value.startsWith("--")) {
    console.error(`[validate-content] ${optionName} の値が不足しています。`);
    process.exit(1);
  }

  return path.resolve(projectRoot, value);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function normalizeText(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[0-9]+(?:\.[0-9]+)?/g, " ")
    .replace(/[\s　・()（）「」『』【】,.、。:：;；!?！？'"`´\-_/\\|[\]{}<>]/g, "")
    .trim();
}

function extractSvgText(svg) {
  const parts = [];
  const regex = /<(text|title|desc)\b[^>]*>([\s\S]*?)<\/\1>/gi;
  let match;
  while ((match = regex.exec(svg)) !== null) {
    const text = match[2].replace(/<[^>]+>/g, " ").trim();
    if (text) parts.push(text);
  }
  return parts;
}

function validateQuestions(questions) {
  if (!Array.isArray(questions)) {
    addError("questions.json must be an array.");
    return;
  }

  const seenIds = new Set();
  const categoryCounts = Object.fromEntries(CATEGORIES.map((cat) => [cat, 0]));
  const questionTypeCounts = Object.fromEntries(
    QUESTION_TYPES.map((type) => [type, 0])
  );
  const categoryTypeCounts = Object.fromEntries(
    CATEGORIES.map((category) => [
      category,
      Object.fromEntries(QUESTION_TYPES.map((type) => [type, 0])),
    ])
  );
  const normalizedQuestionTextMap = new Map();
  const svgCache = new Map();

  for (const question of questions) {
    if (!question || typeof question !== "object") {
      addError("Question entry must be an object.");
      continue;
    }

    if (typeof question.id !== "string" || question.id.length === 0) {
      addError("Question id is missing or invalid.");
      continue;
    }
    if (seenIds.has(question.id)) {
      addError(`Duplicate question id: ${question.id}`);
    }
    seenIds.add(question.id);

    const isValidCategory = CATEGORIES.includes(question.category);
    if (!isValidCategory) {
      addError(`Invalid category at ${question.id}: ${question.category}`);
    } else {
      categoryCounts[question.category] += 1;
    }

    const questionType =
      question.questionType == null ? "multiple_choice" : question.questionType;
    if (!QUESTION_TYPES.includes(questionType)) {
      addError(
        `Question ${question.id} has invalid questionType: ${question.questionType}`
      );
    } else {
      questionTypeCounts[questionType] += 1;
      if (isValidCategory) {
        categoryTypeCounts[question.category][questionType] += 1;
      }
    }

    if (!Array.isArray(question.options) || question.options.length < 2) {
      addError(`Question ${question.id} must have at least 2 options.`);
    } else if (questionType === "multiple_choice" && question.options.length !== 4) {
      addError(`Question ${question.id} (multiple_choice) must have exactly 4 options.`);
    } else if (questionType === "true_false" && question.options.length !== 2) {
      addError(`Question ${question.id} (true_false) must have exactly 2 options.`);
    }

    if (questionType === "image_tap") {
      if (!question.image) {
        addError(`Question ${question.id} (image_tap) requires image.`);
      }
      if (!Array.isArray(question.hotspots)) {
        addError(`Question ${question.id} (image_tap) requires hotspots.`);
      } else {
        if (question.hotspots.length !== question.options.length) {
          addError(
            `Question ${question.id} (image_tap) hotspots length must match options length.`
          );
        }
        question.hotspots.forEach((hotspot, index) => {
          const validPoint =
            hotspot &&
            typeof hotspot.x === "number" &&
            typeof hotspot.y === "number" &&
            hotspot.x >= 0 &&
            hotspot.x <= 100 &&
            hotspot.y >= 0 &&
            hotspot.y <= 100;
          if (!validPoint) {
            addError(
              `Question ${question.id} (image_tap) hotspot[${index}] must have x/y in 0-100.`
            );
          }
        });

        for (let i = 0; i < question.hotspots.length; i += 1) {
          for (let j = i + 1; j < question.hotspots.length; j += 1) {
            const pointA = question.hotspots[i];
            const pointB = question.hotspots[j];
            if (
              !pointA ||
              !pointB ||
              typeof pointA.x !== "number" ||
              typeof pointA.y !== "number" ||
              typeof pointB.x !== "number" ||
              typeof pointB.y !== "number"
            ) {
              continue;
            }
            const distance = Math.hypot(pointA.x - pointB.x, pointA.y - pointB.y);
            if (distance < 8) {
              addWarning(
                `Question ${question.id} (image_tap) hotspots ${i + 1} and ${j + 1} are too close (${distance.toFixed(1)}).`
              );
            }
          }
        }
      }
    }

    if (
      !Number.isInteger(question.correctIndex) ||
      question.correctIndex < 0 ||
      question.correctIndex >= question.options.length
    ) {
      addError(`Question ${question.id} has invalid correctIndex.`);
    }

    if (typeof question.question !== "string" || question.question.length === 0) {
      addError(`Question ${question.id} has an empty question text.`);
    } else {
      if (questionType === "image_tap") {
        const hasDirectCodeHint =
          /[●=]\s*[A-Za-z0-9]{1,4}/.test(question.question) ||
          /[（(]\s*[A-Za-z0-9]{1,4}\s*[）)]/.test(question.question);
        if (hasDirectCodeHint) {
          addError(
            `Question ${question.id} (image_tap) includes direct symbol code hint in question text.`
          );
        }
      }

      const normalizedQuestion = normalizeText(question.question);
      if (normalizedQuestion.length >= 8) {
        const ids = normalizedQuestionTextMap.get(normalizedQuestion) ?? [];
        ids.push(question.id);
        normalizedQuestionTextMap.set(normalizedQuestion, ids);
      }
    }

    if (
      typeof question.explanation !== "string" ||
      question.explanation.length === 0
    ) {
      addError(`Question ${question.id} has an empty explanation.`);
    } else if (normalizeText(question.explanation).length < 18) {
      addWarning(
        `Explanation may be too short at ${question.id} (内容が短く学習価値が低い可能性).`
      );
    }

    if (Array.isArray(question.options) && question.options.length > 1) {
      const normalizedOptions = question.options
        .map((option) => normalizeText(option))
        .filter((option) => option.length > 0);
      if (normalizedOptions.length > 1) {
        const uniqueOptions = new Set(normalizedOptions);
        if (uniqueOptions.size !== normalizedOptions.length) {
          addWarning(
            `Potential duplicate options at ${question.id} (表記揺れ含む重複選択肢の可能性).`
          );
        }
      }
    }

    if (question.image) {
      const normalizedPath = String(question.image).replace(/^\/+/, "");
      const imagePath = path.join(PUBLIC_DIR, normalizedPath);
      if (!fs.existsSync(imagePath)) {
        addError(`Missing image for ${question.id}: ${question.image}`);
      }

      if (question.image.endsWith(".svg") && fs.existsSync(imagePath)) {
        let svgTexts = svgCache.get(imagePath);
        if (!svgTexts) {
          const svg = fs.readFileSync(imagePath, "utf8");
          svgTexts = extractSvgText(svg);
          svgCache.set(imagePath, svgTexts);
        }

        const haystack = normalizeText(svgTexts.join(" "));
        const correct = question.options?.[question.correctIndex];
        const normalizedCorrect = normalizeText(correct);

        if (normalizedCorrect.length >= 3 && haystack.includes(normalizedCorrect)) {
          if (questionType === "image_tap") {
            addError(
              `Image-tap spoiler in ${question.id}: correct option appears in SVG text (${question.image})`
            );
          } else {
          addError(
            `Potential spoiler in ${question.id}: correct option appears in SVG text (${question.image})`
          );
          }
        }

        for (let i = 0; i < (question.options?.length ?? 0); i += 1) {
          if (questionType === "image_tap") continue;
          if (i === question.correctIndex) continue;
          const normalizedOption = normalizeText(question.options[i]);
          if (
            normalizedOption.length >= 3 &&
            haystack.includes(normalizedOption)
          ) {
            addWarning(
              `Hint risk in ${question.id}: option "${question.options[i]}" appears in SVG text (${question.image})`
            );
          }
        }
      }
    }
  }

  for (const [category, count] of Object.entries(categoryCounts)) {
    if (count < 15) {
      addError(`Category ${category} has too few questions: ${count} (< 15)`);
    }
  }

  const totalQuestions = questions.length;
  const trueFalseRate =
    totalQuestions > 0 ? questionTypeCounts.true_false / totalQuestions : 0;
  if (trueFalseRate > 0.45) {
    addWarning(
      `true_false の割合が高めです (${(trueFalseRate * 100).toFixed(1)}%). 難易度単調化の可能性があります。`
    );
  }
  if (trueFalseRate < 0.08) {
    addWarning(
      `true_false の割合が低めです (${(trueFalseRate * 100).toFixed(1)}%). 出題バリエーション不足の可能性があります。`
    );
  }

  for (const category of CATEGORIES) {
    const total = categoryCounts[category];
    if (total <= 0) continue;
    const categoryTrueFalseRate = categoryTypeCounts[category].true_false / total;
    if (categoryTrueFalseRate > 0.6) {
      addWarning(
        `Category ${category} で true_false の割合が高いです (${(categoryTrueFalseRate * 100).toFixed(1)}%).`
      );
    }
  }

  for (const ids of normalizedQuestionTextMap.values()) {
    if (ids.length >= 2) {
      addWarning(`Potential duplicated question wording: ${ids.join(", ")}`);
    }
  }
}

function validateKeyPoints(keyPoints) {
  if (!Array.isArray(keyPoints)) {
    addError("key-points.json must be an array.");
    return;
  }

  const seenIds = new Set();
  for (const keyPoint of keyPoints) {
    if (!keyPoint || typeof keyPoint !== "object") {
      addError("KeyPoint entry must be an object.");
      continue;
    }

    if (typeof keyPoint.id !== "string" || keyPoint.id.length === 0) {
      addError("KeyPoint id is missing or invalid.");
      continue;
    }
    if (seenIds.has(keyPoint.id)) {
      addError(`Duplicate key point id: ${keyPoint.id}`);
    }
    seenIds.add(keyPoint.id);

    if (!CATEGORIES.includes(keyPoint.category)) {
      addError(`Invalid key point category at ${keyPoint.id}: ${keyPoint.category}`);
    }

    if (keyPoint.image) {
      const normalizedPath = String(keyPoint.image).replace(/^\/+/, "");
      const imagePath = path.join(PUBLIC_DIR, normalizedPath);
      if (!fs.existsSync(imagePath)) {
        addError(`Missing key point image for ${keyPoint.id}: ${keyPoint.image}`);
      }
    }
  }
}

function printReport() {
  let baselineWarnings = [];
  if (baselinePath) {
    if (!fs.existsSync(baselinePath)) {
      console.error(`[validate-content] baseline not found: ${baselinePath}`);
      process.exit(1);
    }

    try {
      const parsed = readJson(baselinePath);
      if (Array.isArray(parsed)) {
        baselineWarnings = parsed;
      } else if (Array.isArray(parsed?.warnings)) {
        baselineWarnings = parsed.warnings;
      } else {
        throw new Error("baseline format must be array or { warnings: string[] }");
      }
    } catch (error) {
      console.error(
        `[validate-content] baseline parse error: ${error instanceof Error ? error.message : String(error)}`
      );
      process.exit(1);
    }
  }

  if (writeBaselinePath) {
    const payload = { warnings: [...warnings].sort() };
    fs.writeFileSync(writeBaselinePath, `${JSON.stringify(payload, null, 2)}\n`);
    console.log(`[validate-content] baseline written: ${writeBaselinePath}`);
  }

  const baselineSet = new Set(baselineWarnings);
  const newWarnings =
    baselineSet.size > 0
      ? warnings.filter((warning) => !baselineSet.has(warning))
      : [...warnings];

  if (warnings.length > 0) {
    if (baselineSet.size > 0) {
      const matchedCount = warnings.length - newWarnings.length;
      console.warn(
        `\n[validate-content] warnings: ${warnings.length} (baseline matched: ${matchedCount}, new: ${newWarnings.length})`
      );
    } else {
      console.warn(`\n[validate-content] warnings: ${warnings.length}`);
    }

    for (const message of newWarnings) {
      console.warn(`- ${message}`);
    }

    if (failOnWarn && newWarnings.length > 0) {
      console.error("[validate-content] warnings are treated as errors in strict mode.");
      process.exit(1);
    }
  }

  if (errors.length > 0) {
    console.error(`\n[validate-content] errors: ${errors.length}`);
    for (const message of errors) {
      console.error(`- ${message}`);
    }
    process.exit(1);
  }

  console.log("[validate-content] OK");
}

const questions = readJson(QUESTIONS_PATH);
const keyPoints = readJson(KEY_POINTS_PATH);

validateQuestions(questions);
validateKeyPoints(keyPoints);
printReport();
