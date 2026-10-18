import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  Github,
  Lightbulb,
  Music2,
} from "lucide-react";
import Footer from "../components/Footer";

/**
 * Home page — product index for the PVA suite.
 * Restraint rules: neutral greyscale chrome, one accent (amber) reserved for
 * keyboard focus and the pipeline's terminal node. Product identity comes from
 * the logo artwork, never from the UI shell.
 */

const GITHUB_REPO = "https://github.com/szhshp/panda-video-generator";

/** The pipeline is a real sequence, so it gets the rail diagram. */
const pipeline = [
  { id: "capture", label: "抓取素材", note: "网页 / 视频 / 文档" },
  { id: "script", label: "生成脚本", note: "AI 整理与改写" },
  { id: "render", label: "渲染成片", note: "字幕 + 配音 + 合成" },
  { id: "publish", label: "多平台发布", note: "抖音 / 视频号 / 快手 / B站" },
];

/**
 * One hue per product, and only one. Each card's gradient runs between two
 * shades of a single hue family — never two different hues.
 */
const tones = {
  amber: {
    card: "border-amber-600/40 bg-gradient-to-b from-[#452f0d] to-[#221807] hover:border-amber-500/60 hover:shadow-[0_24px_80px_-32px_rgba(251,191,36,0.4)]",
    title: "text-amber-200",
    cta: "border-amber-500/30 bg-amber-500/15 text-amber-100 group-hover:border-amber-400/50 group-hover:bg-amber-500/25",
  },
  emerald: {
    card: "border-emerald-600/40 bg-gradient-to-b from-[#0f3524] to-[#081a11] hover:border-emerald-500/60 hover:shadow-[0_24px_80px_-32px_rgba(52,211,153,0.35)]",
    title: "text-emerald-200",
    cta: "border-emerald-500/30 bg-emerald-500/15 text-emerald-100 group-hover:border-emerald-400/50 group-hover:bg-emerald-500/25",
  },
  purple: {
    card: "border-purple-600/40 bg-gradient-to-b from-[#2f1d47] to-[#170e24] hover:border-purple-500/60 hover:shadow-[0_24px_80px_-32px_rgba(192,132,252,0.35)]",
    title: "text-purple-200",
    cta: "border-purple-500/30 bg-purple-500/15 text-purple-100 group-hover:border-purple-400/50 group-hover:bg-purple-500/25",
  },
  neutral: {
    card: "border-white/[0.10] bg-gradient-to-b from-[#1d1d20] to-[#141416]",
    title: "text-neutral-400",
    cta: "border-white/[0.10] text-neutral-600",
  },
} as const;

type Product = {
  id: string;
  name: string;
  description: string;
  tone: keyof typeof tones;
  /** Omitted while a product has no artwork yet — falls back to an icon tile. */
  logo?: string;
  docsHref?: string;
  repoHref?: string;
  inDevelopment?: boolean;
};

const products: Product[] = [
  {
    id: "generator",
    name: "PVA-Generator",
    description:
      "输入一个主题, 自动完成素材抓取, 脚本撰写与成片渲染, 全程不需要人工干预.",
    tone: "amber",
    logo: "/logo/logo.png",
    docsHref: "/landing",
    repoHref: "https://github.com/szhshp/panda-video-generator",
  },
  {
    id: "cli",
    name: "PVA-CLI",
    description:
      "基于浏览器自动化的发布工具, 一条命令把成片分发到抖音, 视频号, 快手与哔哩哔哩.",
    tone: "emerald",
    logo: "/logo/pva-cli.png",
    docsHref: "/cli",
    repoHref: "https://github.com/szhshp/panda-video-automations-publisher",
  },
  {
    id: "notebooklm",
    name: "PVA-NotebookLM",
    description:
      "输入一个主题, 输出包含课件, 讲解音频与合成视频的完整课程.",
    tone: "purple",
    logo: "/logo/pva-notebooklm.png",
    docsHref: "/notebooklm",
    repoHref: "https://github.com/szhshp/panda-video-automation-notebooklm",
  },
  {
    id: "suno",
    name: "PVA-Suno",
    description: "用文字描述生成完整曲目, 为视频补齐配乐.",
    tone: "neutral",
    inDevelopment: true,
  },
];

/**
 * GitHub button label — the repository's own name. The owner prefix is dropped
 * so the longest repo name still fits the button on a 390px viewport; the full
 * owner/name lives in the button's title attribute.
 */
