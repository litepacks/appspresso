/// <reference types="vite/client" />

declare const __APSPRESSO_HOST__: string;
declare const __APSPRESSO_APP__: string;

import "appspresso/lib/dismiss-native-splash";
import "./loadDemoLocales";

import { HostAppFrame } from "appspresso/app/HostAppFrame";
import { bootAppspressoHost } from "appspresso/app/mount-host";
import type { AppspressoViteHostConfig } from "appspresso/build/inject-env";
import { parseViteDoubleJson } from "appspresso/build/inject-env";
import type { AppspressoAppMeta } from "appspresso/build/project-config";
import { DemoShowcaseApp } from "./DemoShowcaseApp";
import "./index.css";

const host = ((): AppspressoViteHostConfig => {
  const parsed =
    parseViteDoubleJson<AppspressoViteHostConfig>(__APSPRESSO_HOST__);
  if (!parsed) {
    throw new Error("Appspresso: invalid __APSPRESSO_HOST__");
  }
  return parsed;
})();
const appMeta = parseViteDoubleJson<AppspressoAppMeta>(__APSPRESSO_APP__);
if (appMeta) {
  document.title = appMeta.displayName;
}

function DemoRoot() {
  return (
    <HostAppFrame host={host}>
      <DemoShowcaseApp />
    </HostAppFrame>
  );
}

bootAppspressoHost({
  rootComponent: DemoRoot,
  rootElementId: host.mount.rootElementId,
  strictMode: host.mount.strictMode,
});
