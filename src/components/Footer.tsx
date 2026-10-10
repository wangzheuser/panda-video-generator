import Image from "next/image";
import Link from "next/link";

const GITHUB_REPO = "https://github.com/szhshp/panda-video-generator";

/*
 * Mirrors the home page's shell and focus treatment. The footer is the last
 * thing on every page, so it has to look like it belongs to the same document
 * rather than a bolted-on component — hence the shared neutral palette and the
 * same hairline borders the sections above use.
 */
const shell = "mx-auto w-full max-w-5xl px-5 sm:px-8";
const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950";

/** Grouped by destination rather than by product, so each column answers one question. */
const columns = [
  {
    id: "products",
    heading: "产品",
    links: [
      { label: "PVA-Generator", href: "/landing", external: false },
      { label: "PVA-CLI", href: "/cli", external: false },
      { label: "PVA-NotebookLM", href: "/notebooklm", external: false },
    ],
  },
  {
    id: "links",
    heading: "链接",
    links: [
      { label: "GitHub 仓库", href: GITHUB_REPO, external: true },
      { label: "问题反馈", href: `${GITHUB_REPO}/issues`, external: true },
      { label: "开发者博客", href: "https://szhshp.org", external: true },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/20">
      <div className={`${shell} py-4 sm:py-5`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <div className="max-w-xs">
            <Link
              href="/"
              className={`inline-flex items-center gap-2 rounded-md ${focusRing}`}
            >
              <Image
                src="/logo/logo.png"
                alt=""
                width={32}
                height={32}
                className="size-6 shrink-0 rounded-md bg-white object-contain ring-1 ring-white/10"
              />
              <span className="text-[0.8125rem] font-semibold tracking-tight text-neutral-50">
                Panda Video Automation
              </span>
            </Link>
            <p className="mt-1 text-xs leading-snug text-neutral-500">
              熊猫智研社出品的视频自动化工具集。从素材抓取到多平台分发,每个环节都能单独使用。
            </p>
          </div>

          <nav
            aria-label="页脚导航"
            className="grid grid-cols-2 gap-4 sm:flex sm:gap-6"
          >
            {columns.map((column) => (
              <div key={column.id}>
                <h2 className="text-[0.6875rem] font-medium tracking-wide text-neutral-500">
                  {column.heading}
                </h2>
                <ul className="mt-1 space-y-0.5">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      {link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`-mx-1 rounded px-1 text-xs text-neutral-400 transition-colors hover:text-neutral-100 ${focusRing}`}
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className={`-mx-1 rounded px-1 text-xs text-neutral-400 transition-colors hover:text-neutral-100 ${focusRing}`}
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-3 flex flex-col gap-0.5 border-t border-white/10 pt-2.5 text-[0.6875rem] text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Panda Video Automation</p>
          <p>Made by szhshp × 熊猫智研社</p>
        </div>
      </div>
    </footer>
  );
}
