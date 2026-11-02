import { describe, expect, it } from "vitest";
import { documentDraftSchema, formatDocumentType, validateDocumentDraft } from "@/lib/document-input";

const valid = { title: "  Field notes  ", summary: "  A short fictional summary.  ", type: "RESEARCH", body: "  Synthetic notes.  " };

describe("document draft validation", () => {
  it("trims required fields and keeps the selected document type", () => {
    expect(documentDraftSchema.parse(valid)).toEqual({
      title: "Field notes", summary: "A short fictional summary.", type: "RESEARCH", body: "Synthetic notes.",
    });
  });

  it("rejects empty fields, unsupported types and oversized text at the API boundary", () => {
    expect(validateDocumentDraft({ ...valid, title: "  ", type: "OTHER" })).toMatchObject({
      success: false,
      errors: { title: expect.any(String), type: expect.any(String) },
    });
    expect(documentDraftSchema.safeParse({ ...valid, summary: "x".repeat(281) }).success).toBe(false);
    expect(documentDraftSchema.safeParse({ ...valid, body: "x".repeat(20_001) }).success).toBe(false);
  });

  it("renders known type labels and safely handles unknown legacy values", () => {
    expect(formatDocumentType("PROJECT_BRIEF")).toBe("Project brief");
    expect(formatDocumentType("UNRECOGNIZED")).toBe("Document");
  });
});
