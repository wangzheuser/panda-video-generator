import Link from "next/link";
import { ArrowRight } from "lucide-react";

type Props = {
  href: string;
};

/**
 * Fixed bottom-right CTA to the next wizard step (STEP1–3 only).
 */
export function NextStepFab({ href }: Props) {
  return (
    <Link
      href={href}
      className="fixed bottom-5 right-4 z-50 inline-flex items-center gap-2 rounded-2xl border border-app-cta/35 bg-app-cta px-5 py-3.5 text-base font-semibold text-app-cta-foreground shadow-lg shadow-black/40 ring-1 ring-inset ring-white/10 transition-[transform,box-shadow,background-color] hover:-translate-y-0.5 hover:bg-app-cta-hover hover:shadow-xl hover:shadow-black/45 focus:outline-none focus-visible:ring-2 focus-visible:ring-app-cta/55 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 sm:bottom-8 sm:right-6"
    >
      下一步
      <ArrowRight
        className="size-5 shrink-0 text-app-cta-foreground/95"
        strokeWidth={2}
        aria-hidden
      />
    </Link>
  );
}
