import { useCallback, useEffect, useMemo, useState } from "react";

/** Whether Geolocation API is available (false in SSR). */
export function isGeolocationSupported(): boolean {
  return (
    typeof navigator !== "undefined" &&
    "geolocation" in navigator &&
    typeof navigator.geolocation?.getCurrentPosition === "function"
  );
}

export type NativeLocationCoords = {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: number | null;
  altitudeAccuracy: number | null;
  heading: number | null;
  speed: number | null;
};

export type NativeLocationSnapshot = {
  coords: NativeLocationCoords;
  timestamp: number;
};

function toSnapshot(position: GeolocationPosition): NativeLocationSnapshot {
  const c = position.coords;
  return {
    coords: {
      latitude: c.latitude,
      longitude: c.longitude,
      accuracy: c.accuracy,
      altitude: c.altitude ?? null,
      altitudeAccuracy: c.altitudeAccuracy ?? null,
      heading: c.heading ?? null,
      speed: c.speed ?? null,
    },
    timestamp: position.timestamp,
  };
}

export type UseNativeLocationOptions = {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  /** When true, continuously updated via `watchPosition` */
  watch?: boolean;
  /** Request location once on mount when `watch` is off (default true) */
  requestOnMount?: boolean;
};

export type UseNativeLocationReturn = {
  supported: boolean;
  location: NativeLocationSnapshot | null;
  error: GeolocationPositionError | null;
  loading: boolean;
  /** One-shot read; rejects when unsupported or denied */
  refresh: () => Promise<NativeLocationSnapshot>;
};

/**
 * Local GPS / location: Web Geolocation API. Works in most Capacitor WebView setups;
 * iOS/Android permissions (Info.plist, manifest) must be in the app template.
 */
export function useNativeLocation(
  options: UseNativeLocationOptions = {},
): UseNativeLocationReturn {
  const {
    enableHighAccuracy = true,
    timeout = 15_000,
    maximumAge = 0,
    watch = false,
    requestOnMount = true,
  } = options;

  const positionOptions = useMemo(
    () => ({
      enableHighAccuracy,
      timeout,
      maximumAge,
    }),
    [enableHighAccuracy, timeout, maximumAge],
  );

  const supported = useMemo(() => isGeolocationSupported(), []);
  const [location, setLocation] = useState<NativeLocationSnapshot | null>(null);
  const [error, setError] = useState<GeolocationPositionError | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback((): Promise<NativeLocationSnapshot> => {
    if (!isGeolocationSupported()) {
      return Promise.reject(
        new Error("Location is not supported in this environment."),
      );
    }
    setLoading(true);
    setError(null);
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const snap = toSnapshot(pos);
          setLocation(snap);
          setLoading(false);
          resolve(snap);
        },
        (err) => {
          setError(err);
          setLoading(false);
          reject(err);
        },
        positionOptions,
      );
    });
  }, [positionOptions]);

  useEffect(() => {
    if (!isGeolocationSupported() || watch) return;
    if (!requestOnMount) return;
    void refresh();
  }, [watch, requestOnMount, refresh]);

  useEffect(() => {
    if (!isGeolocationSupported() || !watch) return;
    setLoading(true);
    setError(null);
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setLocation(toSnapshot(pos));
        setError(null);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
      positionOptions,
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [watch, positionOptions]);

  return { supported, location, error, loading, refresh };
}
