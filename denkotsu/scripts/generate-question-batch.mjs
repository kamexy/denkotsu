#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const questionsPath = path.join(projectRoot, "src/data/questions.json");

const stage = process.argv[2];

const STAGE_CONFIG = {
  stage1: {
    addCounts: {
      electrical_theory: 20,
      wiring_diagram: 15,
      laws: 20,
      construction_method: 25,
      equipment_material: 18,
      inspection: 15,
    },
    trueFalseCounts: {
      electrical_theory: 3,
      wiring_diagram: 3,
      laws: 4,
      construction_method: 4,
      equipment_material: 3,
      inspection: 3,
    },
  },
  stage2: {
    addCounts: {
      electrical_theory: 28,
      wiring_diagram: 24,
      laws: 26,
      construction_method: 35,
      equipment_material: 25,
      inspection: 12,
    },
    trueFalseCounts: {
      electrical_theory: 0,
      wiring_diagram: 0,
      laws: 0,
      construction_method: 0,
      equipment_material: 0,
      inspection: 0,
    },
  },
  stage3: {
    addCounts: {
      electrical_theory: 27,
      wiring_diagram: 24,
      laws: 26,
      construction_method: 34,
      equipment_material: 24,
      inspection: 15,
    },
    trueFalseCounts: {
      electrical_theory: 0,
      wiring_diagram: 0,
      laws: 0,
      construction_method: 0,
      equipment_material: 0,
      inspection: 0,
    },
  },
};

const categoryLabels = {
  electrical_theory: "電気理論",
  wiring_diagram: "配線図",
  laws: "法規",
  construction_method: "工事方法",
  equipment_material: "器具材料",
  inspection: "検査測定",
};

function rotateArray(items, seed) {
  const offset = seed % items.length;
  return [...items.slice(offset), ...items.slice(0, offset)];
}

function placeCorrect(options, correct, seed) {
  const unique = [...new Set(options.map(String))];
  const cleaned = unique.filter((value) => value !== String(correct));
  while (cleaned.length < 3) {
    cleaned.push(`${Number(correct) + cleaned.length + 1}`);
  }

  const target = [String(correct), cleaned[0], cleaned[1], cleaned[2]];
  const correctIndex = seed % 4;
  const arranged = [...target];
  [arranged[0], arranged[correctIndex]] = [arranged[correctIndex], arranged[0]];
  return { options: arranged, correctIndex };
}

function buildElectricalMultipleChoice(serial, seed) {
  const resistance = 2 + (seed % 18);
  const current = 1 + ((seed * 3) % 15);
  const correct = resistance * current;
  const distractors = [
    correct + resistance,
    Math.max(1, correct - current),
    correct + current * 2,
    correct + resistance * 2,
  ];
  const { options, correctIndex } = placeCorrect(distractors, correct, seed);
  return {
    question: `【電理演習 ${serial}】抵抗が${resistance}Ω、電流が${current}Aのとき電圧[V]はいくつか。`,
    options,
    correctIndex,
    explanation: `オームの法則 V=I×R を使う。${current}×${resistance}=${correct}V なので正解は${correct}。`,
  };
}

function buildWiringMultipleChoice(serial, seed) {
  const pool = [
    { key: "ET", answer: "タイマースイッチ", wrong: ["4路スイッチ", "リモコンリレー", "引掛シーリング"] },
    { key: "3", answer: "3路スイッチ", wrong: ["単極スイッチ", "位置表示灯", "確認表示灯"] },
    { key: "4", answer: "4路スイッチ", wrong: ["3路スイッチ", "防水コンセント", "タイマースイッチ"] },
    { key: "A", answer: "自動点滅器", wrong: ["漏電遮断器", "配線用遮断器", "電磁開閉器"] },
    { key: "WP", answer: "防水コンセント", wrong: ["接地極付コンセント", "露出コンセント", "引掛ローゼット"] },
    { key: "E", answer: "接地極付コンセント", wrong: ["一般コンセント", "接地端子付コンセント", "漏電遮断器"] },
  ];
  const selected = pool[seed % pool.length];
  const wrong = rotateArray(selected.wrong, seed);
  const { options, correctIndex } = placeCorrect(wrong, selected.answer, seed);
  return {
    question: `【配線図演習 ${serial}】図記号「${selected.key}」が示す器具として最も適切なのはどれか。`,
    options,
    correctIndex,
    explanation: `配線図記号「${selected.key}」は「${selected.answer}」を示す。図記号と器具名を対で覚えると判別しやすい。`,
  };
}

