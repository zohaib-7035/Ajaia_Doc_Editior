import { NextResponse } from "next/server";
import { handle, HttpError, requireUser } from "@/lib/http";
import { fileToHtml, ImportError, titleFromFilename } from "@/lib/import";

export const runtime = "nodejs"; // mammoth needs Node APIs

// Converts an uploaded file to HTML. The browser turns it into editor JSON and creates the doc.
export const POST = handle(async (req: Request) => {
  await requireUser();
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) throw new HttpError(400, "No file uploaded");
  try {
    const html = await fileToHtml(file.name, Buffer.from(await file.arrayBuffer()));
    return NextResponse.json({ title: titleFromFilename(file.name), html });
  } catch (e) {
    if (e instanceof ImportError) throw new HttpError(e.status, e.message);
    throw e;
  }
});
