import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secretKey = process.env.JWT_SECRET;
const key = secretKey ? new TextEncoder().encode(secretKey) : null;

export async function proxy(request: NextRequest) {
  // We only want to protect /admin paths
  if (!request.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Allow access to the login page itself
  if (request.nextUrl.pathname === "/admin/login") {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get("admin_session");

  if (!sessionCookie || !sessionCookie.value) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  try {
    if (!key) throw new Error("Missing JWT_SECRET");
    
    // Verify the JWT token
    await jwtVerify(sessionCookie.value, key, {
      algorithms: ["HS256"],
    });
    
    // If successful, continue
    return NextResponse.next();
  } catch (error) {
    // If the token is invalid or expired, redirect to login
    const response = NextResponse.redirect(new URL("/admin/login", request.url));
    // Clear the invalid cookie
    response.cookies.delete("admin_session");
    return response;
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
