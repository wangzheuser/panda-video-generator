import type { LucideIcon } from "lucide-react";

export type Step = {
  /** Short label for the stage, e.g. "文稿准备". */
  title: string;
  /** One line saying what actually happens at this stage. */
  description: string;
  icon: LucideIcon;
  /** Optional keywords — the concrete tools or outputs of the stage. */
  tags?: readonly string[];
};

/*
 * A read-only map of a page's own workflow.
 *
 * The steps are a genuine sequence, which is the only thing that earns the
 * ghost numerals in the corner — they encode order, not decoration. Nothing
 * here is clickable: each page's real controls live in the sections below, and
 * duplicating them as links would promise navigation that does not exist.
 */
export default function Steps({ steps }: { steps: readonly Step[] }) {
  /*
   * Three-step flows would leave a dead column in a four-up grid, so the column
   * count follows the data. Both literals stay written out in full — Tailwind
   * only sees class names it can find in the source.
   */
  const columnsClass = steps.length === 3 ? "xl:grid-cols-3" : "xl:grid-cols-4";

  return (
    <ol className={`mt-10 grid gap-4 sm:grid-cols-2 sm:gap-5 ${columnsClass}`}>
      {steps.map((step, index) => (
        <li
          key={step.title}
          className="relative flex h-full flex-col rounded-2xl border border-white/20 bg-gradient-to-b from-[#1d1d20] to-[#141416] p-5 sm:p-6"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute right-4 top-2 text-[3.25rem] font-black leading-none tabular-nums text-white/[0.05] select-none"
          >
            {index + 1}
          </span>

          <span
            aria-hidden
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-amber-300 ring-1 ring-white/10"
          >
            <step.icon className="size-5" strokeWidth={1.75} />
          </span>

          <h3 className="mt-4 text-base font-semibold tracking-tight text-neutral-50">
            {step.title}
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-neutral-400">
            {step.description}
          </p>

          {step.tags?.length ? (
            <ul className="mt-auto flex flex-wrap gap-1.5 pt-4">
              {step.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full border border-white/[0.08] px-2 py-0.5 text-[0.7rem] text-neutral-500"
                >
                  {tag}
                </li>
              ))}
            </ul>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
