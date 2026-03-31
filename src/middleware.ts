import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isScriptsWizardEnabled } from "./lib/scripts-wizard-access";

export function middleware(request: NextRequest) {
  if (!isScriptsWizardEnabled()) {
    return new NextResponse(null, { status: 404 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/scripts", "/scripts/:path*"],
};
