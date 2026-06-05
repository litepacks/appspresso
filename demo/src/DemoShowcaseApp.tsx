/**
 * @deprecated Prefer `DemoBootstrapShell` + lazy `DemoAppContent` (native cold start).
 * Kept for tests and hosts that mount the full tree synchronously on web.
 */
export {
  DemoAppContent as DemoShowcaseApp,
  type DemoAppContentProps as DemoShowcaseAppProps,
} from "./DemoAppContent";
