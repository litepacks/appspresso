import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "appspresso/components/form";
import { AppModal } from "appspresso/components/ui/app-modal";
import { Button } from "appspresso/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "appspresso/components/ui/card";
import { Checkbox } from "appspresso/components/ui/checkbox";
import Image from "appspresso/components/ui/image";
import { Input } from "appspresso/components/ui/input";
import { Label } from "appspresso/components/ui/label";
import { Page } from "appspresso/components/ui/page";
import {
  RadioGroup,
  RadioGroupItem,
} from "appspresso/components/ui/radio-group";
import {
  Range,
  RangeHighlight,
  RangeThumb,
  RangeTrack,
} from "appspresso/components/ui/range";
import { Segment, SegmentItem } from "appspresso/components/ui/segment";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "appspresso/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "appspresso/components/ui/tabs";
import { Toggle } from "appspresso/components/ui/toggle";
import type { ThemePreference } from "appspresso/config/types";
import { publicAssetUrl } from "appspresso/lib/public-asset";
import { toast } from "appspresso/lib/toast";
import { themePreferenceAtom } from "appspresso/state/atoms";
import { useAtom } from "jotai";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { z } from "zod";

export function MorePage() {
  const { t } = useTranslation("demo");
  const [pref, setPref] = useAtom(themePreferenceAtom);
  const [modalOpen, setModalOpen] = useState(false);
  const [formOk, setFormOk] = useState(false);
  const [demoCheckbox, setDemoCheckbox] = useState(false);
  const [demoRadio, setDemoRadio] = useState("daily");
  const [demoSegment, setDemoSegment] = useState("default");
  const [demoRange, setDemoRange] = useState([42]);
  const [demoToggle, setDemoToggle] = useState(false);

  const demoFormSchema = useMemo(
    () =>
      z.object({
        nickname: z.string().min(2, { message: t("more.formNickError") }),
        demoSelect: z.string().min(1, { message: t("more.selectError") }),
      }),
    [t],
  );

  type DemoFormValues = z.infer<typeof demoFormSchema>;

  const form = useForm<DemoFormValues>({
    resolver: zodResolver(demoFormSchema),
    defaultValues: { nickname: "", demoSelect: "starter" },
  });

  return (
    <Page>
      <h1 className="text-xl font-semibold">{t("more.title")}</h1>
      <p className="text-muted-foreground text-sm leading-relaxed">
        {t("more.body")}
      </p>

      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-base">{t("more.themeTitle")}</CardTitle>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {t("more.themeHint")}
          </p>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <Tabs
            value={pref}
            onValueChange={(v) => setPref(v as ThemePreference)}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="system">{t("more.themeSystem")}</TabsTrigger>
              <TabsTrigger value="light">{t("more.themeLight")}</TabsTrigger>
              <TabsTrigger value="dark">{t("more.themeDark")}</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-base">{t("more.stackTitle")}</CardTitle>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {t("more.stackBody")}
          </p>
          <Link
            to="/features/shell"
            className="mt-3 inline-flex text-primary text-sm font-medium underline-offset-4 hover:underline"
          >
            {t("more.shellLink")}
          </Link>
          <Button
            type="button"
            variant="secondary"
            className="mt-3 w-full sm:w-auto"
            onClick={() => setModalOpen(true)}
          >
            {t("more.modalCta")}
          </Button>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-base">{t("more.mockAuthTitle")}</CardTitle>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {t("more.mockAuthBody")}
          </p>
          <Link
            to="/auth/login"
            className="mt-3 inline-flex text-primary text-sm font-medium underline-offset-4 hover:underline"
          >
            {t("more.mockAuthCta")}
          </Link>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-base">{t("more.toastTitle")}</CardTitle>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {t("more.toastBody")}
          </p>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2 p-4 pt-0">
          <Button
            type="button"
            variant="secondary"
            onClick={() => toast.success(t("more.toastSuccessMsg"))}
          >
            {t("more.toastSuccessCta")}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => toast.error(t("more.toastErrorMsg"))}
          >
            {t("more.toastErrorCta")}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              toast.promise(
                new Promise<void>((resolve) => {
                  window.setTimeout(resolve, 1200);
                }),
                {
                  loading: t("more.toastPromiseLoading"),
                  success: t("more.toastPromiseSuccess"),
                  error: t("more.toastErrorMsg"),
                },
              )
            }
          >
            {t("more.toastPromiseCta")}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-base">
            {t("more.imageCardTitle")}
          </CardTitle>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {t("more.imageCardBody")}
          </p>
        </CardHeader>
        <CardContent className="space-y-4 p-4 pt-0">
          <div>
            <p className="mb-2 font-medium text-muted-foreground text-xs uppercase tracking-wide">
              {t("more.imageDemoOkCaption")}
            </p>
            <Image
              src={publicAssetUrl("icon.svg")}
              alt={t("more.imageDemoOkAlt")}
              className="max-h-24 rounded-xl border border-border/50 bg-muted/30"
            />
          </div>
          <div>
            <p className="mb-2 font-medium text-muted-foreground text-xs uppercase tracking-wide">
              {t("more.imageDemoBadCaption")}
            </p>
            <Image
              src={publicAssetUrl("__appspresso_demo_missing__.png")}
              alt={t("more.imageDemoBadAlt")}
              className="max-h-24 rounded-xl border border-border/50"
            />
          </div>
          <div>
            <p className="mb-2 font-medium text-muted-foreground text-xs uppercase tracking-wide">
              {t("more.imageDemoFillCaption")}
            </p>
            <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border/50 bg-muted/40">
              <Image
                src={publicAssetUrl("splash.svg")}
                alt={t("more.imageDemoFillAlt")}
                fill
                fit="cover"
                previewModal
                previewModalTitle={t("more.imageDemoModalTitle")}
                previewModalFit="contain"
                previewModalAriaLabel={t("more.imageDemoModalAria")}
              />
            </div>
          </div>
          <div>
            <p className="mb-2 font-medium text-muted-foreground text-xs uppercase tracking-wide">
              {t("more.imageDemoFullWidthCaption")}
            </p>
            <div className="max-h-40 overflow-hidden rounded-xl border border-border/50 bg-muted/30">
              <Image
                src={publicAssetUrl("icon.svg")}
                alt={t("more.imageDemoOkAlt")}
                fullWidth
                fit="contain"
                className="max-h-40"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-base">{t("more.formCardTitle")}</CardTitle>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {t("more.formCardBody")}
          </p>
          <div className="mt-3 flex items-start gap-3 rounded-xl border border-border/60 bg-muted/25 p-3">
            <Checkbox
              id="more-demo-checkbox"
              checked={demoCheckbox}
              onCheckedChange={(v) => setDemoCheckbox(v === true)}
              className="mt-0.5"
            />
            <Label
              htmlFor="more-demo-checkbox"
              className="cursor-pointer font-normal text-muted-foreground text-sm leading-snug"
            >
              {t("more.checkboxHint")}
            </Label>
          </div>
          <div className="mt-4">
            <p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
              {t("more.toggleCaption")}
            </p>
            <div className="mt-2 flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/25 p-3">
              <Label
                htmlFor="more-demo-toggle"
                className="cursor-pointer font-normal text-muted-foreground text-sm leading-snug"
              >
                {t("more.toggleHint")}
              </Label>
              <Toggle
                id="more-demo-toggle"
                checked={demoToggle}
                onCheckedChange={setDemoToggle}
                aria-label={t("more.toggleAria")}
              />
            </div>
          </div>
          <div className="mt-4">
            <p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
              {t("more.radioCaption")}
            </p>
            <RadioGroup
              value={demoRadio}
              onValueChange={setDemoRadio}
              className="mt-2 flex flex-col gap-2.5 rounded-xl border border-border/60 bg-muted/25 p-3"
              aria-label={t("more.radioAria")}
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="daily" id="more-radio-daily" />
                <Label
                  htmlFor="more-radio-daily"
                  className="cursor-pointer font-normal text-sm leading-snug"
                >
                  {t("more.radioDaily")}
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="weekly" id="more-radio-weekly" />
                <Label
                  htmlFor="more-radio-weekly"
                  className="cursor-pointer font-normal text-sm leading-snug"
                >
                  {t("more.radioWeekly")}
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="monthly" id="more-radio-monthly" />
                <Label
                  htmlFor="more-radio-monthly"
                  className="cursor-pointer font-normal text-sm leading-snug"
                >
                  {t("more.radioMonthly")}
                </Label>
              </div>
            </RadioGroup>
          </div>
          <div className="mt-4 space-y-3">
            <p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
              {t("more.segmentCaption")}
            </p>
            <Segment
              value={demoSegment}
              onValueChange={setDemoSegment}
              className="max-w-sm"
              aria-label={t("more.segmentAria")}
            >
              <SegmentItem value="default">
                {t("more.segmentDefault")}
              </SegmentItem>
              <SegmentItem value="segment">
                {t("more.segmentSecond")}
              </SegmentItem>
            </Segment>
            <Segment
              defaultValue="seg-b"
              disabled
              className="max-w-sm"
              aria-label={t("more.segmentDisabledCaption")}
            >
              <SegmentItem value="seg-a">
                {t("more.segmentDisabledCaption")}
              </SegmentItem>
              <SegmentItem value="seg-b">{t("more.segmentSecond")}</SegmentItem>
            </Segment>
          </div>
          <div className="mt-4">
            <p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
              {t("more.rangeCaption")}
            </p>
            <Range
              value={demoRange}
              onValueChange={setDemoRange}
              max={100}
              step={1}
              className="mt-2 max-w-sm"
            >
              <RangeTrack>
                <RangeHighlight />
              </RangeTrack>
              <RangeThumb aria-label={t("more.rangeAria")} />
            </Range>
            <p className="mt-1.5 text-muted-foreground text-xs">
              {t("more.rangeValueLabel", { value: demoRange[0] ?? 0 })}
            </p>
          </div>
          <Form {...form}>
            <form
              className="mt-3 space-y-3"
              onSubmit={form.handleSubmit(() => {
                setFormOk(true);
              })}
            >
              <FormField
                control={form.control}
                name="nickname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("more.formNickLabel")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("more.formNickPlaceholder")}
                        autoComplete="nickname"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="demoSelect"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("more.selectLabel")}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t("more.selectPlaceholder")}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="starter">
                          {t("more.selectStarter")}
                        </SelectItem>
                        <SelectItem value="plus">
                          {t("more.selectPlus")}
                        </SelectItem>
                        <SelectItem value="pro">
                          {t("more.selectPro")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full sm:w-auto">
                {t("more.formSubmit")}
              </Button>
              {formOk ? (
                <p className="text-muted-foreground text-xs">
                  {t("more.formSuccess")}
                </p>
              ) : null}
            </form>
          </Form>
        </CardHeader>
      </Card>

      <AppModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={t("more.modalTitle")}
      >
        <p className="text-muted-foreground text-sm leading-relaxed">
          {t("more.modalBody")}
        </p>
      </AppModal>

      <p className="text-muted-foreground text-xs">{t("more.readmeHint")}</p>
    </Page>
  );
}
