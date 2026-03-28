import { parseFile } from 'music-metadata';
import { readFile } from 'node:fs/promises';

export async function getMp3DurationSeconds(path: string): Promise<number> {
  try {
    const meta = await parseFile(path);
    const d = meta.format.duration;
    if (d != null && !Number.isNaN(d)) {
      return d;
    }
  } catch {
    // fall through
  }
  const buf = await readFile(path);
  return buf.length / 16000;
}
