import "server-only";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { db } from "./db";

export const SESSION_COOKIE = "ajaia_uid";

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export interface User {
  id: string;
  email: string;
  name: string;
}

const uuid = z.string().uuid();

/** Mocked auth: the cookie holds a seeded user's id. Verified against the DB on every request. */
export async function requireUser(): Promise<User> {
  const uid = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!uid || !uuid.safeParse(uid).success) throw new HttpError(401, "Not signed in");
  const { data, error } = await db().from("users").select("id,email,name").eq("id", uid).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new HttpError(401, "Unknown user");
  return data;
}

/** Wraps a route handler with consistent JSON errors. Never leaks internals. */
export function handle<A extends unknown[]>(fn: (...args: A) => Promise<Response>) {
  return async (...args: A) => {
    try {
      return await fn(...args);
    } catch (e) {
      if (e instanceof HttpError) return NextResponse.json({ error: e.message }, { status: e.status });
      if (e instanceof z.ZodError)
        return NextResponse.json({ error: e.issues[0]?.message ?? "Invalid input" }, { status: 400 });
      console.error("[api]", e instanceof Error ? e.message : e); // message only, no document content
      return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
    }
  };
}

export const idSchema = uuid;
