import { existsSync, mkdirSync, unlinkSync, writeFileSync } from "fs";
import { join } from "path";
import { NextResponse } from "next/server";
import { z } from "zod";
import { isScriptRunnerEnabled } from "../../../../../lib/dev-script-runner";

export const runtime = "nodejs";

const TITLE_REL = join("output", "spider", "title.json");
/** Remotion loads from public; keep in sync when user saves in STEP2 wizard. */
const TITLE_PUBLIC_REL = join("public", "video", "title.json");
const MAX_TITLE_LEN = 2000;

const BodySchema = z.object({
  title: z.string().max(MAX_TITLE_LEN),
});

export async function POST(request: Request) {
  if (!isScriptRunnerEnabled()) {
    return NextResponse.json(
      {
        error:
          "This API is only available in development or when ALLOW_SCRIPT_RUNNER=1.",
      },
      { status: 403 },
    );
  }

  let body: z.infer<typeof BodySchema>;
  try {
    const json = await request.json();
    body = BodySchema.parse(json);
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const trimmed = body.title.trim();
  const cwd = process.cwd();
  const dir = join(cwd, "output", "spider");
  const abs = join(cwd, TITLE_REL);
  const absPublic = join(cwd, TITLE_PUBLIC_REL);
  const payload = `${JSON.stringify({ title: trimmed }, null, 2)}\n`;
  mkdirSync(dir, { recursive: true });

  if (trimmed.length === 0) {
    if (existsSync(abs)) unlinkSync(abs);
    if (existsSync(absPublic)) unlinkSync(absPublic);
    return NextResponse.json({
      ok: true,
      path: TITLE_REL.replace(/\\/g, "/"),
      publicPath: TITLE_PUBLIC_REL.replace(/\\/g, "/"),
      title: "",
      removed: true,
    });
  }

  writeFileSync(abs, payload, "utf8");
  mkdirSync(join(cwd, "public", "video"), { recursive: true });
  writeFileSync(absPublic, payload, "utf8");

  return NextResponse.json({
    ok: true,
    path: TITLE_REL.replace(/\\/g, "/"),
    publicPath: TITLE_PUBLIC_REL.replace(/\\/g, "/"),
    title: trimmed,
  });
}