function buildLawsMultipleChoice(serial, seed) {
  const pool = [
    {
      question: "D種接地工事の接地抵抗値の目安はどれか。",
      answer: "100Ω以下",
      wrong: ["10Ω以下", "300Ω以下", "500Ω以下"],
      explanation: "D種接地工事の接地抵抗値は100Ω以下が目安。条件付き緩和の有無は別途条文で確認する。",
    },
    {
      question: "分岐回路の電圧降下の目安として適切なのはどれか。",
      answer: "2%以内",
      wrong: ["1%以内", "5%以内", "10%以内"],
      explanation: "内線規程では分岐回路の電圧降下は2%以内が目安。幹線は3%以内を合わせて覚える。",
    },
    {
      question: "屋内配線での絶縁抵抗値の合否判断でよく使う値はどれか。",
      answer: "0.1MΩ以上",
      wrong: ["0.01MΩ以上", "1MΩ以上", "10MΩ以上"],
      explanation: "低圧回路では0.1MΩ以上を基準に判定することが多い。測定条件と回路区分を合わせて確認する。",
    },
    {
      question: "漏電遮断器の定格感度電流として住宅回路で一般的なのはどれか。",
      answer: "30mA",
      wrong: ["5mA", "100mA", "500mA"],
      explanation: "人身保護を目的とする低圧回路では30mA級が一般的。時限特性と組み合わせて選定する。",
    },
  ];
  const selected = pool[seed % pool.length];
  const wrong = rotateArray(selected.wrong, seed);
  const { options, correctIndex } = placeCorrect(wrong, selected.answer, seed);
  return {
    question: `【法規演習 ${serial}】${selected.question}`,
    options,
    correctIndex,
    explanation: `${selected.explanation}`,
  };
}

function buildConstructionMultipleChoice(serial, seed) {
  const pool = [
    { question: "リングスリーブ圧着後に最初に確認すべき点はどれか。", answer: "刻印マークと心線の抜け", wrong: ["テープ色", "工具の型番", "作業台の高さ"] },
    { question: "VVFケーブル被覆を剥ぐ際の適切な作業はどれか。", answer: "導体を傷つけない長さで剥ぐ", wrong: ["最短で深く切り込む", "芯線ごとねじる", "被覆を加熱して剥ぐ"] },
    { question: "差込形コネクタ施工で重要な点はどれか。", answer: "規定の剥きしろを守る", wrong: ["銅線をはんだ付けする", "油を塗布して挿入する", "絶縁テープだけで固定する"] },
    { question: "アウトレットボックス作業での基本はどれか。", answer: "配線余長と曲げ半径を確保する", wrong: ["余長をゼロにする", "電線を強く折り曲げる", "接地線を切断する"] },
  ];
  const selected = pool[seed % pool.length];
  const wrong = rotateArray(selected.wrong, seed);
  const { options, correctIndex } = placeCorrect(wrong, selected.answer, seed);
  return {
    question: `【工事演習 ${serial}】${selected.question}`,
    options,
    correctIndex,
    explanation: `施工品質は基本手順の徹底が重要。${selected.answer}を守ることで欠陥や再施工を防げる。`,
  };
}

