import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const STEPS = [
  {
    href: "/scripts/step-1",
    number: "1",
    title: "第一步",
    description: "文稿准备与整理（手工 / 知乎 / 通用网页）。",
  },
  {
    href: "/scripts/step-2",
    number: "2",
    title: "第二步",
    description: "仅 TTS：配音与字幕（pnpm tts）。",
  },
  {
    href: "/scripts/step-3",
    number: "3",
    title: "第三步",
    description: "选择 Composition 并渲染（render:composition）。",
  },
] as const;

export default function ScriptsHubPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-black to-black text-zinc-100">
      <header className="border-b border-zinc-800/80 bg-zinc-950/60">
        <div className="container mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800"
            >
              <ArrowLeft className="size-4" aria-hidden />
              返回首页
            </Link>
            <h1 className="text-lg font-semibold tracking-tight text-zinc-50">
              自动化向导
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <p className="mb-8 max-w-2xl text-sm leading-relaxed text-zinc-400">
          按 README 分步流程：点击下方卡片进入对应步骤。
        </p>
        <ul className="grid gap-5 sm:grid-cols-3">
          {STEPS.map((step) => (
            <li key={step.href}>
              <Link
                href={step.href}
                className="group flex h-full flex-col rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 ring-1 ring-inset ring-white/[0.04] transition-[transform,box-shadow,border-color] hover:-translate-y-0.5 hover:border-zinc-600 hover:ring-zinc-500/15 hover:shadow-lg hover:shadow-black/30"
              >
                <span
                  className="mb-4 inline-flex size-10 items-center justify-center rounded-xl bg-zinc-800/90 font-mono text-sm font-semibold text-red-400 ring-1 ring-zinc-700"
                  aria-hidden
                >
                  {step.number}
                </span>
                <span className="text-base font-semibold text-zinc-50 group-hover:text-white">
                  {step.title}
                </span>
                <span className="mt-2 grow text-sm leading-relaxed text-zinc-500">
                  {step.description}
                </span>
                <span className="mt-4 text-xs font-medium text-red-400/90">
                  进入 →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
