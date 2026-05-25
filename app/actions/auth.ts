"use server";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const secretKey = process.env.JWT_SECRET;
if (!secretKey) throw new Error("JWT_SECRET is missing");
const key = new TextEncoder().encode(secretKey);

export async function verifyAuth(token: string | undefined) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (error) {
    return null;
  }
}

export async function login(password: string) {
  // Never expose this condition loosely, always exact match
  if (!process.env.ADMIN_PASSWORD) {
    throw new Error("Server configuration error: ADMIN_PASSWORD not set");
  }

  if (password === process.env.ADMIN_PASSWORD) {
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days session
    const session = await new SignJWT({ role: "admin", authenticatedAt: Date.now() })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(key);

    const cookieStore = await cookies();
    cookieStore.set("admin_session", session, {
      expires,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return { success: true };
  }
  
  return { success: false, error: "Invalid password" };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  redirect("/admin/login");
}
