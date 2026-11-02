import { NextResponse } from "next/server";
import { documentDraftSchema } from "@/lib/document-input";
import { canWriteDemoDocuments } from "@/lib/local-document-write-guard";

export const privateHeaders = { "Cache-Control": "private, no-store" };

export async function readDocumentDraft(request: Request) {
  if (!canWriteDemoDocuments(request)) {
    return { response: NextResponse.json({ error: "Document writes are available only in the local development preview." }, { status: 404, headers: privateHeaders }) };
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return { response: NextResponse.json({ error: "Document details must be valid JSON." }, { status: 400, headers: privateHeaders }) };
  }

  const parsed = documentDraftSchema.safeParse(body);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (typeof field === "string" && !(field in fields)) fields[field] = issue.message;
    }
    return { response: NextResponse.json({ error: "Review the document fields.", fields }, { status: 400, headers: privateHeaders }) };
  }
  return { data: parsed.data };
}
