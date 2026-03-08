import React from "react";
import {
  AbsoluteFill,
  Series,
  useVideoConfig,
  staticFile,
  useCurrentFrame,
  interpolate,
  spring,
} from "remotion";
import { Audio } from "@remotion/media";
import { loadFont } from "@remotion/fonts";

// Load font for track name display
loadFont({
  family: "dingliesongtypeface",
  url: staticFile("fonts/dingliesongtypeface.ttf"),
}).catch((err) => {
  console.error("Failed to load font:", err);
});

const AUDIO_EXTENSIONS = [".mp3", ".wav", ".m4a", ".ogg", ".aac", ".flac"];

// Distinct background colors for each track (cycle if more tracks than colors)
const TRACK_BACKGROUND_COLORS = [
  "#1a1a2e",
  "#16213e",
  "#0f3460",
  "#533483",
  "#e94560",
  "#0d7377",
  "#14ffec",
  "#ff6b6b",
  "#4ecdc4",
  "#45b7d1",
  "#96ceb4",
  "#ffeaa7",
  "#dfe6e9",
  "#6c5ce7",
  "#a29bfe",
];

export interface AudioTrackItem {
  /** Static file path relative to public (e.g. "audio/track1.mp3") */
  path: string;
  /** Display name (default: filename without extension) */
  name: string;
  /** Duration in seconds */
  durationInSeconds: number;
  /** Background color for this track */
  backgroundColor: string;
}

export interface AudioConcatProps {
  /** List of tracks with path, name, duration; populated by calculateMetadata from folder or passed explicitly */
  tracks?: AudioTrackItem[];
}

function getDisplayNameFromPath(path: string): string {
  const base = path.split("/").pop() ?? path;
  const ext = AUDIO_EXTENSIONS.find((e) => base.toLowerCase().endsWith(e));
  return ext ? base.slice(0, -ext.length) : base;
}

/** Single track segment: solid background + track name + audio */
const TrackSegment: React.FC<{
  path: string;
  name: string;
  backgroundColor: string;
}> = ({ path, name, backgroundColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

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

  return (
    <AbsoluteFill
      style={{
        backgroundColor,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Audio src={staticFile(path)} />
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

export const AudioConcat: React.FC<AudioConcatProps> = ({ tracks: tracksProp }) => {
  const { fps } = useVideoConfig();
  const tracks = tracksProp ?? [];

  if (tracks.length === 0) {
    return (
      <AbsoluteFill
        style={{
          backgroundColor: "#1a1a2e",
          justifyContent: "center",
          alignItems: "center",
          color: "#fff",
          fontSize: 24,
        }}
      >
        未找到音频文件，请将音频放入 public/album 目录
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill>
      <Series>
        {tracks.map((track, index) => (
          <Series.Sequence
            key={track.path}
            durationInFrames={Math.ceil(track.durationInSeconds * fps)}
          >
            <TrackSegment
              path={track.path}
              name={track.name}
              backgroundColor={track.backgroundColor}
            />
          </Series.Sequence>
        ))}
      </Series>
    </AbsoluteFill>
  );
};

/** Filter static files by folder prefix and audio extensions; sort by name */
export function filterAudioFilesFromFolder(
  staticFiles: { name: string; src: string }[],
  folderPrefix: string
): { name: string; src: string }[] {
  const prefix = folderPrefix.endsWith("/") ? folderPrefix : `${folderPrefix}/`;
  return staticFiles
    .filter((f) => {
      if (!f.name.startsWith(prefix)) return false;
      const lower = f.name.toLowerCase();
      return AUDIO_EXTENSIONS.some((ext) => lower.endsWith(ext));
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Build track list with display names and colors from filtered static files and durations */
export function buildTrackList(
  files: { name: string; src: string }[],
  durationsInSeconds: number[]
): AudioTrackItem[] {
  return files.map((file, i) => ({
    path: file.name,
    name: getDisplayNameFromPath(file.name),
    durationInSeconds: durationsInSeconds[i] ?? 0,
    backgroundColor: TRACK_BACKGROUND_COLORS[i % TRACK_BACKGROUND_COLORS.length],
  }));
}
