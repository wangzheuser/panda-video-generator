import React from "react";
import {
  AbsoluteFill,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { Audio } from "@remotion/media";
import { loadFont } from "@remotion/fonts";

loadFont({
  family: "dingliesongtypeface",
  url: staticFile("fonts/dingliesongtypeface.ttf"),
}).catch((err) => {
  console.error("Failed to load font:", err);
});

const AUDIO_EXTENSIONS = [".mp3", ".wav", ".m4a", ".ogg", ".aac", ".flac"];

function getDisplayNameFromPath(path: string): string {
  const base = path.split("/").pop() ?? path;
  const ext = AUDIO_EXTENSIONS.find((e) => base.toLowerCase().endsWith(e));
  return ext ? base.slice(0, -ext.length) : base;
}

export interface SingleTrackProps {
  /** Audio file path relative to public (e.g. "album/01.mp3"). Passed via --props from shell (env AUDIO_PATH). */
  audioPath?: string;
  /** Optional background color (hex). */
  backgroundColor?: string;
}

const DEFAULT_BACKGROUND = "#1a1a2e";

export const SingleTrack: React.FC<SingleTrackProps> = ({
  audioPath = "",
  backgroundColor = DEFAULT_BACKGROUND,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const name = getDisplayNameFromPath(audioPath);

  const titleSpring = spring({
    fps,
    frame,
    config: { damping: 200 },
    durationInFrames: Math.min(20, Math.ceil(0.5 * fps)),
  });
  const opacity = interpolate(titleSpring, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale = interpolate(titleSpring, [0, 1], [0.9, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  if (!audioPath) {
    return (
      <AbsoluteFill
        style={{
          backgroundColor: DEFAULT_BACKGROUND,
          justifyContent: "center",
          alignItems: "center",
          color: "#fff",
          fontSize: 24,
        }}
      >
        请通过 env 传入 AUDIO_PATH，或 --props 传入 audioPath
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill
      style={{
        backgroundColor,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Audio src={staticFile(audioPath)} />
      <div
        style={{
          fontFamily: "dingliesongtypeface, sans-serif",
          fontSize: 56,
          fontWeight: "bold",
          color: "#fff",
          textAlign: "center",
          textShadow: "0 2px 12px rgba(0,0,0,0.4)",
          padding: "0 48px",
          maxWidth: "90%",
          opacity,
          transform: `scale(${scale})`,
        }}
      >
        {name}
      </div>
    </AbsoluteFill>
  );
};
