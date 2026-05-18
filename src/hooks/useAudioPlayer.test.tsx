import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AudioPlayer } from "@/components/ui/audio-player";
import { useAudioPlayer } from "./useAudioPlayer";

function TestAudio({ src }: { src: string }) {
  const p = useAudioPlayer({ src });
  return (
    <>
      {/* biome-ignore lint/a11y/useMediaCaption: unit test harness */}
      <audio ref={p.ref} data-testid="audio-el" />
      <span data-testid="duration">{p.duration}</span>
      <span data-testid="status">{p.status}</span>
    </>
  );
}

describe("useAudioPlayer", () => {
  it("duration and state update on loadedmetadata", () => {
    render(<TestAudio src="/track.mp3" />);
    const el = screen.getByTestId("audio-el") as HTMLAudioElement;
    Object.defineProperty(el, "duration", {
      value: 120,
      configurable: true,
    });
    fireEvent.loadedMetadata(el);
    expect(screen.getByTestId("duration")).toHaveTextContent("120");
    expect(screen.getByTestId("status")).toHaveTextContent("ready");
  });

  it("pause event sets state to paused", () => {
    render(<TestAudio src="/track.mp3" />);
    const el = screen.getByTestId("audio-el") as HTMLAudioElement;
    fireEvent.play(el);
    expect(screen.getByTestId("status")).toHaveTextContent("playing");
    fireEvent.pause(el);
    expect(screen.getByTestId("status")).toHaveTextContent("paused");
  });
});

describe("AudioPlayer", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("play can be triggered via children", async () => {
    const play = vi
      .spyOn(HTMLMediaElement.prototype, "play")
      .mockImplementation(() => Promise.resolve());
    const user = userEvent.setup();
    render(
      <AudioPlayer src="/beep.mp3">
        {(p) => (
          <button type="button" onClick={() => void p.play()}>
            Oynat
          </button>
        )}
      </AudioPlayer>,
    );
    await user.click(screen.getByRole("button", { name: "Oynat" }));
    expect(play).toHaveBeenCalled();
  });

  it("setVolume updates volume level", async () => {
    const user = userEvent.setup();
    render(
      <AudioPlayer src="/beep.mp3" defaultVolume={1}>
        {(p) => (
          <button type="button" onClick={() => p.setVolume(0.35)}>
            Half
          </button>
        )}
      </AudioPlayer>,
    );
    const audio = document.querySelector("audio") as HTMLAudioElement;
    await user.click(screen.getByRole("button", { name: "Half" }));
    expect(audio.volume).toBeCloseTo(0.35, 5);
  });
});
