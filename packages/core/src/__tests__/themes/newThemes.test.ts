import { describe, expect, it } from "vitest";
import { bloombergEditorialTheme, orientalInkTheme } from "../../themes";

describe("New Creator Themes (新增高质感排版主题)", () => {
  it("should define bloomberg-editorial theme with authoritative styling", () => {
    expect(bloombergEditorialTheme).toContain("#ahafair");
    expect(bloombergEditorialTheme).toContain("Georgia");
    expect(bloombergEditorialTheme).toContain("border-top: 3px double #1c1917");
    expect(bloombergEditorialTheme).toContain("#b45309");
  });

  it("should define oriental-ink theme with aesthetic cyan and cinnabar styling", () => {
    expect(orientalInkTheme).toContain("#ahafair");
    expect(orientalInkTheme).toContain("Songti SC");
    expect(orientalInkTheme).toContain("#2c5e5d");
    expect(orientalInkTheme).toContain("#c2410c");
    expect(orientalInkTheme).toContain("#fbfaf5");
  });
});
