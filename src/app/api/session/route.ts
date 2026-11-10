import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { handle, HttpError, requireUser, SESSION_COOKIE } from "@/lib/http";

// Mocked auth: sign in as a seeded user by id.
export const POST = handle(async (req: Request) => {
  const { userId } = z.object({ userId: z.string().uuid("Invalid user") }).parse(await req.json());
  const { data, error } = await db().from("users").select("id").eq("id", userId).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new HttpError(404, "Unknown user");
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, userId, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 7 });
  return res;
});

export const GET = handle(async () => NextResponse.json({ user: await requireUser() }));

export const DELETE = handle(async () => {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(SESSION_COOKIE);
  return res;
});
