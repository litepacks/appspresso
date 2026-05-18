/**
 * Capacitor Background Runner — headless JS (outside the WebView).
 * Config: appspresso.config → app.backgroundRunner → capacitor.plugins.BackgroundRunner
 *
 * Every handler must call resolve() or reject().
 */

addEventListener("appspressoBackgroundTask", (resolve, reject) => {
  try {
    console.log("[BackgroundRunner] appspressoBackgroundTask");
    resolve({ ok: true });
  } catch (err) {
    reject(err);
  }
});

addEventListener("appspressoDemoPing", (resolve, reject, args) => {
  try {
    console.log(
      "[BackgroundRunner] appspressoDemoPing",
      JSON.stringify(args ?? {}),
    );
    resolve({ ok: true, received: args ?? {}, at: Date.now() });
  } catch (err) {
    reject(err);
  }
});
