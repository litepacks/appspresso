import type { IconName } from "appspresso/components/ui/icon";
import {
  type DeclarativeLazyLeaf,
  declarativeLazyLeavesToRouteObjects,
} from "appspresso/lib/declarative-routes";

/** Single list: bottom tab routes + `handle.demoNav`. */
export const demoShowcaseLeaves = [
  {
    index: true,
    lazy: () =>
      import("./pages/VocabHomePage").then((m) => ({ default: m.VocabHomePage })),
    handle: {
      demoTitleKey: "app.home.title",
      demoNav: {
        labelKey: "app.nav.home",
        to: "/",
        end: true,
        icon: "home" as IconName,
      },
    },
  },
  {
    path: "study",
    lazy: () =>
      import("./pages/StudyPage").then((m) => ({ default: m.StudyPage })),
    handle: {
      demoTitleKey: "study.title",
      demoNav: {
        labelKey: "app.nav.study",
        to: "/study",
        end: false,
        icon: "book-open" as IconName,
        badgeCount: 3,
      },
    },
  },
  {
    path: "deck",
    lazy: () =>
      import("./pages/DeckPage").then((m) => ({ default: m.DeckPage })),
    handle: {
      demoTitleKey: "deck.title",
      demoNav: {
        labelKey: "app.nav.deck",
        to: "/deck",
        end: false,
        icon: "queue-list" as IconName,
        badgeCount: 12,
      },
    },
  },
  {
    path: "match",
    lazy: () =>
      import("./pages/MatchPage").then((m) => ({ default: m.MatchPage })),
    handle: {
      demoTitleKey: "match.title",
    },
  },
  {
    path: "more",
    lazy: () =>
      import("./pages/MorePage").then((m) => ({ default: m.MorePage })),
    handle: {
      demoTitleKey: "more.title",
      demoNav: {
        labelKey: "app.nav.more",
        to: "/more",
        end: false,
        icon: "ellipsis-horizontal-circle" as IconName,
      },
    },
  },
  {
    path: "features/shell",
    lazy: () =>
      import("./pages/DemoShellPage").then((m) => ({
        default: m.DemoShellPage,
      })),
    handle: {
      demoTitleKey: "shell.toolbarTitle",
    },
  },
] as const satisfies readonly DeclarativeLazyLeaf[];

export const demoShowcaseChildRouteObjects =
  declarativeLazyLeavesToRouteObjects(demoShowcaseLeaves);

export type DemoNavSpec = {
  labelKey: string;
  to: string;
  end?: boolean;
  icon: IconName;
  badgeCount?: number;
};

export function getDemoNavSpecs(): DemoNavSpec[] {
  return demoShowcaseLeaves
    .map((l) => (l.handle as { demoNav?: DemoNavSpec } | undefined)?.demoNav)
    .filter((n): n is DemoNavSpec => Boolean(n));
}

export type DemoRouteHandle = {
  demoNav?: DemoNavSpec;
  demoTitleKey?: string;
};

/** `AppTopBar` title: prefer `demoTitleKey`, else tab `demoNav.labelKey`. */
export function getDemoTitleKey(handle: unknown): string {
  const h = handle as DemoRouteHandle | undefined;
  return h?.demoTitleKey ?? h?.demoNav?.labelKey ?? "app.nav.home";
}
