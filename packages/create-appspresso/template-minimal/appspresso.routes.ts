import { defineAppspressoRoutes } from "appspresso/studio";

export const routes = defineAppspressoRoutes({
  shell: "bottomTabs",
  tabs: [
    {
      id: "home",
      path: "",
      titleKey: "app.home.title",
      icon: "home",
      screen: "./pages/HomePage",
      showTabBar: true,
    },
  ],
  stack: [],
  preApp: [],
});
