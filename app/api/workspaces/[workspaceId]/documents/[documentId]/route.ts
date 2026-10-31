import { NextResponse } from "next/server";
import { getDemoDocument } from "@/lib/documents";

export const dynamic = "force-dynamic";

const privateHeaders = { "Cache-Control": "private, no-store" };

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
