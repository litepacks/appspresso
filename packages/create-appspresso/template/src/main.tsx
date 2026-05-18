/// <reference types="vite/client" />

import "appspresso/lib/dismiss-native-splash";
import "./loadDemoLocales";

import { HostAppFrame } from "appspresso/app/HostAppFrame";
import { bootAppspressoHost } from "appspresso/app/mount-host";
import { getAppspressoInjectedConfig } from "appspresso/build/injected-runtime";
import { DemoShowcaseApp } from "./DemoShowcaseApp";
import "./index.css";

const { host, app: appMeta } = getAppspressoInjectedConfig();

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
