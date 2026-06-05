/// <reference types="vite/client" />

import "appspresso/lib/dismiss-native-splash";
import "./loadDemoLocales";

import { bootAppspressoHost } from "appspresso/app/mount-host";
import { getAppspressoInjectedConfig } from "appspresso/build/injected-runtime";
import { DemoBootstrapShell } from "./DemoBootstrapShell";
import "./index.css";

const { host, app: appMeta } = getAppspressoInjectedConfig();

if (appMeta) {
  document.title = appMeta.displayName;
}

function DemoRoot() {
  return <DemoBootstrapShell host={host} />;
}

bootAppspressoHost({
  rootComponent: DemoRoot,
  rootElementId: host.mount.rootElementId,
  strictMode: host.mount.strictMode,
});
