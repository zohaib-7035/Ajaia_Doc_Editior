import { NextResponse } from "next/server";
import { z } from "zod";
import { handle, requireUser } from "@/lib/http";
import { contentSchema, createDoc, EMPTY_DOC, listDocs, titleSchema } from "@/lib/docs";

export const GET = handle(async () => NextResponse.json(await listDocs(await requireUser())));

const createSchema = z.object({ title: titleSchema.optional(), content: contentSchema.optional() });

export const POST = handle(async (req: Request) => {
  const user = await requireUser();
  const body = createSchema.parse(await req.json().catch(() => ({})));
  const doc = await createDoc(user, body.title ?? "Untitled document", body.content ?? EMPTY_DOC);
  return NextResponse.json(doc, { status: 201 });
});
