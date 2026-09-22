import { describe, expect, it } from "vitest";
import { screenSafety } from "./screen";

describe("safety screen", () => {
  it("routes explicit self-harm language to urgent", () => {
    expect(screenSafety("Tôi không muốn sống nữa")).toBe("urgent");
  });

  it("keeps ordinary emotional language normal", () => {
    expect(screenSafety("Tôi thấy hơi buồn và cần nghỉ ngơi")).toBe("normal");
  });
});
