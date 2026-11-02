import { z } from "zod";

export const documentTypeValues = ["STUDIO_GUIDE", "PROJECT_BRIEF", "RESEARCH", "OPERATIONS"] as const;
export type DocumentTypeValue = (typeof documentTypeValues)[number];

export const documentDraftSchema = z.object({
  title: z.string().trim().min(1, "Add a document title.").max(120, "Use 120 characters or fewer."),
  summary: z.string().trim().min(1, "Add a short summary.").max(280, "Use 280 characters or fewer."),
  type: z.enum(documentTypeValues),
  body: z.string().trim().min(1, "Add some document content.").max(20_000, "Keep the document under 20,000 characters."),
});

export type DocumentDraft = z.input<typeof documentDraftSchema>;
export type DocumentDraftErrors = Partial<Record<keyof DocumentDraft, string>>;

export function validateDocumentDraft(value: unknown):
  | { success: true; data: z.output<typeof documentDraftSchema> }
  | { success: false; errors: DocumentDraftErrors } {
  const parsed = documentDraftSchema.safeParse(value);
  if (parsed.success) return { success: true, data: parsed.data };

  const errors: DocumentDraftErrors = {};
  for (const issue of parsed.error.issues) {
    const field = issue.path[0];
    if (typeof field === "string" && field in { title: 1, summary: 1, type: 1, body: 1 }) {
      const key = field as keyof DocumentDraft;
      errors[key] ??= issue.message;
    }
  }
  return { success: false, errors };
}

export function formatDocumentType(value: string): string {
  const labels: Record<DocumentTypeValue, string> = {
    STUDIO_GUIDE: "Studio guide",
    PROJECT_BRIEF: "Project brief",
    RESEARCH: "Research",
    OPERATIONS: "Operations",
  };
  return value in labels ? labels[value as DocumentTypeValue] : "Document";
}
