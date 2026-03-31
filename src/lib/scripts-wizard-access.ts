/**
 * Gate for the /scripts automation wizard (see src/middleware.ts).
 *
 * - Unset: enabled only when NODE_ENV === "development"
 * - ALLOW_SCRIPTS_WIZARD=1 | true | on | yes: enabled in any environment
 * - ALLOW_SCRIPTS_WIZARD=0 | false | off | no: disabled (including development)
 *
 * Any other non-empty value: enabled in development only (same as unset in prod).
 */
export function isScriptsWizardEnabled(): boolean {
  const raw = process.env.ALLOW_SCRIPTS_WIZARD;
  if (raw === undefined || raw === "") {
    return process.env.NODE_ENV === "development";
  }
  const v = raw.trim().toLowerCase();
  if (v === "0" || v === "false" || v === "off" || v === "no") {
    return false;
  }
  if (v === "1" || v === "true" || v === "on" || v === "yes") {
    return true;
  }
  return process.env.NODE_ENV === "development";
}
