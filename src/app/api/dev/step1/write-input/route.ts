import { existsSync, mkdirSync, unlinkSync, writeFileSync } from "fs";
import { join } from "path";
import { NextResponse } from "next/server";
import { z } from "zod";
import { isScriptRunnerEnabled } from "../../../../../lib/dev-script-runner";

export const runtime = "nodejs";

const MAX_BYTES = 1024 * 1024; // 1 MiB
const TITLE_MAX_LEN = 200;

const BodySchema = z.object({
  content: z.string(),
});

function deriveTitleFromManuscript(text: string): string {
  for (const line of text.split(/\r?\n/)) {
    const t = line.trim();
    if (t.length > 0) {
      return t.length > TITLE_MAX_LEN ? `${t.slice(0, TITLE_MAX_LEN)}…` : t;
    }
  }
  return "";
}

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

  const buf = Buffer.from(body.content, "utf8");
  if (buf.length > MAX_BYTES) {
    return NextResponse.json(
      { error: `Content exceeds ${MAX_BYTES} bytes` },
      { status: 400 },
    );
  }

  const dir = join(process.cwd(), "output", "spider");
  mkdirSync(dir, { recursive: true });
  const filePath = join(dir, "input.txt");
  writeFileSync(filePath, body.content, "utf8");

  const title = deriveTitleFromManuscript(body.content);
  const titlePath = join(dir, "title.json");
  if (title) {
    writeFileSync(
      titlePath,
      `${JSON.stringify({ title }, null, 2)}\n`,
      "utf8",
    );
  } else if (existsSync(titlePath)) {
    unlinkSync(titlePath);
  }

  return NextResponse.json({
    ok: true,
    path: "output/spider/input.txt",
    ...(title ? { titlePath: "output/spider/title.json" as const } : {}),
  });
}
