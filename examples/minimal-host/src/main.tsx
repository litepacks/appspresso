import "appspresso/lib/dismiss-native-splash";
import "appspresso/theme/index.css";

import { HostAppFrame } from "appspresso/app/HostAppFrame";
import { bootAppspressoHost } from "appspresso/app/mount-host";
import { getAppspressoInjectedConfig } from "appspresso/build/injected-runtime";
import { AppRoot } from "./AppRoot";
import "./index.css";

const { host, app: appMeta } = getAppspressoInjectedConfig();

if (appMeta) {
  document.title = appMeta.displayName;
}

function Root() {
  return (
    <HostAppFrame host={host}>
      <AppRoot />
    </HostAppFrame>
  );
}

bootAppspressoHost({
  rootComponent: Root,
  rootElementId: host.mount.rootElementId,
  strictMode: host.mount.strictMode,
});
