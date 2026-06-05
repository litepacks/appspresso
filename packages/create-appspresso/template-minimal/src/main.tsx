import "appspresso/lib/dismiss-native-splash";
import "appspresso/theme/index.css";

import { AppspressoHost } from "appspresso/app/AppspressoHost";
import { HostAppFrame } from "appspresso/app/HostAppFrame";
import { bootAppspressoHost } from "appspresso/app/mount-host";
import { getAppspressoInjectedConfig } from "appspresso/build/injected-runtime";
import { AppRoot } from "./AppRoot";
import { plugins } from "./appspresso.plugins";
import "./index.css";

const { host, app: appMeta } = getAppspressoInjectedConfig();

if (appMeta) {
  document.title = appMeta.displayName;
}

function Root() {
  return (
    <AppspressoHost plugins={plugins} omit={["revenueCat", "notification"]}>
      <HostAppFrame host={host}>
        <AppRoot />
      </HostAppFrame>
    </AppspressoHost>
  );
}

bootAppspressoHost({
  rootComponent: Root,
  rootElementId: host.mount.rootElementId,
  strictMode: host.mount.strictMode,
});
