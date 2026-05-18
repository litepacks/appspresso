import type { IconName } from "appspresso/components/ui/icon";
import {
  type DeclarativeElementLeaf,
  declarativeElementLeavesToRouteObjects,
} from "appspresso/lib/declarative-routes";
import { DeckPage } from "./pages/DeckPage";
import { DemoShellPage } from "./pages/DemoShellPage";
import { MatchPage } from "./pages/MatchPage";
import { MorePage } from "./pages/MorePage";
import { StudyPage } from "./pages/StudyPage";
import { VocabHomePage } from "./pages/VocabHomePage";

/** Single list: bottom tab routes + `handle.demoNav`. */
export const demoShowcaseLeaves = [
  {
    index: true,
    element: <VocabHomePage />,
    handle: {
      demoTitleKey: "app.home.title",
      demoNav: {
        labelKey: "app.nav.home",
        to: "/",
        end: true,
        icon: "home",
      },
    },
  },
  {
    path: "study",
    element: <StudyPage />,
    handle: {
      demoTitleKey: "study.title",
      demoNav: {
        labelKey: "app.nav.study",
        to: "/study",
        end: false,
        icon: "book-open",
        badgeCount: 3,
      },
    },
  },
  {
    path: "deck",
    element: <DeckPage />,
    handle: {
      demoTitleKey: "deck.title",
      demoNav: {
        labelKey: "app.nav.deck",
        to: "/deck",
        end: false,
        icon: "queue-list",
        badgeCount: 12,
      },
    },
  },
  {
    path: "match",
    element: <MatchPage />,
    handle: {
      demoTitleKey: "match.title",
    },
  },
  {
    path: "more",
    element: <MorePage />,
    handle: {
      demoTitleKey: "more.title",
      demoNav: {
        labelKey: "app.nav.more",
        to: "/more",
        end: false,
        icon: "ellipsis-horizontal-circle",
      },
    },
  },
  {
    path: "features/shell",
    element: <DemoShellPage />,
    handle: {
      demoTitleKey: "shell.toolbarTitle",
    },
  },
] as const satisfies readonly DeclarativeElementLeaf[];

export const demoShowcaseChildRouteObjects =
  declarativeElementLeavesToRouteObjects(demoShowcaseLeaves);

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
