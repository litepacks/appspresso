import { Capacitor } from "@capacitor/core";
import { Button, buttonVariants } from "appspresso/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "appspresso/components/ui/card";
import { CircleProgress } from "appspresso/components/ui/circle-progress";
import { Countdown } from "appspresso/components/ui/countdown";
import {
  Drawer,
  DrawerContent,
  DrawerMenuGroup,
  DrawerMenuItem,
  DrawerMenuSeparator,
  DrawerNavBody,
  DrawerProfileHeader,
  DrawerTrigger,
} from "appspresso/components/ui/drawer";
import { Input } from "appspresso/components/ui/input";
import { Segment, SegmentItem } from "appspresso/components/ui/segment";
import { Skeleton } from "appspresso/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "appspresso/components/ui/tooltip";
import { useAppActiveTransition } from "appspresso/hooks/useAppActiveTransition";
import { useBackgroundRunner } from "appspresso/hooks/useBackgroundRunner";
import { useFilesystem } from "appspresso/hooks/useFilesystem";
import { useInAppBrowser } from "appspresso/hooks/useInAppBrowser";
import { useAppInfo } from "appspresso/hooks/useAppInfo";
import { useAppPermission } from "appspresso/hooks/useAppPermission";
import { useClipboard } from "appspresso/hooks/useClipboard";
import { useDeviceMotion } from "appspresso/hooks/useDeviceMotion";
import { useDeviceOrientation } from "appspresso/hooks/useDeviceOrientation";
import { useNativeLocation } from "appspresso/hooks/useNativeLocation";
import { useNativeShare } from "appspresso/hooks/useNativeShare";
import { getTelHref, usePhoneDial } from "appspresso/hooks/usePhoneDial";
import { publicAssetUrl } from "appspresso/lib/public-asset";
import { toast } from "appspresso/lib/toast";
import { cn } from "appspresso/lib/utils";
import { splashWebAnimationLoops } from "appspresso/motion";
import {
  AtSymbolIcon,
  BellSlashIcon,
  BookOpenIcon,
  Cog6ToothIcon,
  FaceSmileIcon,
  RectangleStackIcon,
  StarIcon,
  UserIcon,
  UserPlusIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { scheduleTestNotification } from "appspresso/services/local-notification.service";
import { motion, useReducedMotion } from "motion/react";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

const DEMO_PHONE = "+1 555 010 0199";
/** `demo/appspresso.config.ts` → `app.backgroundRunner.event` */
const DEMO_BACKGROUND_RUNNER_EVENT = "appspressoDemoPing";

const SPLASH_PREVIEW_KEYS = [
  "pulse",
  "float",
  "breathe",
  "sway",
  "glow",
] as const;

type SplashPreviewKey = (typeof SPLASH_PREVIEW_KEYS)[number];

export function KitPlaygroundCard() {
  const { t } = useTranslation("demo");
  const pk = "more.playground" as const;

  const [countdownEnd] = useState(() => Date.now() + 120_000);
  const [progress, setProgress] = useState(35);
  const [circleIndeterminate, setCircleIndeterminate] = useState(false);
  const [lifecycleEdge, setLifecycleEdge] = useState<string | null>(null);

  const { share, supported: shareOk } = useNativeShare();
  const loc = useNativeLocation({ requestOnMount: false });
  const ori = useDeviceOrientation();
  const mot = useDeviceMotion();
  const { dial, canDial } = usePhoneDial();
  const clip = useClipboard({ copiedResetMs: 1500 });
  const appInfo = useAppInfo();
  const bgRunner = useBackgroundRunner();
  const fs = useFilesystem();
  const browser = useInAppBrowser();
  const [fsPreview, setFsPreview] = useState<string | null>(null);
  const localNotifPerm = useAppPermission("localNotifications");
  const [clipField, setClipField] = useState("Appspresso demo");
  const [splashPreview, setSplashPreview] =
    useState<SplashPreviewKey>("breathe");
  const splashReduceMotion = useReducedMotion();

  useAppActiveTransition({
    onBackground: () => setLifecycleEdge(t(`${pk}.lifecycleBg`)),
    onForeground: () => setLifecycleEdge(t(`${pk}.lifecycleFg`)),
  });

  const onShare = useCallback(async () => {
    if (!shareOk) {
      toast.message(t(`${pk}.shareUnsupported`));
      return;
    }
    try {
      await share({
        title: "Appspresso",
        text: t(`${pk}.shareBody`),
        url: typeof window !== "undefined" ? window.location.href : "",
      });
      toast.success(t(`${pk}.shareOk`));
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      toast.error(t(`${pk}.shareErr`));
    }
  }, [share, shareOk, t, pk]);

  const scheduleLocalDemo = useCallback(
    async (delayMs: number) => {
      const title = t(`${pk}.localNotif`);
      const body = t(`${pk}.shareBody`);
      const r = await scheduleTestNotification(title, body, {
        delayMs,
        requestPermissionIfNeeded: true,
      });
      if (r.ok) {
        toast.success(
          delayMs > 0
            ? `${t(`${pk}.localNotifOk`)} (${Math.round(delayMs / 1000)}s)`
            : t(`${pk}.localNotifOk`),
        );
        return;
      }
      if (r.reason === "web") {
        toast.message(t(`${pk}.localNotifWeb`));
        return;
      }
      if (r.reason === "denied") {
        toast.error(t(`${pk}.localNotifDenied`));
        return;
      }
      if (r.reason === "prompt") {
        toast.message(t(`${pk}.localNotifPrompt`));
        return;
      }
      toast.error(t(`${pk}.localNotifFail`));
    },
    [t, pk],
  );

  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle className="text-base">{t(`${pk}.title`)}</CardTitle>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {t(`${pk}.intro`)}
        </p>
      </CardHeader>
      <CardContent className="space-y-8 p-4 pt-0">
        <section className="space-y-2">
          <p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
            {t(`${pk}.skeleton`)}
          </p>
          <div className="flex items-center gap-3">
            <Skeleton className="size-12 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4 max-w-xs" />
              <Skeleton className="h-4 w-1/2 max-w-[12rem]" />
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
            {t(`${pk}.tooltip`)}
          </p>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {t(`${pk}.tooltipHint`)}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button type="button" variant="outline" size="icon" aria-label={t(`${pk}.tooltipTriggerLabel`)}>
                  <InformationCircleIcon className="size-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">{t(`${pk}.tooltipBody`)}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button type="button" variant="secondary" size="sm">
                  {t(`${pk}.tooltipHoverCta`)}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-[14rem]">
                {t(`${pk}.tooltipBodyLong`)}
              </TooltipContent>
            </Tooltip>
          </div>
        </section>

        <section className="space-y-2">
          <p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
            {t(`${pk}.drawer`)}
          </p>
          <Drawer>
            <DrawerTrigger asChild>
              <Button type="button" variant="secondary">
                {t(`${pk}.drawerCta`)}
              </Button>
            </DrawerTrigger>
            <DrawerContent
              layout="nav"
              side="left"
              aria-label={t(`${pk}.drawerTitle`)}
            >
              <DrawerProfileHeader
                title={t(`${pk}.drawerProfileTitle`)}
                subtitle={t(`${pk}.drawerProfileSubtitle`)}
                avatar={
                  <img
                    src={publicAssetUrl("icon.svg")}
                    alt=""
                    className="size-full object-cover"
                  />
                }
              />
              <DrawerNavBody>
                <DrawerMenuGroup>
                  <DrawerMenuItem
                    icon={
                      <FaceSmileIcon className="text-muted-foreground" />
                    }
                  >
                    {t(`${pk}.drawerItemStatus`)}
                  </DrawerMenuItem>
                  <DrawerMenuItem
                    icon={
                      <BellSlashIcon className="text-muted-foreground" />
                    }
                  >
                    {t(`${pk}.drawerItemSnooze`)}
                  </DrawerMenuItem>
                </DrawerMenuGroup>
                <DrawerMenuSeparator />
                <DrawerMenuGroup>
                  <DrawerMenuItem
                    icon={<AtSymbolIcon className="text-red-500" />}
                  >
                    {t(`${pk}.drawerItemActivity`)}
                  </DrawerMenuItem>
                  <DrawerMenuItem
                    icon={<StarIcon className="text-amber-500" />}
                  >
                    {t(`${pk}.drawerItemStarred`)}
                  </DrawerMenuItem>
                  <DrawerMenuItem
                    icon={
                      <RectangleStackIcon className="text-sky-500" />
                    }
                  >
                    {t(`${pk}.drawerItemFiles`)}
                  </DrawerMenuItem>
                  <DrawerMenuItem
                    icon={<BookOpenIcon className="text-rose-500" />}
                  >
                    {t(`${pk}.drawerItemDirectory`)}
                  </DrawerMenuItem>
                </DrawerMenuGroup>
                <DrawerMenuSeparator />
                <DrawerMenuGroup>
                  <DrawerMenuItem
                    icon={
                      <UserPlusIcon className="text-muted-foreground" />
                    }
                  >
                    {t(`${pk}.drawerItemInvite`)}
                  </DrawerMenuItem>
                  <DrawerMenuItem
                    icon={<UserIcon className="text-muted-foreground" />}
                  >
                    {t(`${pk}.drawerItemProfile`)}
                  </DrawerMenuItem>
                  <DrawerMenuItem
                    icon={
                      <Cog6ToothIcon className="text-muted-foreground" />
                    }
                  >
                    {t(`${pk}.drawerItemSettings`)}
                  </DrawerMenuItem>
                </DrawerMenuGroup>
              </DrawerNavBody>
            </DrawerContent>
          </Drawer>
        </section>

        <section className="space-y-3">
          <p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
            {t(`${pk}.motionSplashTitle`)}
          </p>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {t(`${pk}.motionSplashHint`)}
          </p>
          <Segment
            value={splashPreview}
            onValueChange={(v) => setSplashPreview(v as SplashPreviewKey)}
            className="max-w-full min-w-0 flex-wrap"
            aria-label={t(`${pk}.motionSplashTitle`)}
          >
            {SPLASH_PREVIEW_KEYS.map((k) => (
              <SegmentItem key={k} value={k}>
                {t(`${pk}.splashAnim.${k}`)}
              </SegmentItem>
            ))}
          </Segment>
          <div className="flex min-h-[9rem] items-center justify-center rounded-2xl border border-border/60 bg-muted/25 p-6">
            {splashReduceMotion === true ? (
              <p className="max-w-sm text-center text-muted-foreground text-sm">
                {t(`${pk}.motionSplashReduced`)}
              </p>
            ) : (
              <motion.div
                key={splashPreview}
                className="flex justify-center"
                initial={false}
                animate={splashWebAnimationLoops[splashPreview].animate}
                transition={splashWebAnimationLoops[splashPreview].transition}
              >
                <img
                  src={publicAssetUrl("icon.svg")}
                  alt=""
                  className="h-20 w-20 object-contain select-none"
                  draggable={false}
                />
              </motion.div>
            )}
          </div>
        </section>

        <section className="space-y-2">
          <p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
            {t(`${pk}.countdown`)}
          </p>
          <Countdown
            endAt={countdownEnd}
            className="text-lg font-semibold"
            aria-label={t(`${pk}.countdown`)}
          />
        </section>

        <section className="space-y-3">
          <p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
            {t(`${pk}.circleProgress`)}
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <CircleProgress
              value={progress}
              max={100}
              size="lg"
              showValueLabel={!circleIndeterminate}
              indeterminate={circleIndeterminate}
              aria-label={t(`${pk}.circleProgress`)}
            />
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() =>
                    setProgress((p) => Math.max(0, Math.min(100, p - 15)))
                  }
                >
                  −15
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() =>
                    setProgress((p) => Math.max(0, Math.min(100, p + 15)))
                  }
                >
                  +15
                </Button>
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-muted-foreground text-sm">
                <input
                  type="checkbox"
                  checked={circleIndeterminate}
                  onChange={(e) => setCircleIndeterminate(e.target.checked)}
                />
                {t(`${pk}.circleIndeterminate`)}
              </label>
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
            {t(`${pk}.share`)}
          </p>
          <Button
            type="button"
            variant="secondary"
            onClick={() => void onShare()}
          >
            {t(`${pk}.shareCta`)}
          </Button>
        </section>

        <section className="space-y-2">
          <p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
            {t(`${pk}.inAppBrowser`)}
          </p>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {t(`${pk}.inAppBrowserHint`)}
          </p>
          {!browser.available ? (
            <p className="text-muted-foreground text-xs">
              {t(`${pk}.inAppBrowserUnavailable`)}
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() =>
                  void browser
                    .openInternal("https://capacitorjs.com/docs/apis/inappbrowser")
                    .catch((e: unknown) =>
                      toast.error(
                        t(`${pk}.inAppBrowserErr`, {
                          message: e instanceof Error ? e.message : String(e),
                        }),
                      ),
                    )
                }
              >
                {t(`${pk}.inAppBrowserInternalWebView`)}
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() =>
                  void browser
                    .openInternal("https://capacitorjs.com", {
                      mode: "system",
                    })
                    .catch((e: unknown) =>
                      toast.error(
                        t(`${pk}.inAppBrowserErr`, {
                          message: e instanceof Error ? e.message : String(e),
                        }),
                      ),
                    )
                }
              >
                {t(`${pk}.inAppBrowserInternalSystem`)}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  void browser
                    .openExternal("https://ionic.io")
                    .catch((e: unknown) =>
                      toast.error(
                        t(`${pk}.inAppBrowserErr`, {
                          message: e instanceof Error ? e.message : String(e),
                        }),
                      ),
                    )
                }
              >
                {t(`${pk}.inAppBrowserExternal`)}
              </Button>
            </div>
          )}
        </section>

        <section className="space-y-2">
          <p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
            {t(`${pk}.localNotif`)}
          </p>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {t(`${pk}.localNotifHint`)}
          </p>
          <p className="text-muted-foreground text-xs">
            {t(`${pk}.permState`, { state: localNotifPerm.status })}
          </p>
          <div className="flex flex-wrap gap-2">
            {localNotifPerm.status === "prompt" ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={!Capacitor.isNativePlatform()}
                onClick={() => void localNotifPerm.request()}
              >
                {t(`${pk}.localNotifReq`)}
              </Button>
            ) : null}
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={!Capacitor.isNativePlatform()}
              onClick={() => void scheduleLocalDemo(0)}
            >
              {t(`${pk}.localNotifCtaNow`)}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={!Capacitor.isNativePlatform()}
              onClick={() => void scheduleLocalDemo(5000)}
            >
              {t(`${pk}.localNotifCta5s`)}
            </Button>
          </div>
        </section>

        <section className="space-y-2">
          <p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
            {t(`${pk}.location`)}
          </p>
          <Button
            type="button"
            variant="secondary"
            disabled={!loc.supported || loc.loading}
            onClick={() =>
              void loc.refresh().catch(() => toast.error(t(`${pk}.locErr`)))
            }
          >
            {loc.loading ? "…" : t(`${pk}.locationCta`)}
          </Button>
          <pre className="max-h-32 overflow-auto rounded-lg bg-muted/40 p-2 text-xs">
            {loc.location
              ? `${loc.coords.latitude.toFixed(5)}, ${loc.coords.longitude.toFixed(5)} (±${Math.round(loc.coords.accuracy)}m)`
              : loc.error
                ? `${t(`${pk}.locErr`)} (${loc.error.code})`
                : t(`${pk}.locationWait`)}
          </pre>
        </section>

        <section className="space-y-2">
          <p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
            {t(`${pk}.orientation`)}
          </p>
          {!ori.supported ? (
            <p className="text-muted-foreground text-xs">
              {t(`${pk}.sensorUnsupported`)}
            </p>
          ) : (
            <>
              <p className="text-muted-foreground text-xs">
                {t(`${pk}.permState`, { state: ori.permission })}
              </p>
              {ori.permission === "prompt" ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => void ori.requestPermission()}
                >
                  {t(`${pk}.orientationReq`)}
                </Button>
              ) : null}
              <pre className="max-h-28 overflow-auto rounded-lg bg-muted/40 p-2 text-xs">
                {ori.reading
                  ? JSON.stringify(ori.reading, null, 2)
                  : t(`${pk}.noReading`)}
              </pre>
            </>
          )}
        </section>

        <section className="space-y-2">
          <p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
            {t(`${pk}.motion`)}
          </p>
          {!mot.supported ? (
            <p className="text-muted-foreground text-xs">
              {t(`${pk}.sensorUnsupported`)}
            </p>
          ) : (
            <>
              <p className="text-muted-foreground text-xs">
                {t(`${pk}.permState`, { state: mot.permission })}
              </p>
              {mot.permission === "prompt" ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => void mot.requestPermission()}
                >
                  {t(`${pk}.motionReq`)}
                </Button>
              ) : null}
              <pre className="max-h-28 overflow-auto rounded-lg bg-muted/40 p-2 text-xs">
                {mot.reading
                  ? JSON.stringify(mot.reading, null, 2)
                  : t(`${pk}.noReading`)}
              </pre>
            </>
          )}
        </section>

        <section className="space-y-2">
          <p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
            {t(`${pk}.phone`)}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={!canDial(DEMO_PHONE)}
              onClick={() => dial(DEMO_PHONE)}
            >
              {t(`${pk}.phoneCta`)}
            </Button>
            <a
              className="text-primary text-sm underline-offset-4 hover:underline"
              href={getTelHref(DEMO_PHONE) ?? "#"}
            >
              {DEMO_PHONE}
            </a>
          </div>
        </section>

        <section className="space-y-2">
          <p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
            {t(`${pk}.clipboard`)}
          </p>
          <Input
            value={clipField}
            onChange={(e) => setClipField(e.target.value)}
            placeholder={t(`${pk}.clipboardHint`)}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={!clip.writeSupported}
              onClick={() => void clip.copy(clipField)}
            >
              {clip.copied
                ? t(`${pk}.clipboardCopied`)
                : t(`${pk}.clipboardCopy`)}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={!clip.readSupported}
              onClick={() =>
                void clip
                  .paste()
                  .then((v) => {
                    setClipField(v);
                    toast.success(t(`${pk}.clipboardPasted`));
                  })
                  .catch(() => toast.error(t(`${pk}.clipboardErr`)))
              }
            >
              {t(`${pk}.clipboardPaste`)}
            </Button>
          </div>
        </section>

        <section className="space-y-2">
          <p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
            {t(`${pk}.appInfo`)}
          </p>
          <pre className="overflow-auto rounded-lg bg-muted/40 p-2 text-xs">
            {JSON.stringify(
              {
                version: appInfo.version,
                displayName: appInfo.displayName,
                appId: appInfo.appId,
                description: appInfo.description,
              },
              null,
              2,
            )}
          </pre>
        </section>

        <section className="space-y-2">
          <p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
            {t(`${pk}.filesystem`)}
          </p>
          <p className="text-muted-foreground text-xs leading-relaxed">
            {t(`${pk}.filesystemHint`)}
          </p>
          {!fs.ready ? (
            <p className="text-muted-foreground text-xs">
              {t(`${pk}.filesystemUnavailable`)}
            </p>
          ) : (
            <motion.div
              layout
              className="flex flex-wrap gap-2"
              transition={{ duration: 0.2 }}
            >
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() =>
                  void fs
                    .writeText("playground/hello.txt", `Hello at ${Date.now()}\n`, {
                      encoding: "utf8",
                    })
                    .then((uri) => {
                      setFsPreview(uri);
                      toast.success(t(`${pk}.filesystemWriteOk`));
                    })
                    .catch((e: unknown) =>
                      toast.error(
                        t(`${pk}.filesystemErr`, {
                          message: e instanceof Error ? e.message : String(e),
                        }),
                      ),
                    )
                }
              >
                {t(`${pk}.filesystemWriteCta`)}
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() =>
                  void fs
                    .readText("playground/hello.txt")
                    .then((text) => {
                      setFsPreview(text.trim());
                      toast.success(t(`${pk}.filesystemReadOk`));
                    })
                    .catch((e: unknown) =>
                      toast.error(
                        t(`${pk}.filesystemErr`, {
                          message: e instanceof Error ? e.message : String(e),
                        }),
                      ),
                    )
                }
              >
                {t(`${pk}.filesystemReadCta`)}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  void fs
                    .deleteFile("playground/hello.txt")
                    .then(() => {
                      setFsPreview(null);
                      toast.success(t(`${pk}.filesystemDeleteOk`));
                    })
                    .catch((e: unknown) =>
                      toast.error(
                        t(`${pk}.filesystemErr`, {
                          message: e instanceof Error ? e.message : String(e),
                        }),
                      ),
                    )
                }
              >
                {t(`${pk}.filesystemDeleteCta`)}
              </Button>
            </motion.div>
          )}
          {fsPreview ? (
            <pre className="max-h-24 overflow-auto rounded-lg bg-muted/40 p-2 text-xs">
              {fsPreview}
            </pre>
          ) : null}
        </section>

        <section className="space-y-2">
          <p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
            {t(`${pk}.backgroundRunner`)}
          </p>
          <p className="text-muted-foreground text-xs leading-relaxed">
            {t(`${pk}.backgroundRunnerHint`)}
          </p>
          {!bgRunner.isNative ? (
            <p className="text-muted-foreground text-xs">
              {t(`${pk}.backgroundRunnerWeb`)}
            </p>
          ) : !bgRunner.available ? (
            <p className="text-muted-foreground text-xs">
              {t(`${pk}.backgroundRunnerUnavailable`)}
            </p>
          ) : (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() =>
                void bgRunner
                  .dispatch({
                    event: DEMO_BACKGROUND_RUNNER_EVENT,
                    details: { source: "demo-playground", at: Date.now() },
                  })
                  .then((result) => {
                    toast.success(
                      t(`${pk}.backgroundRunnerOk`, {
                        detail: JSON.stringify(result),
                      }),
                    );
                  })
                  .catch((e: unknown) => {
                    toast.error(
                      t(`${pk}.backgroundRunnerErr`, {
                        message: e instanceof Error ? e.message : String(e),
                      }),
                    );
                  })
              }
            >
              {t(`${pk}.backgroundRunnerCta`)}
            </Button>
          )}
        </section>

        <section className="space-y-2">
          <p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
            {t(`${pk}.lifecycle`)}
          </p>
          <p className="text-muted-foreground text-sm">
            {t(`${pk}.lifecycleHint`)}
          </p>
          <p className="font-medium text-sm">
            {lifecycleEdge ?? t(`${pk}.lifecycleNone`)}
          </p>
        </section>
      </CardContent>
    </Card>
  );
}
