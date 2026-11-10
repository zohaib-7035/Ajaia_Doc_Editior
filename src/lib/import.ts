// Converts an uploaded file into HTML that the editor can load.
// Supported: .txt, .md, .docx up to 1 MB. Everything else is rejected.
import mammoth from "mammoth";
import { marked } from "marked";

export const MAX_IMPORT_BYTES = 1024 * 1024;
export const SUPPORTED_EXTENSIONS = [".txt", ".md", ".docx"] as const;

export class ImportError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Plain text: blank lines become paragraphs, single newlines become <br>. */
export function textToHtml(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${escapeHtml(p).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

export function extensionOf(filename: string): string {
  const i = filename.lastIndexOf(".");
  return i === -1 ? "" : filename.slice(i).toLowerCase();
}

export function titleFromFilename(filename: string): string {
  const base = filename.replace(/\.[^.]+$/, "").trim();
  return (base || "Imported document").slice(0, 200);
}

export async function fileToHtml(filename: string, bytes: Buffer): Promise<string> {
  const ext = extensionOf(filename);
  if (!SUPPORTED_EXTENSIONS.includes(ext as (typeof SUPPORTED_EXTENSIONS)[number])) {
    throw new ImportError(`Unsupported file type "${ext || "none"}". Use .txt, .md or .docx.`, 415);
  }
  if (bytes.length === 0) throw new ImportError("The file is empty.");
  if (bytes.length > MAX_IMPORT_BYTES) throw new ImportError("File is larger than 1 MB.", 413);

  if (ext === ".docx") {
    try {
      const { value } = await mammoth.convertToHtml({ buffer: bytes });
      return value;
    } catch {
      throw new ImportError("Could not read this .docx file. Is it a valid Word document?", 422);
    }
  }
  const text = bytes.toString("utf8");
  if (ext === ".md") return marked.parse(text, { async: false }) as string;
  return textToHtml(text);
}