const repoLabel = (href: string) =>
  href.replace("https://github.com/", "").split("/").pop() ?? href;

/** Platform QR cards. Light artwork, so each keeps its own light mat. */
const platformCards = [
  { id: "douyin", path: "/media/douyin.webp", platform: "抖音" },
  { id: "weichat", path: "/media/weichat.webp", platform: "微信视频号" },
  { id: "kuaishou", path: "/media/kuaishou.webp", platform: "快手" },
  { id: "bilibili", path: "/media/bilibili.webp", platform: "哔哩哔哩" },
];

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950";

const shell = "mx-auto w-full max-w-5xl px-5 sm:px-8";

const sectionTitle =
  "text-center text-[1.5rem] font-semibold tracking-tight text-neutral-50 sm:text-[2rem]";

const sectionLead =
  "mx-auto mt-3 max-w-2xl text-balance text-sm leading-relaxed text-neutral-400";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-950 text-neutral-100">
      <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-neutral-950/80 backdrop-blur-xl backdrop-saturate-150">
        <div className={`${shell} flex h-16 items-center justify-between gap-4`}>
          <Link
            href="/"
            className={`flex items-center gap-2.5 rounded-md ${focusRing}`}
          >
            <Image
              src="/logo/logo.png"
              alt=""
              width={32}
              height={32}
              className="size-8 shrink-0 rounded-md bg-white object-contain ring-1 ring-white/10"
            />
            <span className="hidden text-[0.9375rem] font-semibold tracking-tight text-neutral-50 sm:inline sm:text-base">
              Panda Video Automation
            </span>
          </Link>

          <nav className="flex items-center gap-1 text-sm">
            <a
              href="#products"
              className={`hidden rounded-md px-3 py-1.5 text-neutral-400 transition-colors hover:text-neutral-100 sm:block ${focusRing}`}
            >
              产品
            </a>
            <a
              href="#platforms"
              className={`hidden rounded-md px-3 py-1.5 text-neutral-400 transition-colors hover:text-neutral-100 sm:block ${focusRing}`}
            >
              示例
            </a>
            <a
              href={GITHUB_REPO}
              target="_blank"
              rel="noopener noreferrer"
              className={`ml-1 inline-flex items-center gap-1.5 rounded-md border border-white/[0.12] px-3 py-1.5 text-neutral-200 transition-colors hover:border-white/25 hover:bg-white/[0.06] ${focusRing}`}
            >
              <Github size={16} aria-hidden />
              <span className="hidden sm:inline">GitHub</span>
            </a>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero — the wordmark is the page's focal point */}
        <section className={`${shell} pt-16 pb-16 text-center sm:pt-24 sm:pb-20`}>
          {/*
           * One wordmark, not three words. The spans sit flush so the coloured
           * segments read as a single mark — do not reintroduce whitespace
           * between them. <wbr> gives a break opportunity at each colour
           * boundary, so the mark wraps on narrow screens instead of
           * overflowing, and still renders with no space.
           */}
          <h1 className="text-[2rem] font-bold leading-[1.1] tracking-tight sm:text-[2.5rem] md:text-[2.75rem] lg:text-[3.25rem]">
            <span className="text-amber-400">Panda</span>
            <wbr />
            <span className="text-neutral-300">Video</span>
            <wbr />
            <span className="text-yellow-200">Automations</span>
          </h1>
          <p className="mt-4 text-base font-medium tracking-wide text-neutral-300 sm:text-lg">
            熊猫视频自动化引擎
          </p>

          {/*
           * Slogan — three parallel promises, the page's second-strongest beat.
           * Rendered as three discrete items rather than one comma-joined
           * string, so the repetition in 一键 reads as a rhythm instead of
           * running on. Separators are row-only; on mobile the three stack.
           */}
          <p className="mt-7 flex flex-col items-center gap-y-1.5 text-xl font-semibold text-neutral-50 sm:mt-8 sm:flex-row sm:justify-center sm:gap-x-5 sm:text-3xl lg:text-4xl">
            <span>一键抓取</span>
            <span aria-hidden className="hidden h-6 w-px bg-amber-400/50 sm:block lg:h-8" />
            <span>一键成片</span>
            <span aria-hidden className="hidden h-6 w-px bg-amber-400/50 sm:block lg:h-8" />
            <span>一键发布</span>
          </p>

          <p className="mx-auto mt-4 max-w-2xl text-balance text-sm leading-relaxed text-neutral-400 sm:text-base">
            从素材抓取、脚本生成、渲染成片到多平台分发。每个环节都能单独使用,也可以串成一条完整的流水线。
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:mt-10">
            <a
              href="#products"
              className={`inline-flex items-center gap-2 rounded-lg bg-neutral-100 px-5 py-2.5 text-sm font-semibold text-neutral-950 transition-colors hover:bg-white ${focusRing}`}
            >
              查看产品
              <ArrowRight size={16} aria-hidden />
            </a>

          </div>

          {/* Pipeline rail — the one structural device on the page */}
          <div className="relative mt-16 sm:mt-20">
            <span
              aria-hidden
              className="absolute left-1/4 right-1/4 top-[3.5px] hidden h-px bg-white/[0.12] sm:block sm:left-[12.5%] sm:right-[12.5%]"
            />
            <ol className="relative grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-4">
              {pipeline.map((step, index) => {
                const isLast = index === pipeline.length - 1;
                return (
                  <li
                    key={step.id}
                    className="flex flex-col items-center text-center"
                  >
                    <span
                      aria-hidden
                      className={`size-[7px] rounded-full ring-4 ring-neutral-950 ${isLast ? "bg-amber-400" : "bg-neutral-600"
                        }`}
                    />
                    <p className="mt-4 text-sm font-medium text-neutral-100">
                      {step.label}
                    </p>
                    <p className="mt-1 max-w-[14rem] text-balance text-xs leading-relaxed text-neutral-500">
                      {step.note}
                    </p>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        {/* Product index */}
        <section id="products" className={`${shell} scroll-mt-20 pb-16 sm:pb-24`}>
          <h2 className={sectionTitle}>产品</h2>
          <p className={sectionLead}>
            四个独立工具。可以只挑一个用,也可以用 PVA 把它们串成一条流水线。
          </p>

          {/*
           * One column until lg (1024), two above. At md the split card comes
           * out narrower than the single-column phone card, so the split waits
           * for lg where two cards clear the comfortable measure.
           *
           * The single column is capped at 2xl so it stops widening before it
           * stretches to the full shell — at 1023 the card is 873px with a
           * narrow margin either side rather than a near-empty 940px.
           */}
          <ul className="mx-auto mt-12 grid max-w-2xl grid-cols-1 gap-5 sm:gap-6 lg:max-w-none lg:grid-cols-2">
            {products.map((product, index) => {
              const interactive = Boolean(product.docsHref);
              const tone = tones[product.tone];
              return (
                <li
                  key={product.id}
                  className={`group relative flex flex-col rounded-2xl border p-6 transition-[background-color,border-color,box-shadow] duration-300 sm:p-8 ${tone.card}`}
                >
                  {/*
                   * Whole-card target. The content wrapper is pointer-events-none so
                   * clicks on the logo, name and copy fall through to this link; the
                   * GitHub anchor opts back in with pointer-events-auto.
                   */}
                  {product.docsHref ? (
                    <Link
                      href={product.docsHref}
                      aria-label={`${product.name} 使用说明`}
                      className="absolute inset-0 z-0 rounded-2xl"
                    />
                  ) : null}

                  <div className="pointer-events-none relative z-10 flex flex-1 flex-col">
                    {/*
                     * Logo sits centred above the copy and drifts on a slow loop.
                     * The stagger keeps the four cards from bobbing in lockstep.
                     */}
                    {product.logo ? (
                      <Image
                        src={product.logo}
                        alt=""
                        width={320}
                        height={320}
                        style={{ animationDelay: `${index * 0.7}s` }}
                        className="mx-auto size-28 shrink-0 rounded-2xl bg-white object-contain ring-1 ring-white/10 motion-safe:animate-hero-float motion-reduce:animate-none sm:size-32"
                      />
                    ) : (
                      <span
                        aria-hidden
                        style={{ animationDelay: `${index * 0.7}s` }}
                        className="mx-auto inline-flex size-28 shrink-0 items-center justify-center rounded-2xl bg-white/[0.04] text-neutral-500 ring-1 ring-white/[0.08] motion-safe:animate-hero-float motion-reduce:animate-none sm:size-32"
                      >
                        <Music2 className="size-10 sm:size-12" strokeWidth={1.5} />
                      </span>
                    )}

                    <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2">
                      <h3
                        className={`text-xl font-semibold tracking-tight sm:text-2xl ${tone.title}`}
                      >
                        {product.name}
                      </h3>
                      {product.inDevelopment ? (
                        <span className="rounded-full border border-white/[0.12] px-2.5 py-0.5 text-xs text-neutral-500">
                          开发中
                        </span>
                      ) : null}
                    </div>

                    <p className="mt-2.5 text-sm leading-relaxed text-neutral-400">
                      {product.description}
                    </p>

                    {/* Two full-width actions, one per row */}
                    <div className="mt-6 flex flex-col gap-2.5 pt-0 sm:mt-auto sm:pt-8">
                      {interactive ? (
                        <span
                          className={`flex w-full items-center justify-center gap-1.5 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${tone.cta}`}
                        >
                          使用说明
                          <ArrowRight
                            size={15}
                            aria-hidden
                            className="transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
                          />
                        </span>
                      ) : (
                        <span
                          className={`flex w-full items-center justify-center rounded-lg border px-4 py-2.5 text-sm ${tone.cta}`}
                        >
                          尚未发布
                        </span>
                      )}

                      {product.repoHref ? (
                        <a
                          href={product.repoHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${product.name} GitHub 仓库`}
                          title={product.repoHref.replace("https://github.com/", "")}
                          className={`pointer-events-auto flex w-full items-center justify-center gap-2 rounded-lg border border-white/[0.12] px-4 py-2.5 text-sm font-medium text-neutral-300 transition-colors hover:border-white/25 hover:bg-white/[0.08] hover:text-neutral-50 ${focusRing}`}
                        >
                          <Github size={15} aria-hidden className="shrink-0" />
                          {/*
                           * Wraps at the hyphens rather than truncating — the longest
                           * repo name cannot fit a 390px card at a legible size.
                           */}
                          <span className="min-w-0">{repoLabel(product.repoHref)}</span>
                        </a>
                      ) : null}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Issue prompt — a quiet strip below the grid */}
          <a
            href={`${GITHUB_REPO}/issues`}
            target="_blank"
            rel="noopener noreferrer"
            className={`group mt-6 flex flex-col gap-4 rounded-2xl border border-dashed border-white/25 px-6 py-6 transition-colors hover:border-white/45 hover:bg-white/[0.04] sm:flex-row sm:items-center sm:gap-5 sm:px-8 ${focusRing}`}
          >
            <span
              aria-hidden
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-neutral-300 ring-1 ring-white/15"
            >
              <Lightbulb size={20} strokeWidth={1.75} />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-neutral-100">
                缺一个你需要的功能?
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-neutral-400">
                说说你卡在哪一步,或者想要个什么工具,开个 Issue 就行。
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-neutral-300 transition-colors group-hover:text-neutral-50">
              提交 Issue
              <ArrowUpRight
                size={16}
                aria-hidden
                className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none"
              />
            </span>
          </a>
        </section>

        {/* Platform index — the light QR mats are the only source of colour on the page */}
        <section id="platforms" className={`${shell} scroll-mt-20 pb-16 sm:pb-24`}>
          <h2 className={sectionTitle}>平台示例</h2>
          <p className={sectionLead}>
            「熊猫智研社」的内容会同步发到下面四个平台。
          </p>

          {/*
           * Same 1 / 2 escalation as the product grid, then 4 across at lg.
           *
           * The single- and two-column stages are capped at three quarters of
           * the width they would otherwise take, so a QR card stays a readable
           * size on a phone and a tablet instead of scaling with the viewport.
           * The four-column stage is uncapped: by then the cards are small
           * enough that filling the shell is what looks right, and a cap there
           * only reintroduces a gutter either side.
           *
           * Caps are rem because the root font-size is 130%: 18rem is 374px and
           * 30rem is 624px, not 288 and 480.
           */}
          <div className="mx-auto mt-12 grid max-w-[18rem] grid-cols-1 gap-4 sm:gap-5 min-[900px]:max-w-[30rem] min-[900px]:grid-cols-2 lg:max-w-none lg:grid-cols-4">
            {platformCards.map((card) => (
              <figure key={card.id} className="flex flex-col">
                <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-neutral-100 ring-1 ring-white/[0.08]">
                  <Image
                    src={card.path}
                    alt={`${card.platform} 熊猫智研社 二维码`}
                    fill
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-contain"
                  />
                </div>
                <figcaption className="mt-3 text-sm text-neutral-400">
                  {card.platform}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
