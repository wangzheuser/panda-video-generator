"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Bot,
  Compass,
  Github,
  Globe,
  Headphones,
  Terminal,
  Video,
  Upload,
  X,
} from "lucide-react";
import { defaultMyCompProps } from "../../../types/constants";
import { useState } from "react";
import Footer from "../../components/Footer";
import SectionTitle from "../../components/SectionTitle";
import Steps from "../../components/Steps";

/*
 * The card grids sit in the same content column as the home page, so on wide
 * screens they keep a gutter instead of stretching to the viewport edge.
 */
const shell = "mx-auto w-full max-w-5xl px-5 sm:px-8";

/* This page's own pipeline — the same four stages the /scripts walkthrough follows. */
const PIPELINE_STEPS = [
  {
    title: "文稿准备",
    description: "抓取网页内容，整理成可以直接朗读的脚本。",
    icon: Globe,
    tags: ["文稿", "网页提取"],
  },
  {
    title: "配音与字幕",
    description: "文本转语音生成配音，同时切出对齐的字幕。",
    icon: Headphones,
    tags: ["TTS", "配音与字幕"],
  },
  {
    title: "渲染成片",
    description: "按模板把素材合成为视频，输出成片。",
    icon: Video,
    tags: ["视频素材", "渲染与合成"],
  },
  {
    title: "多平台发布",
    description: "登录各平台账号，自动上传并填写发布信息。",
    icon: Upload,
    tags: ["多平台发布", "自动化上传"],
  },
] as const;

/*
 * Flat cards, shared by 核心特性 and 接入方式: one solid fill, one solid
 * border, no gradient wash and no gradient hairline along the top edge. Both
 * used to be graded fills with a coloured gradient line across the top, which
 * made the edges read as a soft blur rather than a boundary.
 *
 * No hover state either — these are <article>s, not links, so there is nothing
 * for a lift or a glow to promise.
 */
const cardClass =
  "relative flex h-full flex-col rounded-2xl border border-white/20 bg-zinc-900 p-6 sm:p-7";

/* Icon tile and tag pill — shared so both grids stay in step. */
const iconTileClass =
  "mb-5 inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-amber-300 ring-1 ring-white/10";

const tagPillClass =
  "rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-zinc-300";

const cardTitleClass =
  "text-lg font-semibold tracking-tight text-zinc-50 sm:text-xl";

const videoFrameClass =
  "relative overflow-hidden rounded-2xl bg-gradient-to-b from-white/[0.14] via-white/[0.06] to-white/[0.03] p-px shadow-[0_0_80px_-20px_rgba(251,191,36,0.15)]";

const videoInnerClass =
  "relative w-full overflow-hidden rounded-[0.9rem] border border-zinc-800/90 bg-black shadow-inner shadow-black/60";

