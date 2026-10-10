/*
 * The section heading used across every product page.
 *
 * It deliberately mirrors the home page's `sectionTitle` / `sectionLead`
 * treatment (see `src/app/page.tsx`) so the product pages read as chapters of
 * the same document rather than three separately-styled microsites. Each page
 * used to carry its own copy of this component in its old mono/zinc language;
 * keeping one copy is what stops them drifting apart again.
 */
export default function SectionTitle({
  eyebrow,
  title,
  subtitle,
  className = "",
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={`px-2 text-center ${className}`}>
      <p className="text-[0.7rem] font-medium tracking-wide text-amber-400/90 sm:text-xs">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-[1.5rem] font-semibold tracking-tight text-neutral-50 sm:text-[2rem]">
        {title}
      </h2>
      {subtitle ? (
        <p className="mx-auto mt-3 max-w-2xl text-balance text-sm leading-relaxed text-neutral-400">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
