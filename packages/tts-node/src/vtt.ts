/**
 * WebVTT helpers — mirror legacy Python `split_text_for_vtt` / `generate_vtt`.
 */

export function formatVttTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const [si, sfRaw = '000'] = secs.toFixed(3).split('.');
  const sf = sfRaw.slice(0, 3).padEnd(3, '0');
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${si.padStart(2, '0')}.${sf}`;
}

export function splitTextForVtt(text: string, maxLength = 30): string[] {
  if (text.length <= maxLength) {
    return [text];
  }

  const segments: string[] = [];
  const sentenceEndings = '。！？';
  let remaining = text;

  while (remaining.length > maxLength) {
    let splitPos = -1;

    for (let i = Math.min(maxLength, remaining.length) - 1; i >= 0; i--) {
      if (sentenceEndings.includes(remaining[i]!)) {
        splitPos = i + 1;
        break;
      }
    }

    if (splitPos > 0) {
      const segment = remaining.slice(0, splitPos).trim();
      if (segment) segments.push(segment);
      remaining = remaining.slice(splitPos).trim();
      continue;
    }

    let foundSentenceEnd = false;
    const lookaheadLimit = Math.min(maxLength * 2, remaining.length);

    for (let i = maxLength; i < lookaheadLimit; i++) {
      if (sentenceEndings.includes(remaining[i]!)) {
        splitPos = i + 1;
        foundSentenceEnd = true;
        break;
      }
    }

    if (!foundSentenceEnd) {
      for (let i = maxLength; i < remaining.length; i++) {
        if (sentenceEndings.includes(remaining[i]!)) {
          splitPos = i + 1;
          foundSentenceEnd = true;
          break;
        }
      }
    }

    if (foundSentenceEnd && splitPos > 0) {
      const segment = remaining.slice(0, splitPos).trim();
      if (segment) segments.push(segment);
      remaining = remaining.slice(splitPos).trim();
    } else {
      segments.push(remaining.trim());
      remaining = '';
    }
  }

  if (remaining) {
    segments.push(remaining);
  }

  return segments;
}

export function generateVtt(
  lines: string[],
  durations: number[],
  vttMaxLength = 30,
): string {
  const out: string[] = ['WEBVTT', ''];
  let currentTime = 0;
  let vttIndex = 1;

  for (let i = 0; i < lines.length; i++) {
    const text = lines[i]!;
    const duration = durations[i]!;
    const vttSegments = splitTextForVtt(text, vttMaxLength);

    let segmentDurations: number[];
    if (vttSegments.length === 1) {
      segmentDurations = [duration];
    } else {
      const totalChars = text.length || 1;
      segmentDurations = vttSegments.map((seg) => (duration * seg.length) / totalChars);
    }

    for (let j = 0; j < vttSegments.length; j++) {
      const segmentText = vttSegments[j]!;
      const segmentDuration = segmentDurations[j]!;
      const startTime = currentTime;
      const endTime = currentTime + segmentDuration;

      out.push(String(vttIndex));
      out.push(`${formatVttTime(startTime)} --> ${formatVttTime(endTime)}`);
      out.push(segmentText);
      out.push('');

      currentTime = endTime;
      vttIndex += 1;
    }
  }

  return out.join('\n');
}
