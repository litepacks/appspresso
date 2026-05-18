import {
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

export type AudioPlayerStatus =
  | "idle"
  | "loading"
  | "ready"
  | "playing"
  | "paused"
  | "ended"
  | "error";

export type UseAudioPlayerOptions = {
  src: string;
  loop?: boolean;
  preload?: HTMLMediaElement["preload"];
  /** Browser policy dependent; reliable after user gesture */
  autoPlay?: boolean;
  /**
   * Applied on first load and when `src` changes.
   * Update during playback via `setVolume` (or `volume` prop on `AudioPlayer`).
   */
  defaultVolume?: number;
  /** On first load and when `src` changes */
  defaultMuted?: boolean;
};

export type UseAudioPlayerReturn = {
  ref: RefObject<HTMLAudioElement | null>;
  status: AudioPlayerStatus;
  duration: number;
  currentTime: number;
  /** Ratio to end of known `buffered` range; 0 if none */
  bufferedRatio: number;
  volume: number;
  muted: boolean;
  error: MediaError | null;
  play: () => Promise<void>;
  pause: () => void;
  toggle: () => Promise<void>;
  seek: (seconds: number) => void;
  setVolume: (value: number) => void;
  setMuted: (muted: boolean) => void;
};

function clamp01(n: number) {
  if (Number.isNaN(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

function readBufferedRatio(el: HTMLAudioElement): number {
  try {
    const { buffered, duration } = el;
    if (!buffered.length || !duration || !Number.isFinite(duration)) {
      return 0;
    }
    return clamp01(buffered.end(buffered.length - 1) / duration);
  } catch {
    return 0;
  }
}

/**
 * Play, pause, seek, volume and state listeners on `HTMLAudioElement`.
 * Pass `ref` to `<audio ref={ref} />`; hook options manage `src` and flags.
 */
export function useAudioPlayer(
  options: UseAudioPlayerOptions,
): UseAudioPlayerReturn {
  const {
    src,
    loop = false,
    preload = "metadata",
    autoPlay = false,
    defaultVolume = 1,
    defaultMuted = false,
  } = options;

  const ref = useRef<HTMLAudioElement | null>(null);
  const [status, setStatus] = useState<AudioPlayerStatus>("idle");
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [bufferedRatio, setBufferedRatio] = useState(0);
  const [volume, setVolumeState] = useState(() => clamp01(defaultVolume));
  const [muted, setMutedState] = useState(defaultMuted);
  const [error, setError] = useState<MediaError | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.loop = loop;
    el.preload = preload;
    const vol = clamp01(defaultVolume);
    el.volume = vol;
    el.muted = defaultMuted;
    setVolumeState(vol);
    setMutedState(defaultMuted);

    el.autoplay = autoPlay;
    el.src = src;

    setError(null);
    setCurrentTime(0);
    setDuration(0);
    setBufferedRatio(0);
    setStatus("loading");
  }, [src, loop, preload, autoPlay, defaultVolume, defaultMuted]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onPlay = () => setStatus("playing");
    const onPause = () => {
      if (el.ended) setStatus("ended");
      else setStatus("paused");
    };
    const onEnded = () => setStatus("ended");
    const onTimeUpdate = () => {
      setCurrentTime(el.currentTime);
      setBufferedRatio(readBufferedRatio(el));
    };
    const onProgress = () => setBufferedRatio(readBufferedRatio(el));
    const onLoadedMetadata = () => {
      setDuration(Number.isFinite(el.duration) ? el.duration : 0);
      setCurrentTime(el.currentTime);
      setBufferedRatio(readBufferedRatio(el));
      setStatus(el.paused ? "ready" : "playing");
    };
    const onCanPlay = () => {
      setDuration(Number.isFinite(el.duration) ? el.duration : 0);
      setStatus((s) => (s === "playing" ? "playing" : "ready"));
    };
    const onWaiting = () => setStatus((s) => (s === "playing" ? "loading" : s));
    const onStalled = () => setStatus((s) => (s === "playing" ? "loading" : s));
    const onError = () => {
      setError(el.error);
      setStatus("error");
    };
    const onVolumeChange = () => {
      setVolumeState(clamp01(el.volume));
      setMutedState(el.muted);
    };

    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("ended", onEnded);
    el.addEventListener("timeupdate", onTimeUpdate);
    el.addEventListener("progress", onProgress);
    el.addEventListener("loadedmetadata", onLoadedMetadata);
    el.addEventListener("canplay", onCanPlay);
    el.addEventListener("waiting", onWaiting);
    el.addEventListener("stalled", onStalled);
    el.addEventListener("error", onError);
    el.addEventListener("volumechange", onVolumeChange);

    return () => {
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("ended", onEnded);
      el.removeEventListener("timeupdate", onTimeUpdate);
      el.removeEventListener("progress", onProgress);
      el.removeEventListener("loadedmetadata", onLoadedMetadata);
      el.removeEventListener("canplay", onCanPlay);
      el.removeEventListener("waiting", onWaiting);
      el.removeEventListener("stalled", onStalled);
      el.removeEventListener("error", onError);
      el.removeEventListener("volumechange", onVolumeChange);
    };
  }, []);

  useEffect(() => {
    return () => {
      const el = ref.current;
      if (el) {
        el.pause();
      }
    };
  }, []);

  const play = useCallback(async () => {
    const el = ref.current;
    if (!el) return;
    await el.play();
  }, []);

  const pause = useCallback(() => {
    ref.current?.pause();
  }, []);

  const toggle = useCallback(async () => {
    const el = ref.current;
    if (!el) return;
    if (el.paused) await el.play();
    else el.pause();
  }, []);

  const seek = useCallback((seconds: number) => {
    const el = ref.current;
    if (!el || !Number.isFinite(seconds)) return;
    el.currentTime = Math.max(0, seconds);
  }, []);

  const setVolume = useCallback((value: number) => {
    const el = ref.current;
    if (!el) return;
    const v = clamp01(value);
    el.volume = v;
    setVolumeState(v);
  }, []);

  const setMuted = useCallback((next: boolean) => {
    const el = ref.current;
    if (!el) return;
    el.muted = next;
    setMutedState(next);
  }, []);

  return {
    ref,
    status,
    duration,
    currentTime,
    bufferedRatio,
    volume,
    muted,
    error,
    play,
    pause,
    toggle,
    seek,
    setVolume,
    setMuted,
  };
}
