import { PlusIcon } from "@heroicons/react/24/outline";
import {
  AppContent,
  AppHeader,
  AppPage,
  AppToolbar,
} from "appspresso/components/shell";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "appspresso/components/ui/accordion";
import { Fab } from "appspresso/components/ui/fab";
import { useTranslation } from "react-i18next";

export function DemoShellPage() {
  const { t } = useTranslation("demo");

  return (
    <AppPage height="contained">
      <AppHeader>
        <AppToolbar title={t("shell.toolbarTitle")} />
      </AppHeader>
      <AppContent padding="md">
        <Accordion type="single" collapsible variant="card" defaultValue="a">
          <AccordionItem value="a">
            <AccordionTrigger>{t("shell.cardItem1Title")}</AccordionTrigger>
            <AccordionContent>{t("shell.cardItem1Body")}</AccordionContent>
          </AccordionItem>
          <AccordionItem value="b">
            <AccordionTrigger>{t("shell.cardItem2Title")}</AccordionTrigger>
            <AccordionContent>{t("shell.cardItem2Body")}</AccordionContent>
          </AccordionItem>
        </Accordion>

        <Accordion
          type="multiple"
          variant="flush"
          defaultValue={["x"]}
          className="mt-8"
        >
          <AccordionItem value="x">
            <AccordionTrigger>{t("shell.flushItem1Title")}</AccordionTrigger>
            <AccordionContent>{t("shell.flushItem1Body")}</AccordionContent>
          </AccordionItem>
          <AccordionItem value="y">
            <AccordionTrigger>{t("shell.flushItem2Title")}</AccordionTrigger>
            <AccordionContent>{t("shell.flushItem2Body")}</AccordionContent>
          </AccordionItem>
        </Accordion>
      </AppContent>

      <Fab
        type="button"
        aria-label={t("shell.fabLabel")}
        clearance="bottomNavigation"
      >
        <PlusIcon className="size-6 shrink-0" aria-hidden />
      </Fab>
    </AppPage>
  );
}
