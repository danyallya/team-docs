import { NextResponse } from "next/server";
import { listDemoDocuments } from "@/lib/documents";

export const dynamic = "force-dynamic";

const privateHeaders = { "Cache-Control": "private, no-store" };

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
