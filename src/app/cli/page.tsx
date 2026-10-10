import Link from "next/link";
import {
  ArrowLeft,
  ArrowDown,
  LogIn,
  Terminal,
  Upload,
  Send,
} from "lucide-react";
import Footer from "../../components/Footer";
import SectionTitle from "../../components/SectionTitle";
import Steps from "../../components/Steps";

/* This page's own flow — the CLI does the whole thing in three commands. */
const PUBLISH_STEPS = [
  {
    title: "登录账号",
    description: "一条命令拉起浏览器，扫码登录要发布的平台。",
    icon: LogIn,
    tags: ["账号登录", "Cookie 复用"],
  },
  {
    title: "上传视频",
    description: "指定视频与封面文件，工具负责转码与断点续传。",
    icon: Upload,
    tags: ["视频文件", "封面与标题"],
  },
  {
    title: "发布到多平台",
    description: "一次提交，按各平台规则分别填写并发布。",
    icon: Send,
    tags: ["多平台发布", "批量提交"],
  },
] as const;

const codeBlockClass =
  "mt-4 rounded-xl bg-zinc-950 p-4 font-mono text-sm text-zinc-300 border border-white/[0.05]";

/*
 * Panel surface, matching the flat cards on the landing page: solid fill, solid
 * border, no gradient. The panels used to be graded fills fading into the page
 * background, which left their edges reading as a blur instead of a boundary.
 * No hover state — these are static content blocks.
 */
const panelClass = "mt-12 rounded-2xl border border-white/20 bg-zinc-900 p-6 sm:p-8";

/* Same surface, amber edge — this one is a callout, not just a section body. */
const noticePanelClass =
  "mt-12 rounded-2xl border border-amber-500/40 bg-zinc-900 p-6 sm:p-8";

