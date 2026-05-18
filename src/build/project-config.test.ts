import { describe, expect, it } from "vitest";
import { parseViteDoubleJson } from "@/build/inject-env";
import { defineAppspressoProject } from "@/build/project-config";

describe("parseViteDoubleJson", () => {
  it("unwraps double-stringified payload", () => {
    const inner = JSON.stringify({ a: 1, b: "two" });
    const raw = JSON.stringify(inner);
    expect(parseViteDoubleJson<{ a: number; b: string }>(raw)).toEqual({
      a: 1,
      b: "two",
    });
  });

  it("returns null for JSON null payload", () => {
    expect(
      parseViteDoubleJson(JSON.stringify(JSON.stringify(null))),
    ).toBeNull();
  });

  it("returns null on invalid input", () => {
    expect(parseViteDoubleJson("{")).toBeNull();
  });
});

describe("defineAppspressoProject", () => {
  it("merges app ids and strips host-only splash keys from Capacitor plugin", () => {
    const { capacitor, app } = defineAppspressoProject({
      app: {
        id: "com.example.app",
        displayName: "Example",
        splash: {
          backgroundColor: "#112233",
          webPublicPath: "/splash.svg",
          webAnimation: "pulse",
          webBootstrapMinDurationMs: 800,
          webExitDurationMs: 400,
          image: "res/splash.png",
        },
      },
      capacitor: {
        plugins: {
          SplashScreen: {
            showSpinner: true,
          },
        },
      },
    });

    expect(capacitor.appId).toBe("com.example.app");
    expect(capacitor.appName).toBe("Example");
    expect(capacitor.plugins?.SplashScreen).toEqual({
      backgroundColor: "#112233",
      showSpinner: true,
    });
    expect(capacitor.plugins?.SplashScreen).not.toHaveProperty("webPublicPath");
    expect(capacitor.plugins?.SplashScreen).not.toHaveProperty("image");
    expect(capacitor.plugins?.SplashScreen).not.toHaveProperty("webAnimation");
    expect(capacitor.plugins?.SplashScreen).not.toHaveProperty(
      "webBootstrapMinDurationMs",
    );
    expect(capacitor.plugins?.SplashScreen).not.toHaveProperty(
      "webExitDurationMs",
    );
    expect(app?.splash?.webPublicPath).toBe("/splash.svg");
    expect(app?.splash?.webAnimation).toBe("pulse");
  });

  it("merges app.backgroundRunner into Capacitor BackgroundRunner plugin", () => {
    const { capacitor } = defineAppspressoProject({
      app: {
        id: "com.example.app",
        displayName: "Example",
        backgroundRunner: {
          enabled: true,
          event: "myEvent",
          autoStart: false,
        },
      },
      capacitor: {},
    });
    expect(capacitor.plugins?.BackgroundRunner).toEqual({
      label: "com.example.app.background",
      src: "runners/background.js",
      event: "myEvent",
      repeat: false,
      interval: 15,
      autoStart: false,
    });
  });

  it("omits BackgroundRunner when backgroundRunner.enabled is not true", () => {
    const { capacitor } = defineAppspressoProject({
      app: {
        id: "com.example.app",
        displayName: "Example",
        backgroundRunner: { enabled: false },
      },
      capacitor: {},
    });
    expect(capacitor.plugins?.BackgroundRunner).toBeUndefined();
  });

  it("lets capacitor override appId when set explicitly", () => {
    const { capacitor } = defineAppspressoProject({
      app: { id: "com.a", displayName: "A" },
      capacitor: {
        appId: "com.b",
        appName: "B",
      },
    });
    expect(capacitor.appId).toBe("com.b");
    expect(capacitor.appName).toBe("B");
  });
});
