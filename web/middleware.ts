import { NextRequest, NextResponse } from "next/server";

const REALM = 'Basic realm="Verifacta"';

function unauthorized() {
  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": REALM },
  });
}

export function middleware(req: NextRequest) {
  const user = process.env.JURY_USER;
  const pass = process.env.JURY_PASS;

  // Fail closed in production if credentials aren't configured.
  // In dev we let traffic through so `next dev` works without setup friction.
  if (!user || !pass) {
    if (process.env.NODE_ENV === "production") return unauthorized();
    return NextResponse.next();
  }

  const header = req.headers.get("authorization");
  if (!header?.startsWith("Basic ")) return unauthorized();

  let decoded: string;
  try {
    decoded = atob(header.slice("Basic ".length));
  } catch {
    return unauthorized();
  }

  const sep = decoded.indexOf(":");
  const givenUser = sep >= 0 ? decoded.slice(0, sep) : "";
  const givenPass = sep >= 0 ? decoded.slice(sep + 1) : "";

  if (givenUser !== user || givenPass !== pass) return unauthorized();

  return NextResponse.next();
}

export const config = {
  // Protect everything except Next's static asset paths and the favicon.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
