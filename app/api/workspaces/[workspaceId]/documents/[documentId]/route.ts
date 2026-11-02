import { NextResponse } from "next/server";
import { getDemoDocument, updateDemoDocument } from "@/lib/documents";
import { privateHeaders, readDocumentDraft } from "./write-route";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ workspaceId: string; documentId: string }> },
) {
  try {
    const { workspaceId, documentId } = await params;
    const document = await getDemoDocument(workspaceId, documentId);
    if (!document) {
      return NextResponse.json({ error: "Document not found." }, { status: 404, headers: privateHeaders });
    }
    return NextResponse.json({ document }, { headers: privateHeaders });
  } catch {
    return NextResponse.json(
      { error: "Unable to load this document." },
      { status: 500, headers: privateHeaders },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string; documentId: string }> },
) {
  const parsed = await readDocumentDraft(request);
  if (parsed.response) return parsed.response;

  try {
    const { workspaceId, documentId } = await params;
    const document = await updateDemoDocument(workspaceId, documentId, parsed.data);
    if (!document) {
      return NextResponse.json({ error: "Document not found." }, { status: 404, headers: privateHeaders });
    }
    return NextResponse.json({ document }, { headers: privateHeaders });
  } catch {
    return NextResponse.json({ error: "Unable to save this document." }, { status: 500, headers: privateHeaders });
  }
}
