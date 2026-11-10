import { describe, expect, it } from "vitest";
import { can, roleFor, validateShare } from "@/lib/access";

const doc = { ownerId: "alice", sharedWith: ["bob"] };

describe("roleFor", () => {
  it("owner gets owner role", () => expect(roleFor(doc, "alice")).toBe("owner"));
  it("shared user gets editor role", () => expect(roleFor(doc, "bob")).toBe("editor"));
  it("stranger gets no access", () => expect(roleFor(doc, "carol")).toBeNull());
});

describe("permissions", () => {
  it("editor can edit content but cannot rename, share or delete", () => {
    const r = roleFor(doc, "bob");
    expect(can.read(r)).toBe(true);
    expect(can.editContent(r)).toBe(true);
    expect(can.rename(r)).toBe(false);
    expect(can.share(r)).toBe(false);
    expect(can.delete(r)).toBe(false);
  });
  it("no role means nothing is allowed", () => {
    for (const fn of Object.values(can)) expect(fn(null)).toBe(false);
  });
  it("owner can do everything", () => {
    for (const fn of Object.values(can)) expect(fn("owner")).toBe(true);
  });
});

describe("validateShare", () => {
  it("rejects unknown users with 404", () => expect(validateShare("alice", null, [])).toMatchObject({ ok: false, status: 404 }));
  it("rejects sharing with yourself", () => expect(validateShare("alice", { id: "alice" }, [])).toMatchObject({ ok: false, status: 400 }));
  it("rejects duplicates with 409", () => expect(validateShare("alice", { id: "bob" }, ["bob"])).toMatchObject({ ok: false, status: 409 }));
  it("accepts a new collaborator", () => expect(validateShare("alice", { id: "carol" }, ["bob"])).toEqual({ ok: true }));
});
