import { existsSync, mkdirSync, unlinkSync, writeFileSync } from "fs";
import { join } from "path";
import { NextResponse } from "next/server";
import { z } from "zod";
import { isScriptRunnerEnabled } from "../../../../../lib/dev-script-runner";

export const runtime = "nodejs";

const TITLE_REL = join("output", "spider", "title.json");
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
  const dir = join(process.cwd(), "output", "spider");
  const abs = join(process.cwd(), TITLE_REL);
  mkdirSync(dir, { recursive: true });

  if (trimmed.length === 0) {
    if (existsSync(abs)) unlinkSync(abs);
    return NextResponse.json({
      ok: true,
      path: TITLE_REL.replace(/\\/g, "/"),
      title: "",
      removed: true,
    });
  }

  writeFileSync(
    abs,
    `${JSON.stringify({ title: trimmed }, null, 2)}\n`,
    "utf8",
  );

  return NextResponse.json({
    ok: true,
    path: TITLE_REL.replace(/\\/g, "/"),
    title: trimmed,
  });
}
