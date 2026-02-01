import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const Watermark: React.FC = () => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	// Watermark: display randomly for each 5-second interval
	// Use a deterministic random based on time interval to ensure consistency across renders
	const watermarkIntervalSeconds = 5; // 5 seconds
	const watermarkIntervalFrames = watermarkIntervalSeconds * fps;
	const intervalIndex = Math.floor(frame / watermarkIntervalFrames);
	const intervalStartFrame = intervalIndex * watermarkIntervalFrames;

	// Deterministic random position for each interval (based on interval index)
	// This ensures the same position for the same interval across renders
	const randomSeed = intervalIndex;
	const positions = [
		{ top: '10%', left: '10%' },
		{ top: '10%', right: '10%' },
		{ top: '50%', left: '5%', transform: 'translateY(-50%)' },
		{ top: '50%', right: '5%', transform: 'translateY(-50%)' },
		{ bottom: '10%', left: '10%' },
		{ bottom: '10%', right: '10%' },
		{ top: '20%', left: '50%', transform: 'translateX(-50%)' },
		{ bottom: '20%', left: '50%', transform: 'translateX(-50%)' },
	];
	const selectedPosition = positions[randomSeed % positions.length];

	// Show watermark for 2 seconds in each 5-second interval, starting randomly within the interval
	const watermarkShowDurationSeconds = 2; // Show for 2 seconds
	const watermarkShowDurationFrames = watermarkShowDurationSeconds * fps;
	const watermarkStartOffsetSeconds = (randomSeed % 3) * 1.5; // Random start between 0-4.5 seconds
	const watermarkStartFrame = intervalStartFrame + Math.floor(watermarkStartOffsetSeconds * fps);
	const watermarkEndFrame = watermarkStartFrame + watermarkShowDurationFrames;

	const showWatermark = frame >= watermarkStartFrame && frame < watermarkEndFrame;

	// Fade in/out animation for watermark
	let watermarkOpacity = 0;
	if (showWatermark) {
		const fadeDurationFrames = Math.floor(0.3 * fps); // 0.3 seconds fade in/out
		const frameInWatermark = frame - watermarkStartFrame;

		if (frameInWatermark < fadeDurationFrames) {
			// Fade in
			watermarkOpacity = interpolate(
				frameInWatermark,
				[0, fadeDurationFrames],
				[0, 0.15],
				{ extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
			);
		} else if (frameInWatermark > watermarkShowDurationFrames - fadeDurationFrames) {
			// Fade out
			watermarkOpacity = interpolate(
				frameInWatermark,
				[watermarkShowDurationFrames - fadeDurationFrames, watermarkShowDurationFrames],
				[0.15, 0],
				{ extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
			);
		} else {
			// Fully visible
			watermarkOpacity = 0.15;
		}
	}

	return (
		<AbsoluteFill style={{ pointerEvents: 'none' }}>
			{/* Watermark - randomly displayed for each 5-second interval */}
			{showWatermark && (
				<div
					style={{
						position: 'absolute',
						top: selectedPosition.top,
						left: selectedPosition.left,
						right: selectedPosition.right,
						bottom: selectedPosition.bottom,
						transform: selectedPosition.transform,
						opacity: watermarkOpacity,
						zIndex: 9999,
						pointerEvents: 'none',
						fontFamily: 'Arial, sans-serif',
						fontSize: 24,
						color: 'rgba(0, 0, 0, 0.2)',
						fontWeight: 'bold',
						whiteSpace: 'nowrap',
					}}
				>
					熊猫视频自动化引擎
				</div>
			)}
		</AbsoluteFill>
	);
};
