import { NextResponse } from "next/server";
import {
  getAllowedScriptNames,
  isScriptRunnerEnabled,
} from "../../../../lib/dev-script-runner";
import {
  buildScriptOptions,
  collectParamPresetsForScripts,
} from "../../../../lib/script-ui-catalog";

export async function GET() {
  if (!isScriptRunnerEnabled()) {
    return NextResponse.json(
      {
        error:
          "Script runner is only available in development or when ALLOW_SCRIPT_RUNNER=1.",
      },
      { status: 403 },
    );
  }

  const scripts = getAllowedScriptNames();
  return NextResponse.json({
    scripts,
    groups: buildScriptOptions(scripts),
    paramPresets: collectParamPresetsForScripts(scripts),
  });
}
