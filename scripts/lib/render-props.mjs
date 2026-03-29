import fs from "node:fs";
import path from "node:path";

/** Writes Remotion props JSON with `{ title }` from spider/public title.json; returns whether file was written. */
export function writeRenderPropsFromTitle(titlePath, outPath) {
  try {
    const data = JSON.parse(fs.readFileSync(titlePath, "utf8"));
    if (data.title) {
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      fs.writeFileSync(
        outPath,
        JSON.stringify({ title: data.title }, null, 2),
        "utf8",
      );
      return true;
    }
  } catch {
    /* ignore */
  }
  return false;
}
