/**
 * Demo runner — aligned with `backgroundRunner.event` in `demo/appspresso.config.ts`.
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
