import { describe, expect, it } from "vitest";
import { parseInjectedDefine } from "@/build/inject-env";
import { defineAppspressoProject } from "@/build/project-config";

describe("parseInjectedDefine", () => {
  it("unwraps double-stringified payload", () => {
    const inner = JSON.stringify({ a: 1, b: "two" });
    const raw = JSON.stringify(inner);
    expect(parseInjectedDefine<{ a: number; b: string }>(raw)).toEqual({
      a: 1,
      b: "two",
    });
  });

  it("returns null for JSON null payload", () => {
    expect(
      parseInjectedDefine(JSON.stringify(JSON.stringify(null))),
    ).toBeNull();
  });

  it("returns null on invalid input", () => {
    expect(parseInjectedDefine("{")).toBeNull();
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

  it("merges app.statusBar into Capacitor StatusBar plugin", () => {
    const { capacitor } = defineAppspressoProject({
      app: {
        id: "com.example.app",
        displayName: "Example",
        statusBar: {
          style: "DARK",
          backgroundColor: "#000000",
          overlaysWebView: true,
          hidden: true,
        },
      },
      capacitor: {
        plugins: {
          StatusBar: { overlaysWebView: false },
        },
      },
    });
    expect(capacitor.plugins?.StatusBar).toEqual({
      style: "DARK",
      backgroundColor: "#000000",
      overlaysWebView: false,
      _appspressoAndroidImmersive: true,
    });
  });

  it("merges app.sqlite into CapacitorSQLite plugin", () => {
    const { capacitor } = defineAppspressoProject({
      app: {
        id: "com.example.app",
        displayName: "Example",
        sqlite: {
          iosDatabaseLocation: "Library",
          iosIsEncryption: true,
          androidIsEncryption: false,
        },
      },
      capacitor: {},
    });
    expect(capacitor.plugins?.CapacitorSQLite).toEqual({
      iosDatabaseLocation: "Library",
      iosIsEncryption: true,
      androidIsEncryption: false,
    });
  });
});