function buildEquipmentMultipleChoice(serial, seed) {
  const pool = [
    { question: "VVFケーブルの外装色で一般的なものはどれか。", answer: "灰色", wrong: ["赤色", "青色", "黄色"] },
    { question: "漏電遮断器が主に検出する電流はどれか。", answer: "地絡電流", wrong: ["過電流", "突入電流", "励磁電流"] },
    { question: "クランプメータの主用途として適切なのはどれか。", answer: "回路を切らずに電流測定する", wrong: ["絶縁抵抗を直接測る", "接地抵抗を3極法で測る", "電線の被覆を剥く"] },
    { question: "引掛シーリングの説明として適切なのはどれか。", answer: "照明器具の着脱を容易にする器具", wrong: ["配線の保護管", "低圧ヒューズ", "接地棒"] },
  ];
  const selected = pool[seed % pool.length];
  const wrong = rotateArray(selected.wrong, seed);
  const { options, correctIndex } = placeCorrect(wrong, selected.answer, seed);
  return {
    question: `【器具演習 ${serial}】${selected.question}`,
    options,
    correctIndex,
    explanation: `${selected.answer}という用途を押さえると、器具選定の判断ミスを減らせる。`,
  };
}

function buildInspectionMultipleChoice(serial, seed) {
  const pool = [
    { question: "絶縁抵抗測定で使う計器はどれか。", answer: "絶縁抵抗計", wrong: ["クランプメータ", "接地抵抗計", "検電器"] },
    { question: "接地抵抗を測定するときの代表的な方法はどれか。", answer: "3極法", wrong: ["1線式", "ブリッジ法", "半波整流法"] },
    { question: "検電器の主目的として適切なのはどれか。", answer: "充電の有無を確認する", wrong: ["絶縁抵抗を測定する", "電力量を積算する", "位相差を算出する"] },
    { question: "導通試験で確認したいことはどれか。", answer: "回路が連続していること", wrong: ["漏えい電流値", "大地電位", "負荷率"] },
  ];
  const selected = pool[seed % pool.length];
  const wrong = rotateArray(selected.wrong, seed);
  const { options, correctIndex } = placeCorrect(wrong, selected.answer, seed);
  return {
    question: `【検査演習 ${serial}】${selected.question}`,
    options,
    correctIndex,
    explanation: `検査・測定では計器の用途を対応付けることが重要。${selected.answer}を確実に選べるようにする。`,
  };
}

function buildTrueFalse(category, serial, seed) {
  const statements = {
    electrical_theory: [
      { text: "オームの法則は V=I×R で表される。", truth: true },
      { text: "電力は P=V+I で求める。", truth: false },
      { text: "電力量は W=P×t で求める。", truth: true },
      { text: "抵抗の直列合成は逆数和で求める。", truth: false },
    ],
    wiring_diagram: [
      { text: "3路スイッチは2か所から1つの負荷を操作できる。", truth: true },
      { text: "4路スイッチだけで2か所点滅回路を構成できる。", truth: false },
      { text: "ETはタイマースイッチを示す図記号として使われる。", truth: true },
      { text: "位置表示灯(H)は常にON時点灯を示す。", truth: false },
    ],
    laws: [
      { text: "D種接地工事の接地抵抗値は100Ω以下が目安である。", truth: true },
      { text: "分岐回路の電圧降下目安は10%以内である。", truth: false },
      { text: "低圧回路の絶縁抵抗判定で0.1MΩは基準値として使われる。", truth: true },
      { text: "漏電遮断器の定格感度電流30mAは過大すぎるため使わない。", truth: false },
    ],
    construction_method: [
      { text: "圧着接続では刻印マーク確認が重要である。", truth: true },
      { text: "VVF被覆剥ぎは導体に傷が入るほど深く切るほど安全である。", truth: false },
      { text: "差込形コネクタは規定剥きしろを守って施工する。", truth: true },
      { text: "配線余長は不要なので必ずゼロにする。", truth: false },
    ],
    equipment_material: [
      { text: "クランプメータは回路を切断せず電流測定できる。", truth: true },
      { text: "検電器は接地抵抗測定専用である。", truth: false },
      { text: "漏電遮断器は地絡電流の検出に使う。", truth: true },
      { text: "引掛シーリングは配管の防食材である。", truth: false },
    ],
    inspection: [
      { text: "絶縁抵抗測定には絶縁抵抗計を使う。", truth: true },
      { text: "導通確認は回路の連続性確認とは無関係である。", truth: false },
      { text: "接地抵抗測定の代表手法として3極法がある。", truth: true },
      { text: "検電器は電力量を積算する計器である。", truth: false },
    ],
  };

  const list = statements[category];
  const selected = list[seed % list.length];
  const correctIndex = selected.truth ? 0 : 1;
  return {
    questionType: "true_false",
    question: `【${categoryLabels[category]}○✕ ${serial}】${selected.text}`,
    options: ["正しい", "誤り"],
    correctIndex,
    explanation: `設問の正否を定義に基づいて判定する。${selected.truth ? "正しい記述" : "誤った記述"}として覚える。`,
  };
}

