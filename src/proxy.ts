import { NextResponse, type NextRequest } from "next/server";

// Sin cookie de sesion no se entra a las areas de admin, maestro o estudiante.
// La validacion del rol la hace cada layout con requerirRol().
export function proxy(req: NextRequest) {
  if (!req.cookies.get("sesion_usuario")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/maestro/:path*", "/estudiante/:path*"],
};
