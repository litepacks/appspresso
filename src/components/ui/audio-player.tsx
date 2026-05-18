import * as React from "react";
import {
  type UseAudioPlayerOptions,
  type UseAudioPlayerReturn,
  useAudioPlayer,
} from "@/hooks/useAudioPlayer";
import { mergeRefs } from "@/lib/merge-refs";
import { cn } from "@/lib/utils";

export type AudioPlayerProps = UseAudioPlayerOptions &
  Omit<React.AudioHTMLAttributes<HTMLAudioElement>, "src" | "children"> & {
    src: string;
    /** Custom control bar; wire player via API */
    children?: (player: UseAudioPlayerReturn) => React.ReactNode;
  };

/**
 * Wraps `<audio>` with `useAudioPlayer`; `ref` can be merged externally.
 * Pass `controls` for native UI or build your own in `children`.
 */
export const AudioPlayer = React.forwardRef<HTMLAudioElement, AudioPlayerProps>(
  function AudioPlayer(
    {
      src,
      loop,
      preload,
      autoPlay,
      defaultVolume,
      defaultMuted,
      className,
      children,
      ...audioRest
    },
    forwardedRef,
  ) {
    const options = React.useMemo(
      () => ({
        src,
        loop,
        preload,
        autoPlay,
        defaultVolume,
        defaultMuted,
      }),
      [src, loop, preload, autoPlay, defaultVolume, defaultMuted],
    );

    const player = useAudioPlayer(options);
    const setRefs = React.useMemo(
      () => mergeRefs(player.ref, forwardedRef),
      [forwardedRef, player.ref],
    );

    return (
      <>
        {/* Hook sets `src` in an effect; repeat prop for consistency */}
        <audio
          ref={setRefs}
          className={cn(className)}
          src={src}
          {...audioRest}
        />
        {children ? children(player) : null}
      </>
    );
  },
);

AudioPlayer.displayName = "AudioPlayer";

export default AudioPlayer;