function buildMultipleChoice(category, serial, seed) {
  if (category === "electrical_theory") {
    return buildElectricalMultipleChoice(serial, seed);
  }
  if (category === "wiring_diagram") {
    return buildWiringMultipleChoice(serial, seed);
  }
  if (category === "laws") {
    return buildLawsMultipleChoice(serial, seed);
  }
  if (category === "construction_method") {
    return buildConstructionMultipleChoice(serial, seed);
  }
  if (category === "equipment_material") {
    return buildEquipmentMultipleChoice(serial, seed);
  }
  return buildInspectionMultipleChoice(serial, seed);
}

function formatQuestionId(value) {
  return `q${String(value).padStart(3, "0")}`;
}

function main() {
  if (!stage || !STAGE_CONFIG[stage]) {
    console.error("Usage: node scripts/generate-question-batch.mjs <stage1|stage2|stage3>");
    process.exit(1);
  }

  const config = STAGE_CONFIG[stage];
  const questions = JSON.parse(fs.readFileSync(questionsPath, "utf8"));
  const idNumbers = questions
    .map((question) => Number.parseInt(String(question.id).replace(/^q/, ""), 10))
    .filter((value) => Number.isFinite(value));
  let maxId = idNumbers.length > 0 ? Math.max(...idNumbers) : 0;

  const categorySeed = {
    electrical_theory: 0,
    wiring_diagram: 0,
    laws: 0,
    construction_method: 0,
    equipment_material: 0,
    inspection: 0,
  };

  for (const question of questions) {
    if (categorySeed[question.category] != null) {
      categorySeed[question.category] += 1;
    }
  }

  const newQuestions = [];
  for (const [category, addCount] of Object.entries(config.addCounts)) {
    const trueFalseCount = config.trueFalseCounts[category] ?? 0;

    for (let i = 0; i < addCount; i += 1) {
      maxId += 1;
      categorySeed[category] += 1;
      const serial = categorySeed[category];
      const seed = serial + maxId;
      const generated =
        i < trueFalseCount
          ? buildTrueFalse(category, serial, seed)
          : buildMultipleChoice(category, serial, seed);

      newQuestions.push({
        id: formatQuestionId(maxId),
        category,
        question: generated.question,
        options: generated.options,
        correctIndex: generated.correctIndex,
        explanation: generated.explanation,
        ...(generated.questionType ? { questionType: generated.questionType } : {}),
      });
    }
  }

  const updated = [...questions, ...newQuestions];
  fs.writeFileSync(questionsPath, `${JSON.stringify(updated, null, 2)}\n`, "utf8");
  console.log(`stage=${stage}`);
  console.log(`added=${newQuestions.length}`);
  console.log(`total=${updated.length}`);
}

main();
