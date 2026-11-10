import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handle } from "@/lib/http";

// Public list of seeded demo accounts for the login picker.
export const GET = handle(async () => {
  const { data, error } = await db().from("users").select("id,name,email").order("name");
  if (error) throw new Error(error.message);
  return NextResponse.json({ users: data });
});
