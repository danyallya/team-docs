import { LibraryView } from "@/components/library-view";
import { getDemoDocument, listDemoDocuments } from "@/lib/documents";
import type { DocumentDetail, DocumentListItem } from "@/lib/document-view";
import { getDefaultWorkspaceId, type WorkspaceSummary } from "@/lib/workspace-view";
import { listDemoWorkspaces } from "@/lib/workspaces";

export const dynamic = "force-dynamic";

export default async function Home() {
  let workspaces: WorkspaceSummary[] = [];
  let initialListError: string | null = null;
  let initialDetailError: string | null = null;
  let initialDocuments: DocumentListItem[] = [];
  let initialDocument: DocumentDetail | null = null;
  try {
    workspaces = await listDemoWorkspaces();
  } catch {
    initialListError = "We couldn't load the library. Please try again.";
  }
  const defaultWorkspaceId = getDefaultWorkspaceId(workspaces);

  if (defaultWorkspaceId && !initialListError) {
    try {
      const documents = await listDemoDocuments(defaultWorkspaceId);
      if (documents === null) {
        initialListError = "We couldn't load this workspace's documents. Please try again.";
      } else {
        initialDocuments = documents;
        if (documents[0]) {
          try {
            initialDocument = await getDemoDocument(defaultWorkspaceId, documents[0].id);
            if (!initialDocument) {
              initialDetailError = "We couldn't load this document. Please try again.";
            }
          } catch {
            initialDetailError = "We couldn't load this document. Please try again.";
          }
        }
      }
    } catch {
      initialListError = "We couldn't load this workspace's documents. Please try again.";
    }
  }

  return (
    <LibraryView
      workspaces={workspaces}
      initialDocuments={initialDocuments}
      initialDocument={initialDocument}
      initialListError={initialListError}
      initialDetailError={initialDetailError}
    />
  );
}
