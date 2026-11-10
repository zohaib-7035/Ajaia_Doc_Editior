import { NextResponse } from "next/server";
import { z } from "zod";
import { handle, idSchema, requireUser } from "@/lib/http";
import { listShares, shareDoc, unshareDoc } from "@/lib/docs";

type Ctx = { params: Promise<{ id: string }> };

export const GET = handle(async (_req: Request, { params }: Ctx) => {
  const id = idSchema.parse((await params).id);
  return NextResponse.json(await listShares(id, await requireUser()));
});

export const POST = handle(async (req: Request, { params }: Ctx) => {
  const id = idSchema.parse((await params).id);
  const { email } = z.object({ email: z.string().trim().email("Enter a valid email") }).parse(await req.json());
  return NextResponse.json(await shareDoc(id, await requireUser(), email), { status: 201 });
});

export const DELETE = handle(async (req: Request, { params }: Ctx) => {
  const id = idSchema.parse((await params).id);
  const { userId } = z.object({ userId: idSchema }).parse(await req.json());
  await unshareDoc(id, await requireUser(), userId);
  return NextResponse.json({ ok: true });
});
