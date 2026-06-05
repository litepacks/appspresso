import { defineAppspressoRoutes } from "appspresso/studio";

export const routes = defineAppspressoRoutes({
  shell: "bottomTabs",
  tabs: [
    {
      id: "home",
      path: "",
      titleKey: "app.home.title",
      icon: "home",
      screen: "./pages/VocabHomePage",
      showTabBar: true,
    },
    {
      id: "study",
      path: "study",
      titleKey: "study.title",
      icon: "book-open",
      screen: "./pages/StudyPage",
      showTabBar: true,
    },
    {
      id: "deck",
      path: "deck",
      titleKey: "deck.title",
      icon: "queue-list",
      screen: "./pages/DeckPage",
      showTabBar: true,
    },
    {
      id: "more",
      path: "more",
      titleKey: "more.title",
      icon: "ellipsis-horizontal-circle",
      screen: "./pages/MorePage",
      showTabBar: true,
    },
  ],
  stack: [
    {
      path: "match",
      titleKey: "match.title",
      screen: "./pages/MatchPage",
      showTabBar: false,
    },
    {
      path: "features/shell",
      titleKey: "shell.toolbarTitle",
      screen: "./pages/DemoShellPage",
      showTabBar: false,
    },
  ],
  preApp: [
    {
      path: "auth/login",
      titleKey: "auth.login.title",
      screen: "appspresso/pages/AuthLoginPage",
      showTabBar: false,
      access: { guestOnly: true },
    },
  ],
});
