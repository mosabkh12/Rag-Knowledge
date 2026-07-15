import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static, _next/image (Next.js internals)
     * - favicon.ico, icon.svg (static assets)
     * - api/* (route handlers check auth themselves via requireUser/
     *   requireAdmin; running middleware on them just adds Next's dev
     *   body-buffering limit for no benefit — see the file-upload 500
     *   this caused for uploads over ~10MB)
     */
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|api/).*)",
  ],
};
