import { NextResponse } from "next/server";
import { createDemoDocument, listDemoDocuments } from "@/lib/documents";
import { privateHeaders, readDocumentDraft } from "./write-route";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ workspaceId: string }> },
) {
  try {
    const { workspaceId } = await params;
    const documents = await listDemoDocuments(workspaceId);
    if (!documents) {
      return NextResponse.json({ error: "Workspace not found." }, { status: 404, headers: privateHeaders });
    }
    return NextResponse.json({ documents }, { headers: privateHeaders });
  } catch {
    return NextResponse.json(
      { error: "Unable to load documents." },
      { status: 500, headers: privateHeaders },
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string }> },
) {
  const parsed = await readDocumentDraft(request);
  if (parsed.response) return parsed.response;

  try {
    const { workspaceId } = await params;
    const document = await createDemoDocument(workspaceId, parsed.data);
    if (!document) {
      return NextResponse.json({ error: "Workspace not found." }, { status: 404, headers: privateHeaders });
    }
    return NextResponse.json({ document }, { status: 201, headers: privateHeaders });
  } catch {
    return NextResponse.json({ error: "Unable to save this document." }, { status: 500, headers: privateHeaders });
  }
}
