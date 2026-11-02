import "server-only";
import { prisma } from "@/lib/prisma";
import type { DocumentDetail, DocumentListItem } from "@/lib/document-view";
import type { DocumentDraft } from "@/lib/document-input";

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
          type: true,
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
    type: document.type,
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
      type: true,
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
    type: document.type,
    body: document.body,
    status: document.status,
    authorName: document.author.name,
    updatedAt: document.updatedAt.toISOString(),
  };
}

// This identity scopes a synthetic preview only. It is not an authenticated editor.
const demoEditorName = "Nora Ellis";

function toDocumentDetail(document: {
  id: string;
  workspaceId: string;
  title: string;
  summary: string;
  type: string;
  body: string;
  status: string;
  updatedAt: Date;
  author: { name: string };
}): DocumentDetail {
  return {
    id: document.id,
    workspaceId: document.workspaceId,
    title: document.title,
    summary: document.summary,
    type: document.type,
    body: document.body,
    status: document.status,
    authorName: document.author.name,
    updatedAt: document.updatedAt.toISOString(),
  };
}

const detailSelect = {
  id: true,
  workspaceId: true,
  title: true,
  summary: true,
  type: true,
  body: true,
  status: true,
  updatedAt: true,
  author: { select: { name: true } },
} as const;

export async function createDemoDocument(workspaceId: string, draft: DocumentDraft): Promise<DocumentDetail | null> {
  return prisma.$transaction(async (transaction) => {
    const workspace = await transaction.workspace.findFirst({
      where: { id: workspaceId, memberships: { some: { userId: demoUserId } } },
      select: { id: true },
    });
    if (!workspace) return null;

    const document = await transaction.document.create({
      data: {
        workspaceId,
        authorId: demoUserId,
        title: draft.title,
        summary: draft.summary,
        type: draft.type,
        body: draft.body,
        status: "DRAFT",
        revisions: { create: { version: 1, body: draft.body, editorName: demoEditorName } },
      },
      select: detailSelect,
    });
    return toDocumentDetail(document);
  });
}

export async function updateDemoDocument(
  workspaceId: string,
  documentId: string,
  draft: DocumentDraft,
): Promise<DocumentDetail | null> {
  return prisma.$transaction(async (transaction) => {
    const current = await transaction.document.findFirst({
      where: {
        id: documentId,
        workspaceId,
        workspace: { memberships: { some: { userId: demoUserId } } },
      },
      select: {
        id: true,
        body: true,
        revisions: { orderBy: { version: "desc" }, take: 1, select: { version: true } },
      },
    });
    if (!current) return null;

    const changedBody = current.body !== draft.body;
    const document = await transaction.document.update({
      where: { id: current.id },
      data: {
        title: draft.title,
        summary: draft.summary,
        type: draft.type,
        body: draft.body,
        ...(changedBody ? {
          revisions: {
            create: {
              version: (current.revisions[0]?.version ?? 0) + 1,
              body: draft.body,
              editorName: demoEditorName,
            },
          },
        } : {}),
      },
      select: detailSelect,
    });
    return toDocumentDetail(document);
  });
}
