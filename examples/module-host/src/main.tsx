import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { AppspressoHost } from "appspresso/app/AppspressoHost";
import { createAppspressoBrowserRouter } from "appspresso/app/router";
import { createModuleRegistry } from "appspresso/module";
import { modules } from "./appspresso.modules";
import "appspresso/theme/index.css";
import "./index.css";

const registry = createModuleRegistry(modules);
const router = createAppspressoBrowserRouter({
  modules: registry,
  legacyShowcase: false,
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppspressoHost modules={modules}>
      <RouterProvider router={router} />
    </AppspressoHost>
  </StrictMode>,
);
