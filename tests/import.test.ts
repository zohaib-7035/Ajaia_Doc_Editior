import { describe, expect, it } from "vitest";
import { fileToHtml, ImportError, MAX_IMPORT_BYTES, textToHtml, titleFromFilename } from "@/lib/import";

const buf = (s: string) => Buffer.from(s, "utf8");

describe("file import", () => {
  it("converts markdown headings, emphasis and lists to HTML", async () => {
    const html = await fileToHtml("notes.md", buf("# Plan\n\n**bold** and *italic*\n\n- one\n- two\n\n1. first"));
    expect(html).toContain("<h1>Plan</h1>");
    expect(html).toContain("<strong>bold</strong>");
    expect(html).toContain("<em>italic</em>");
    expect(html).toMatch(/<ul>[\s\S]*<li>one<\/li>/);
    expect(html).toContain("<ol>");
  });

  it("turns plain text into escaped paragraphs (no HTML injection)", () => {
    expect(textToHtml("Hello <script>x</script>\nline 2\n\nPara 2")).toBe(
      "<p>Hello &lt;script&gt;x&lt;/script&gt;<br>line 2</p><p>Para 2</p>",
    );
  });

  it("rejects unsupported file types with 415", async () => {
    await expect(fileToHtml("scan.pdf", buf("x"))).rejects.toMatchObject({ status: 415 });
  });

  it("rejects empty and oversized files", async () => {
    await expect(fileToHtml("a.txt", Buffer.alloc(0))).rejects.toBeInstanceOf(ImportError);
    await expect(fileToHtml("a.txt", Buffer.alloc(MAX_IMPORT_BYTES + 1, 97))).rejects.toMatchObject({ status: 413 });
  });

  it("gives a clear error for a corrupt .docx", async () => {
    await expect(fileToHtml("broken.docx", buf("not a zip"))).rejects.toMatchObject({ status: 422 });
  });

  it("derives a title from the filename", () => {
    expect(titleFromFilename("Q3 Plan.final.docx")).toBe("Q3 Plan.final");
    expect(titleFromFilename(".md")).toBe("Imported document");
  });
});

describe("docx import", () => {
  it("keeps headings, bold and lists from a real Word file", async () => {
    const { readFileSync } = await import("node:fs");
    const html = await fileToHtml("sample.docx", readFileSync("tests/fixtures/sample.docx"));
    expect(html).toContain("<h1>Care Plan</h1>");
    expect(html).toContain("<strong>Important</strong>");
    expect(html).toContain("First item");
  });
});
