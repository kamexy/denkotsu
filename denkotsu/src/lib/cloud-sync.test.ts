import { describe, expect, it } from "vitest";
import { generateStrongSyncId, validateSyncId } from "./cloud-sync";

describe("validateSyncId", () => {
  it("有効な同期コードを許可する", () => {
    expect(validateSyncId("dkt-ab12-cd34-ef56")).toBeNull();
  });

  it("短すぎる同期コードを拒否する", () => {
    expect(validateSyncId("ab12-cd34")).toContain("12〜64文字");
  });

  it("英字または数字のどちらかが欠けるコードを拒否する", () => {
    expect(validateSyncId("abcdefghijklmnop")).toContain("英字と数字");
    expect(validateSyncId("123456789012")).toContain("英字と数字");
  });

  it("使用不可文字や構成要件を満たさないコードを拒否する", () => {
    expect(validateSyncId("abc123!!!!!!")).toContain("英数字・ハイフン・アンダースコア");
    expect(validateSyncId("aaaaaaaaaaaa")).toContain("英字と数字");
  });
});

describe("generateStrongSyncId", () => {
  it("生成したコードが必ずバリデーションを通過する", () => {
    for (let i = 0; i < 20; i += 1) {
      const generated = generateStrongSyncId();
      expect(generated.startsWith("dkt-")).toBe(true);
      expect(validateSyncId(generated)).toBeNull();
    }
  });
});