export default function CliPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-zinc-950 text-zinc-100">
      {/* Ambient background */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(251,191,36,0.14),transparent_55%),radial-gradient(ellipse_80%_50%_at_100%_50%,rgba(34,211,238,0.08),transparent_50%),radial-gradient(ellipse_70%_60%_at_0%_80%,rgba(192,132,252,0.07),transparent_45%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.028)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.028)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_35%,black_15%,transparent_70%)]"
        aria-hidden
      />

      {/*
       * Column width matches the landing page's `shell` (max-w-5xl + px-5/px-8),
       * so every card on this page lines up with the card grids there. The
       * Tailwind `container` class is deliberately not used — it caps by
       * breakpoint, which is narrower than the shell between md and 2xl.
       */}
      <div className="scroll-smooth px-5 py-12 sm:px-8 sm:py-16">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-50 transition-colors"
        >
          <ArrowLeft size={16} />
          返回首页
        </Link>

        <div className="mx-auto w-full max-w-5xl">
          {/* Hero */}
          <div className="mb-8 inline-flex size-14 items-center justify-center rounded-2xl bg-white/[0.06] text-amber-300 ring-1 ring-white/10">
            <Terminal className="size-7" strokeWidth={1.75} />
          </div>

          {/*
           * Wordmark, matching the home page: spans flush, <wbr> at each colour
           * boundary so the long product name wraps instead of overflowing.
           */}
          <h1 className="text-[1.75rem] font-bold leading-[1.15] tracking-tight sm:text-[2.25rem] md:text-[2.5rem] lg:text-[3rem]">
            {/* Brand wordmark — muted grey, no spaces inside it; <wbr> keeps a break point without one */}
            <span className="text-neutral-400">
              Panda<wbr />Video<wbr />Automation
            </span>{" "}
            {/* Product name — accent colour, one space after the wordmark */}
            <span className="text-amber-400">Publisher</span>
          </h1>
          {/*
           * Slogan — mirrors the home page: three parallel promises split by
           * hairline separators, so the repeated 一键 reads as a rhythm instead
           * of running on. Separators are row-only; on mobile the three stack.
           */}
          <p className="mt-6 flex flex-col items-start gap-y-1.5 text-xl font-semibold text-neutral-50 sm:mt-7 sm:flex-row sm:items-center sm:gap-x-5 sm:text-3xl lg:text-4xl">
            <span>一键登录</span>
            <span aria-hidden className="hidden h-6 w-px bg-amber-400/50 sm:block lg:h-8" />
            <span>一键上传</span>
            <span aria-hidden className="hidden h-6 w-px bg-amber-400/50 sm:block lg:h-8" />
            <span>一键发布</span>
          </p>
          <p className="mt-4 max-w-2xl text-balance text-sm leading-relaxed text-neutral-400 sm:text-base">
            跨平台视频上传自动化工具，支持 Bilibili、抖音、快手、微信视频号、YouTube。
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {/* Primary action: jump straight to the install commands further down */}
            <a
              href="#quick-start"
              className="inline-flex items-center gap-2 rounded-xl border border-transparent bg-amber-400 px-5 py-2.5 text-sm font-semibold text-zinc-950 shadow-[0_0_32px_-8px_rgba(251,191,36,0.45)] hover:bg-amber-300 transition-colors"
            >
              快速开始
              <ArrowDown size={16} className="shrink-0" />
            </a>
            <Link
              href="https://github.com/szhshp/panda-video-automations-publisher"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-zinc-100 hover:border-white/25 hover:bg-white/[0.08] transition-colors"
            >
              查看 GitHub 仓库
            </Link>
            <Link
              href="https://www.npmjs.com/package/@panda-video-automation/pva"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-zinc-100 hover:border-white/25 hover:bg-white/[0.08] transition-colors"
            >
              查看 npm 包
            </Link>
          </div>

          {/* Workflow — three commands, in order */}
          <section className="py-14 sm:py-20">
            <SectionTitle
              eyebrow="工作流程"
              title="登录、上传、发布"
              subtitle="三条命令跑完一次跨平台发布。"
            />
            <Steps steps={PUBLISH_STEPS} />
          </section>

          {/* Demo Video */}
          <section className="py-14 sm:py-20">
            <SectionTitle
              eyebrow="实机演示"
              title="功能演示"
              subtitle="CLI 跨平台视频上传操作演示"
            />
            <div className="relative mt-12 overflow-hidden rounded-2xl bg-gradient-to-b from-white/[0.14] via-white/[0.06] to-white/[0.03] p-px shadow-[0_0_80px_-20px_rgba(251,191,36,0.15)]">
              <div className="relative aspect-video w-full overflow-hidden rounded-[0.9rem] border border-zinc-800/90 bg-black shadow-inner shadow-black/60">
                <iframe
                  title="CLI 功能演示"
                  src="https://player.bilibili.com/player.html?bvid=BV15ZG766E4g&autoplay=0&danmaku=0"
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
                href="https://www.bilibili.com/video/BV15ZG766E4g/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:text-emerald-300 hover:underline"
              >
                在外部页面观看完整视频
              </a>
            </p>
          </section>

          {/* Standalone CLI notice */}
          <section className="py-14 sm:py-20">
            <SectionTitle
              eyebrow="产品概览"
              title="独立 CLI 工具"
            />
            <div className={noticePanelClass}>
              <p className="text-sm text-zinc-400 leading-relaxed">
                本 CLI 是 <strong className="text-zinc-200">独立发布的 npm 包</strong>，可在任意项目中单独使用，无需依赖 Panda Video Generator 主项目。
              </p>
              <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                在完整的视频生产流水线中，典型的工作流为：
              </p>
              <div className="mt-4 rounded-xl bg-zinc-950 p-4 font-mono text-sm text-zinc-300 border border-white/[0.05] space-y-1.5">
                <p className="text-zinc-500"># 多种工作流示例</p>
                <p>Suno → 剪辑 → 视频 → <span className="text-emerald-400">pva 发布</span></p>
                <p>网页抓取 → 剪辑 → 视频 → <span className="text-emerald-400">pva 发布</span></p>
                <p>NotebookLM → 生成视频 → <span className="text-emerald-400">pva 发布</span></p>
                <p>... → 视频 → <span className="text-emerald-400">pva 发布</span></p>
              </div>
              <p className="mt-3 text-sm text-zinc-400">
                通过 <code className="text-emerald-400">pva</code> 将成片一键分发到各平台。无论视频来源如何，pva 都能完成跨平台上传。亦可单独用于已有视频的手动上传。
              </p>
            </div>
          </section>

          {/* Quick Install */}
          <section id="quick-start" className="scroll-mt-8 py-14 sm:py-20">
            <SectionTitle
              eyebrow="快速上手"
              title="快速开始"
            />
            <div className={panelClass}>
              <div className={codeBlockClass}>
                <p className="text-zinc-500"># 全局安装（推荐）</p>
                <p className="text-zinc-100">npm install -g @panda-video-automation/pva</p>
              </div>
              <div className={codeBlockClass}>
                <p className="text-zinc-500"># 项目本地安装（配合 scripts）</p>
                <p className="text-zinc-100">npm install --save-dev @panda-video-automation/pva</p>
              </div>
              <p className="mt-3 text-sm text-zinc-500">
                环境要求：Node.js &ge; 20.9.0。全局安装后 <code className="text-emerald-400">pva</code> 命令即可全局使用；本地安装可配合项目 <code className="text-emerald-400">package.json</code> scripts 调用。
              </p>
            </div>
          </section>

          {/* Login */}
          <section className="py-14 sm:py-20">
            <SectionTitle
              eyebrow="操作步骤"
              title="1. 登录"
              subtitle="每个平台只需登录一次"
            />
            <div className={panelClass}>
              <div className={codeBlockClass}>
                <p className="text-zinc-500"># 语法</p>
                <p className="text-zinc-100">pva {'<'}平台{'>'} login</p>
              </div>
              <div className={codeBlockClass}>
                <p className="text-zinc-500"># 示例</p>
                <p className="text-zinc-100">pva bilibili login</p>
              </div>
              <p className="mt-3 text-sm text-zinc-400">
                打开浏览器，手动完成登录后自动检测并持久化 Session。
                后续上传无需重复登录。Session 有效期因平台而异，微信视频号需要每日重新登录。
              </p>
            </div>
          </section>

          {/* Upload */}
          <section className="py-14 sm:py-20">
            <SectionTitle
              eyebrow="操作步骤"
              title="2. 上传视频"
            />
            <div className={panelClass}>
              <div className={codeBlockClass}>
                <p className="text-zinc-500"># 语法</p>
                <p className="text-zinc-100">pva {'<'}平台{'>'} upload --video {'<'}路径{'>'} [options]</p>
              </div>
              <div className={codeBlockClass}>
                <p className="text-zinc-500"># 示例：CLI 参数上传</p>
                <p className="text-zinc-100">pva bilibili upload \</p>
                <p className="text-zinc-100">&nbsp;&nbsp;--video ./video.mp4 \</p>
                <p className="text-zinc-100">&nbsp;&nbsp;--title "My Title" \</p>
                <p className="text-zinc-100">&nbsp;&nbsp;--desc "Description" \</p>
                <p className="text-zinc-100">&nbsp;&nbsp;--tags tag1,tag2</p>
              </div>
              <div className={codeBlockClass}>
                <p className="text-zinc-500"># 环境变量上传</p>
                <p className="text-zinc-500">export</p>
                <p className="text-zinc-500">VIDEO_PATH=./video.mp4</p>
                <p className="text-zinc-500">export VIDEO_TITLE=&quot;My Video&quot;</p>
                <p className="text-zinc-100">pva youtube upload</p>
              </div>
              <div className={codeBlockClass}>
                <p className="text-zinc-500"># 批量发布</p>
                <p className="text-zinc-100">pva bilibili upload &amp;&amp; pva douyin upload &amp;&amp; pva kuaishou upload</p>
              </div>
            </div>
          </section>

          {/* CLI Reference */}
          <section className="py-14 sm:py-20">
            <SectionTitle
              eyebrow="命令参考"
              title="CLI 参考"
            />
            <div className={panelClass}>
              <p className="font-mono text-sm text-zinc-400">
                pva &lt;platform&gt; &lt;action&gt; [options]
              </p>

              <h3 className="mt-6 font-semibold text-zinc-300">平台列表</h3>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06] text-zinc-500">
                      <th className="py-2 pr-4 text-left font-medium">平台</th>
                      <th className="py-2 pr-4 text-left font-medium">标识符</th>
                      <th className="py-2 text-left font-medium">别名</th>
                    </tr>
                  </thead>
                  <tbody className="text-zinc-300">
                    {[
                      ["Bilibili", "bilibili", ""],
                      ["抖音", "douyin", ""],
                      ["快手", "kuaishou", ""],
                      ["微信视频号", "weixin", "weixinvideo、wechat"],
                      ["YouTube", "youtube", "yt"],
                    ].map(([platform, id, alias]) => (
                      <tr key={id} className="border-b border-white/[0.04]">
                        <td className="py-2 pr-4">{platform}</td>
                        <td className="py-2 pr-4 font-mono text-emerald-400">{id}</td>
                        <td className="py-2 font-mono text-zinc-500">{alias || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h3 className="mt-6 font-semibold text-zinc-300">操作</h3>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06] text-zinc-500">
                      <th className="py-2 pr-4 text-left font-medium">操作</th>
                      <th className="py-2 text-left font-medium">说明</th>
                    </tr>
                  </thead>
                  <tbody className="text-zinc-300">
                    <tr className="border-b border-white/[0.04]">
                      <td className="py-2 pr-4 font-mono">login</td>
                      <td className="py-2">登录并保存浏览器 Session</td>
                    </tr>
                    <tr className="border-b border-white/[0.04]">
                      <td className="py-2 pr-4 font-mono">upload</td>
                      <td className="py-2">上传视频及元数据</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="mt-6 font-semibold text-zinc-300">上传参数</h3>
              <p className="mt-1 text-xs text-zinc-500">参数可通过 CLI 标志或环境变量传入。</p>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06] text-zinc-500">
                      <th className="py-2 pr-4 text-left font-medium">参数</th>
                      <th className="py-2 pr-4 text-left font-medium">环境变量</th>
                      <th className="py-2 text-left font-medium">说明</th>
                    </tr>
                  </thead>
                  <tbody className="text-zinc-300">
                    <tr className="border-b border-white/[0.04]">
                      <td className="py-2 pr-4 font-mono">--video</td>
                      <td className="py-2 pr-4 font-mono text-zinc-500">VIDEO_PATH</td>
                      <td className="py-2">视频文件路径（必填）</td>
                    </tr>
                    <tr className="border-b border-white/[0.04]">
                      <td className="py-2 pr-4 font-mono">--title</td>
                      <td className="py-2 pr-4 font-mono text-zinc-500">VIDEO_TITLE</td>
                      <td className="py-2">视频标题（必填）</td>
                    </tr>
                    <tr className="border-b border-white/[0.04]">
                      <td className="py-2 pr-4 font-mono">--desc</td>
                      <td className="py-2 pr-4 font-mono text-zinc-500">VIDEO_DESC</td>
                      <td className="py-2">视频描述</td>
                    </tr>
                    <tr className="border-b border-white/[0.04]">
                      <td className="py-2 pr-4 font-mono">--tags</td>
                      <td className="py-2 pr-4 font-mono text-zinc-500">VIDEO_TAGS</td>
                      <td className="py-2">逗号分隔的标签</td>
                    </tr>
                    <tr className="border-b border-white/[0.04]">
                      <td className="py-2 pr-4 font-mono">--cover</td>
                      <td className="py-2 pr-4 font-mono text-zinc-500">VIDEO_COVER</td>
                      <td className="py-2">封面图片路径</td>
                    </tr>
                    <tr className="border-b border-white/[0.04]">
                      <td className="py-2 pr-4 font-mono">--privacy</td>
                      <td className="py-2 pr-4 font-mono text-zinc-500">VIDEO_PRIVACY</td>
                      <td className="py-2">YouTube：public / unlisted（默认）/ private</td>
                    </tr>
                    <tr className="border-b border-white/[0.04]">
                      <td className="py-2 pr-4 font-mono">--headless</td>
                      <td className="py-2 pr-4 font-mono text-zinc-500">PVA_HEADLESS</td>
                      <td className="py-2">无头模式运行（默认有头）</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Platform Limits */}
          <section className="py-14 sm:py-20">
            <SectionTitle
              eyebrow="平台差异"
              title="平台限制"
            />
            <div className={panelClass}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06] text-zinc-500">
                      <th className="py-2 pr-3 text-left font-medium">平台</th>
                      <th className="py-2 pr-3 text-left font-medium">标题长度</th>
                      <th className="py-2 pr-3 text-left font-medium">描述字段</th>
                      <th className="py-2 text-left font-medium">注意事项</th>
                    </tr>
                  </thead>
                  <tbody className="text-zinc-300">
                    <tr className="border-b border-white/[0.04]">
                      <td className="py-2 pr-3">抖音</td>
                      <td className="py-2 pr-3">30 字</td>
                      <td className="py-2 pr-3">支持</td>
                      <td className="py-2">发布前需勾选"内容为个人观点或见解"</td>
                    </tr>
                    <tr className="border-b border-white/[0.04]">
                      <td className="py-2 pr-3">快手</td>
                      <td className="py-2 pr-3">标题+描述合并</td>
                      <td className="py-2 pr-3">合并到标题</td>
                      <td className="py-2">使用 contenteditable 单一字段</td>
                    </tr>
                    <tr className="border-b border-white/[0.04]">
                      <td className="py-2 pr-3">Bilibili</td>
                      <td className="py-2 pr-3">无严格限制</td>
                      <td className="py-2 pr-3">支持</td>
                      <td className="py-2">支持 AI 生成内容标注</td>
                    </tr>
                    <tr className="border-b border-white/[0.04]">
                      <td className="py-2 pr-3">微信视频号</td>
                      <td className="py-2 pr-3">无严格限制</td>
                      <td className="py-2 pr-3">支持</td>
                      <td className="py-2">使用"昨日数据"文本判断登录状态</td>
                    </tr>
                    <tr className="border-b border-white/[0.04]">
                      <td className="py-2 pr-3">YouTube</td>
                      <td className="py-2 pr-3">无严格限制</td>
                      <td className="py-2 pr-3">支持</td>
                      <td className="py-2">支持隐私级别</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}
