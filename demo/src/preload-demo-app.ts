/** Warm lazy chunks while bootstrap splash is visible. */
export function preloadDemoAppChunks(): void {
  void import("./DemoAppContent");
  void import("./DemoAppRoutes");
}