export default function LandingPage() {
  const [showCliAlert, setShowCliAlert] = useState(true);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-zinc-950 text-zinc-100">
      {/* Ambient background */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(251,191,36,0.14),transparent_55%),radial-gradient(ellipse_80%_50%_at_100%_50%,rgba(34,211,238,0.08),transparent_50%),radial-gradient(ellipse_70%_60%_at_0%_80%,rgba(192,132,252,0.07),transparent_45%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-0 -z-10 animate-hero-orb opacity-90 motion-reduce:animate-none"
        aria-hidden
      >
        <div className="absolute -left-32 top-1/4 size-[420px] rounded-full bg-amber-500/15 blur-[100px]" />
        <div className="absolute -right-24 top-1/3 size-[380px] rounded-full bg-cyan-500/12 blur-[90px]" />
        <div className="absolute bottom-1/4 left-1/3 size-[360px] rounded-full bg-fuchsia-500/10 blur-[100px]" />
      </div>
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.028)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.028)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_35%,black_15%,transparent_70%)]"
        aria-hidden
      />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-zinc-950/75 backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-zinc-950/65">
        <nav className="container mx-auto flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 ring-1 ring-zinc-300/80 sm:size-10">
                <Image
                  src="/logo/logo.png"
                  alt="Panda Video Generator Logo"
                  width={40}
                  height={40}
                  className="size-7 rounded-md object-contain sm:size-9"
                />
              </span>
              <span className="max-w-[140px] truncate font-mono text-base font-semibold text-zinc-50 sm:max-w-none sm:text-xl">
                {defaultMyCompProps.title}
              </span>
            </Link>
          </div>
          <Link
            href="https://github.com/szhshp/panda-video-generator"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-zinc-100 shadow-sm transition-[background,box-shadow,transform] hover:scale-[1.02] hover:bg-white/[0.08] hover:shadow-[0_0_24px_-4px_rgba(255,255,255,0.12)] sm:gap-2 sm:px-4 sm:py-2 sm:text-base motion-reduce:hover:scale-100"
          >
            <Github size={18} className="sm:size-5" />
            <span className="hidden sm:inline">GitHub</span>
          </Link>
        </nav>
      </header>

      {showCliAlert && (
        <div className="bg-gradient-to-r from-emerald-950/80 via-emerald-900/60 to-zinc-950 border-b border-emerald-700/30">
          <div className="container mx-auto flex items-center justify-between px-4 py-2.5 sm:px-6">
            <div className="flex items-center gap-2 text-sm">
              <Terminal size={16} className="shrink-0 text-emerald-400" />
              <span className="text-zinc-300">
                <span className="font-semibold text-emerald-300">新工具：</span>
                Panda Video Automation Publisher CLI 现已独立发布，可自由集成至自有视频项目 —
                <Link href="/cli" className="ml-1 font-medium text-emerald-400 underline underline-offset-2 hover:text-emerald-300 transition-colors">
                  查看详情
                </Link>
              </span>
            </div>
            <button
              onClick={() => setShowCliAlert(false)}
              className="shrink-0 rounded-lg p-1 text-zinc-500 hover:bg-white/5 hover:text-zinc-300 transition-colors"
              aria-label="关闭提示"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="container mx-auto px-4 pb-12 pt-10 text-center sm:px-6 sm:pb-20 sm:pt-14 md:pt-20">
        <div className="mb-8 flex justify-center sm:mb-10">
          <div className="relative">
            <div
              className="pointer-events-none absolute inset-[-28%] rounded-[2rem] bg-gradient-to-tr from-amber-500/35 via-cyan-500/22 to-fuchsia-500/28 blur-3xl motion-reduce:opacity-50"
              aria-hidden
            />
            <div className="relative rounded-2xl bg-zinc-100 p-4 shadow-md shadow-black/40 ring-1 ring-zinc-300/90 motion-safe:animate-hero-float sm:p-5 md:p-6 motion-reduce:animate-none">
              <Image
                src="/logo/logo.png"
                alt="Panda Video Generator Logo"
                width={200}
                height={200}
                priority
                className="size-28 object-contain sm:size-44 md:size-48"
              />
            </div>
          </div>
        </div>
        <p className="mb-4 text-[0.7rem] font-medium tracking-wide text-amber-400/90 sm:text-xs">
          端到端 · 视频自动化
        </p>
        {/*
         * Wordmark, matching the home page: the spans sit flush so the coloured
         * segments read as one mark. Keep the whitespace out and let <wbr> do the
         * wrapping at each colour boundary.
         */}
        <h1 className="mx-auto max-w-4xl min-w-0 px-1 text-[1.75rem] font-bold leading-[1.15] tracking-tight break-words sm:px-4 sm:text-[2.25rem] md:text-[2.5rem] lg:text-[3rem]">
          <span className="text-amber-400">Panda</span>
          <wbr />
          <span className="text-neutral-300">Video</span>
          <wbr />
          <span className="text-yellow-200">Generator</span>
        </h1>
        <p className="mt-4 text-base font-medium tracking-wide text-amber-300/90 sm:text-lg">
          熊猫视频自动化引擎
        </p>
        <p className="mx-auto mt-3 max-w-2xl text-balance px-2 text-sm italic text-neutral-500 sm:text-base">
          Developer-first video automation engine.
        </p>
        <p className="mx-auto mt-6 max-w-2xl text-balance px-2 text-sm leading-relaxed text-neutral-400 sm:text-base">
          一站式全自动化的视频内容生成与发布引擎，支持从网页内容提取、文本转视频到多平台发布的完整工作流。通过
          AI 驱动的文本转语音（TTS）技术和视频渲染引擎，帮助内容创作者快速生成高质量视频并一键发布到多个平台。
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3 px-2 sm:mt-12 sm:gap-4">
          <Link
            href="https://github.com/szhshp/panda-video-generator?tab=readme-ov-file#-%E6%A0%B8%E5%BF%83%E7%89%B9%E6%80%A7"
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-11 rounded-xl bg-amber-400 px-6 py-2.5 text-sm font-semibold text-zinc-950 shadow-[0_0_40px_-8px_rgba(251,191,36,0.45)] transition-[transform,filter] hover:scale-[1.03] hover:bg-amber-300 hover:shadow-[0_0_52px_-6px_rgba(251,191,36,0.55)] sm:min-h-12 sm:px-7 sm:py-3 sm:text-base motion-reduce:hover:scale-100"
          >
            开始使用
          </Link>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            <Link
              href="https://github.com/szhshp/panda-video-generator"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border-2 border-white/15 bg-white/[0.04] px-6 py-2.5 text-sm font-semibold text-zinc-100 transition-[transform,box-shadow,background-color] hover:scale-[1.03] hover:border-white/25 hover:bg-white/[0.08] hover:shadow-[0_0_32px_-8px_rgba(255,255,255,0.18)] sm:min-h-12 sm:px-7 sm:py-3 sm:text-base motion-reduce:hover:scale-100"
              title="在 GitHub 打开仓库"
            >
              <Github size={18} className="shrink-0 sm:size-5" />
              <span>GitHub</span>
            </Link>
            <Link
              href="/cli"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border-2 border-white/15 bg-white/[0.04] px-6 py-2.5 text-sm font-semibold text-zinc-100 transition-[transform,box-shadow,background-color] hover:scale-[1.03] hover:border-white/25 hover:bg-white/[0.08] hover:shadow-[0_0_32px_-8px_rgba(255,255,255,0.18)] sm:min-h-12 sm:px-7 sm:py-3 sm:text-base motion-reduce:hover:scale-100"
              title="CLI 工具使用说明"
            >
              <Terminal size={18} className="shrink-0 sm:size-5" />
              <span>CLI 工具 (可用于自行集成)</span>
            </Link>
          </div>
        </div>
      </section>


      {/* Workflow — the four stages the engine runs, in order */}
      <section className={`${shell} py-14 sm:py-20`}>
        <SectionTitle
          eyebrow="工作流程"
          title="四步跑完一条流水线"
          subtitle="每一段都能单独跑，也可以从头到尾串起来。"
        />
        <Steps steps={PIPELINE_STEPS} />
      </section>

      {/* Feature demos — aligned with README: Agent + wizard（CLI 无单独演示视频，见文档） */}
      <section className="container mx-auto px-4 py-14 sm:px-6 sm:py-20">
        <SectionTitle
          eyebrow="实机演示"
          title="功能演示"
          subtitle="两段演示对应 Agent 与网页向导；命令行用法见 CLI 使用指南。"
        />
        <div className="mx-auto mt-12 flex max-w-4xl flex-col gap-14 sm:mt-16 sm:gap-16">
          <div id="demo-agent" className="scroll-mt-28">
            <h3 className="mb-2 text-center text-base font-bold text-zinc-100 sm:text-lg">
              功能演示 1 · Agent 使用演示
            </h3>
            <p className="mb-5 text-center text-sm text-zinc-500 sm:text-base">
              《用 AI 的方式一人运营十个自媒体账号》
            </p>
            <div className={videoFrameClass}>
              <div className={`${videoInnerClass} aspect-video`}>
                <iframe
                  title="Panda Video Generator · Agent 使用演示"
                  src="https://player.bilibili.com/player.html?bvid=BV1WXDABGEB7&autoplay=0&danmaku=0"
                  className="absolute inset-0 w-full h-full border-0"
                  scrolling="no"
                  allow="fullscreen; encrypted-media; picture-in-picture"
                  sandbox="allow-scripts allow-same-origin allow-presentation"
                  allowFullScreen
                />
              </div>
            </div>
            <p className="mt-3 text-center text-xs text-zinc-500">
              <a
                href="https://www.bilibili.com/video/BV1WXDABGEB7/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 hover:text-amber-300 hover:underline"
              >
                在外部页面观看完整视频
              </a>
            </p>
          </div>
          <div id="demo-wizard" className="scroll-mt-28">
            <h3 className="mb-2 text-center text-base font-bold text-zinc-100 sm:text-lg">
              功能演示 2 · 网页自动化向导
            </h3>
            <p className="mb-5 text-center text-sm text-zinc-500 sm:text-base">
              《用程序员的方式一人运营十个自媒体账号》
            </p>
            <div className={videoFrameClass}>
              <div className={`${videoInnerClass} aspect-video`}>
                <iframe
                  title="Panda Video Generator · 网页自动化向导"
                  src="https://player.bilibili.com/player.html?bvid=BV141XfB3ELj&autoplay=0&danmaku=0"
                  className="absolute inset-0 w-full h-full border-0"
                  scrolling="no"
                  allow="fullscreen; encrypted-media; picture-in-picture"
                  sandbox="allow-scripts allow-same-origin allow-presentation"
                  allowFullScreen
                />
              </div>
            </div>
            <p className="mt-3 text-center text-xs text-zinc-500">
              <a
                href="https://www.bilibili.com/video/BV141XfB3ELj/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 hover:text-amber-300 hover:underline"
              >
                在外部页面观看完整视频
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* Features — distinct product cards (not pipeline / mono spec style) */}
      <section className={`${shell} py-14 sm:py-20`}>
        <SectionTitle eyebrow="产品亮点" title="核心特性" />
        {/*
         * Same width design as the home page's product grid: one column until
         * lg, capped at max-w-2xl so a single card doesn't stretch across a
         * tablet, then the cap releases and it goes multi-column. This is what
         * keeps the Chinese copy off the mid-phrase line breaks at 768px.
         */}
        <div className="mx-auto mt-12 grid max-w-2xl grid-cols-1 gap-5 sm:gap-6 md:mt-16 lg:max-w-none lg:grid-cols-2 xl:grid-cols-3">
          <article className={cardClass}>
            <div className={iconTileClass} aria-hidden>
              <Globe className="size-5" strokeWidth={1.75} />
            </div>
            <h3 className={cardTitleClass}>一键网页转文本</h3>
            <p className="mt-3 grow text-sm leading-relaxed text-zinc-400">
              抓取正文与标题（如知乎），输出结构化文件，少手工整理。
            </p>
            <ul className="mt-6 flex flex-wrap gap-2">
              <li className={tagPillClass}>网页提取</li>
              <li className={tagPillClass}>结构化输出</li>
            </ul>
          </article>

          <article className={cardClass}>
            <div className={iconTileClass} aria-hidden>
              <Video className="size-5" strokeWidth={1.75} />
            </div>
            <h3 className={cardTitleClass}>一键文本转视频</h3>
            <p className="mt-3 grow text-sm leading-relaxed text-zinc-400">
              跑通口播链路：Edge TTS + VTT 字幕，Remotion 模板渲染成片。
            </p>
            <ul className="mt-6 flex flex-wrap gap-2">
              <li className={tagPillClass}>Edge TTS</li>
              <li className={tagPillClass}>Remotion</li>
              <li className={tagPillClass}>字幕 VTT</li>
            </ul>
          </article>

          <article className={cardClass}>
            <div className={iconTileClass} aria-hidden>
              <Upload className="size-5" strokeWidth={1.75} />
            </div>
            <h3 className={cardTitleClass}>一键多平台发布</h3>
            <p className="mt-3 grow text-sm leading-relaxed text-zinc-400">
              驱动浏览器自动化上传；B 站、抖音、视频号、YouTube、快手等共用相近流程。
            </p>
            <ul className="mt-6 flex flex-wrap gap-2">
              <li className={tagPillClass}>Playwright</li>
              <li className={tagPillClass}>网页端上传</li>
            </ul>
          </article>
        </div>
      </section>

      {/* Onboarding paths — matches README「接入方式」 */}
      <section className={`${shell} py-14 sm:py-20`}>
        <SectionTitle
          eyebrow="三种路径"
          title="接入方式"
          subtitle="任选 Agent、浏览器向导或 CLI，同一套能力不同上手姿势。"
        />
        {/*
         * Same width design as 核心特性 and as the home page's product grid.
         * These cards carry bullet lists, so they need the extra measure most.
         */}
        <div className="mx-auto mt-12 grid max-w-2xl grid-cols-1 gap-5 sm:gap-6 md:mt-16 lg:max-w-none lg:grid-cols-2 xl:grid-cols-3">
          <article className={cardClass}>
            <div className={iconTileClass} aria-hidden>
              <Bot className="size-5" strokeWidth={1.75} />
            </div>
            <h3 className={cardTitleClass}>Agent Skills 方式</h3>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-zinc-400">
              <li>使用 AI Agent 编排视频生成与发布流程。</li>
              <li>支持口播流水线、爬虫、TTS、渲染与发布等技能。</li>
              <li>支持 Cursor、Claude Code、Copilot 等常用 AI Agent。</li>
            </ul>
            <p className="mt-auto pt-5 text-sm text-zinc-300">
              <a href="#demo-agent" className="text-amber-400/95 hover:text-amber-300 hover:underline">
                演示视频
              </a>
              <span className="text-zinc-600"> / </span>
              <a
                href="https://github.com/szhshp/panda-video-generator#agent-skills"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400/95 hover:text-amber-300 hover:underline"
              >
                查看更多
              </a>
            </p>
          </article>

          <article className={cardClass}>
            <div className={iconTileClass} aria-hidden>
              <Compass className="size-5" strokeWidth={1.75} />
            </div>
            <h3 className={cardTitleClass}>网页端自动化向导方式</h3>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-zinc-400">
              <li>
                通过傻瓜式{" "}
                <a
                  href="https://github.com/szhshp/panda-video-generator#wizard-automation"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400/95 hover:text-amber-300 hover:underline"
                >
                  自动化向导
                </a>
                ，无需手写命令。
              </li>
              <li>在浏览器中按步骤完成文稿、TTS 与成片渲染。</li>
              <li>多平台发布为可选步骤，可按需执行。</li>
            </ul>
            <p className="mt-auto pt-5 text-sm text-zinc-300">
              <a href="#demo-wizard" className="text-amber-400/95 hover:text-amber-300 hover:underline">
                演示视频
              </a>
              <span className="text-zinc-600"> / </span>
              <a
                href="https://github.com/szhshp/panda-video-generator#wizard-automation"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400/95 hover:text-amber-300 hover:underline"
              >
                查看更多
              </a>
            </p>
          </article>

          <article className={cardClass}>
            <div className={iconTileClass} aria-hidden>
              <Terminal className="size-5" strokeWidth={1.75} />
            </div>
            <h3 className={cardTitleClass}>CLI 命令行</h3>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-zinc-400">
              <li>与向导共用同一套 pnpm 脚本：爬虫、TTS、Remotion 渲染与发布。</li>
              <li>适合终端操作、自有 CI 或与 shell、cron 等自动化对接。</li>
              <li>
                命令与输出目录见{" "}
                <a
                  href="https://github.com/szhshp/panda-video-generator/blob/main/docs/cli-usage-guide.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400/95 hover:text-amber-300 hover:underline"
                >
                  CLI 使用指南
                </a>
                。
              </li>
            </ul>
            <p className="mt-auto pt-5 text-sm text-zinc-300">
              <a
                href="https://github.com/szhshp/panda-video-generator#cli-usage-guide"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400/95 hover:text-amber-300 hover:underline"
              >
                查看 CLI 使用指南
              </a>
            </p>
          </article>
        </div>
      </section>




      {/* Finished work showcase */}
      <section className="container mx-auto px-4 py-14 sm:px-6 sm:py-20">
        <SectionTitle eyebrow="成片预览" title="成品展示" />
        <div className="mx-auto mt-12 flex max-w-4xl flex-col gap-14 sm:mt-16 sm:gap-16">
          <div className={videoFrameClass}>
            <div className={`${videoInnerClass} aspect-video`}>
              <iframe
                title="Panda Video Generator 成品展示 1"
                src="https://player.bilibili.com/player.html?bvid=BV1ZnDcBsEK7&autoplay=0&danmaku=0"
                className="absolute inset-0 w-full h-full border-0"
                scrolling="no"
                allow="fullscreen; encrypted-media; picture-in-picture"
                sandbox="allow-scripts allow-same-origin allow-presentation"
                allowFullScreen
              />
            </div>
          </div>
          <p className="mt-3 text-center text-xs text-zinc-500">
            <a
              href="https://www.bilibili.com/video/BV1ZnDcBsEK7/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:text-amber-300 hover:underline"
            >
              在外部页面观看完整视频
            </a>
          </p>
          <div className={videoFrameClass}>
            <div className={`${videoInnerClass} aspect-video`}>
              <iframe
                title="Panda Video Generator 成品展示 2"
                src="https://player.bilibili.com/player.html?bvid=BV19Rw9zwEd4&autoplay=0&danmaku=0"
                className="absolute inset-0 w-full h-full border-0"
                scrolling="no"
                allow="fullscreen; encrypted-media; picture-in-picture"
                sandbox="allow-scripts allow-same-origin allow-presentation"
                allowFullScreen
              />
            </div>
          </div>
          <p className="mt-3 text-center text-xs text-zinc-500">
            <a
              href="https://www.bilibili.com/video/BV19Rw9zwEd4/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:text-amber-300 hover:underline"
            >
              在外部页面观看完整视频
            </a>
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
