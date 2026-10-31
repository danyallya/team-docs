import "server-only";
import { prisma } from "@/lib/prisma";
import type { DocumentDetail, DocumentListItem } from "@/lib/document-view";

const demoUserId = "sample-author";

export async function listDemoDocuments(workspaceId: string): Promise<DocumentListItem[] | null> {
  const workspace = await prisma.workspace.findFirst({
    where: { id: workspaceId, memberships: { some: { userId: demoUserId } } },
    select: {
      documents: {
        orderBy: [{ title: "asc" }, { id: "asc" }],
        select: {
          id: true,
          workspaceId: true,
          title: true,
          summary: true,
          status: true,
          updatedAt: true,
          author: { select: { name: true } },
        },
      },
    },
  });

  if (!workspace) return null;
  return workspace.documents.map((document) => ({
    id: document.id,
    workspaceId: document.workspaceId,
    title: document.title,
    summary: document.summary,
    status: document.status,
    authorName: document.author.name,
    updatedAt: document.updatedAt.toISOString(),
  }));
}

export async function getDemoDocument(
  workspaceId: string,
  documentId: string,
): Promise<DocumentDetail | null> {
  const document = await prisma.document.findFirst({
    where: {
      id: documentId,
      workspaceId,
      workspace: { memberships: { some: { userId: demoUserId } } },
    },
    select: {
      id: true,
      workspaceId: true,
      title: true,
      summary: true,
      body: true,
      status: true,
      updatedAt: true,
      author: { select: { name: true } },
    },
  });

  if (!document) return null;
  return {
    id: document.id,
    workspaceId: document.workspaceId,
    title: document.title,
    summary: document.summary,
    body: document.body,
    status: document.status,
    authorName: document.author.name,
    updatedAt: document.updatedAt.toISOString(),
  };
}
