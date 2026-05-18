import { describe, expect, it } from "vitest";
import { dayjs, resolveDayjsLocale, setDayjsLocale } from "./dayjs";

describe("dayjs helpers", () => {
  it("resolveDayjsLocale maps tr and en", () => {
    expect(resolveDayjsLocale("tr")).toBe("tr");
    expect(resolveDayjsLocale("tr-TR")).toBe("tr");
    expect(resolveDayjsLocale("en")).toBe("en");
    expect(resolveDayjsLocale("en-US")).toBe("en");
    expect(resolveDayjsLocale("de")).toBe("en");
  });

  it("setDayjsLocale localizes relativeTime output", () => {
    setDayjsLocale("tr");
    expect(dayjs().subtract(2, "hour").fromNow()).toMatch(/2 saat önce/);

    setDayjsLocale("en");
    expect(dayjs().subtract(2, "hour").fromNow()).toMatch(/2 hours ago/);
  });
});
