import { NextResponse } from "next/server";
import { z } from "zod";
import { handle, idSchema, requireUser } from "@/lib/http";
import { contentSchema, deleteDoc, getDoc, titleSchema, updateDoc } from "@/lib/docs";

type Ctx = { params: Promise<{ id: string }> };

export const GET = handle(async (_req: Request, { params }: Ctx) => {
  const id = idSchema.parse((await params).id);
  return NextResponse.json(await getDoc(id, await requireUser()));
});

const patchSchema = z
  .object({ title: titleSchema.optional(), content: contentSchema.optional() })
  .refine((b) => b.title !== undefined || b.content !== undefined, "Nothing to update");

export const PATCH = handle(async (req: Request, { params }: Ctx) => {
  const id = idSchema.parse((await params).id);
  const body = patchSchema.parse(await req.json());
  return NextResponse.json(await updateDoc(id, await requireUser(), body));
});

export const DELETE = handle(async (_req: Request, { params }: Ctx) => {
  const id = idSchema.parse((await params).id);
  await deleteDoc(id, await requireUser());
  return NextResponse.json({ ok: true });
});
