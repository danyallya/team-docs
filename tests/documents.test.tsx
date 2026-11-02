import { beforeEach, describe, expect, it, vi } from "vitest";

const { findWorkspace, findDocument, createDocument, updateDocument, transaction } = vi.hoisted(() => ({
  findWorkspace: vi.fn(),
  findDocument: vi.fn(),
  createDocument: vi.fn(),
  updateDocument: vi.fn(),
  transaction: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    workspace: { findFirst: findWorkspace },
    document: { findFirst: findDocument, create: createDocument, update: updateDocument },
    $transaction: transaction,
  },
}));

import { createDemoDocument, getDemoDocument, listDemoDocuments, updateDemoDocument } from "@/lib/documents";

describe("workspace-scoped document reads", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    transaction.mockImplementation((callback: (tx: unknown) => unknown) => callback({
      workspace: { findFirst: findWorkspace },
      document: { findFirst: findDocument, create: createDocument, update: updateDocument },
    }));
  });

  it("lists summary fields only for a workspace with sample-member access", async () => {
    findWorkspace.mockResolvedValue({
      documents: [{
        id: "sample-brief",
        workspaceId: "sample-studio",
        title: "Fictional brief",
        summary: "Synthetic fixture.",
        type: "STUDIO_GUIDE",
        status: "DRAFT",
        updatedAt: new Date("2026-10-30T10:00:00.000Z"),
        author: { name: "Nora Ellis" },
      }],
    });

    await expect(listDemoDocuments("sample-studio")).resolves.toEqual([{
      id: "sample-brief",
      workspaceId: "sample-studio",
      title: "Fictional brief",
      summary: "Synthetic fixture.",
      type: "STUDIO_GUIDE",
      status: "DRAFT",
      authorName: "Nora Ellis",
      updatedAt: "2026-10-30T10:00:00.000Z",
    }]);
    expect(findWorkspace).toHaveBeenCalledWith({
      where: { id: "sample-studio", memberships: { some: { userId: "sample-author" } } },
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
  });

  it("does not disclose a workspace outside the sample membership", async () => {
    findWorkspace.mockResolvedValue(null);

    await expect(listDemoDocuments("unlisted-workspace")).resolves.toBeNull();
    expect(findWorkspace).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: "unlisted-workspace", memberships: { some: { userId: "sample-author" } } },
    }));
  });

  it("loads a body only when both document and workspace match an accessible workspace", async () => {
    findDocument.mockResolvedValue({
      id: "sample-brief",
      workspaceId: "sample-studio",
      title: "Fictional brief",
      summary: "Synthetic fixture.",
      type: "PROJECT_BRIEF",
      body: "Synthetic body.",
      status: "PUBLISHED",
      updatedAt: new Date("2026-10-30T10:00:00.000Z"),
      author: { name: "Nora Ellis" },
    });

    await expect(getDemoDocument("sample-studio", "sample-brief")).resolves.toEqual({
      id: "sample-brief",
      workspaceId: "sample-studio",
      title: "Fictional brief",
      summary: "Synthetic fixture.",
      type: "PROJECT_BRIEF",
      body: "Synthetic body.",
      status: "PUBLISHED",
      authorName: "Nora Ellis",
      updatedAt: "2026-10-30T10:00:00.000Z",
    });
    expect(findDocument).toHaveBeenCalledWith({
      where: {
        id: "sample-brief",
        workspaceId: "sample-studio",
        workspace: { memberships: { some: { userId: "sample-author" } } },
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
  });

  it("returns no detail when the document is missing or outside the workspace", async () => {
    findDocument.mockResolvedValue(null);

    await expect(getDemoDocument("sample-field-notes", "sample-brief")).resolves.toBeNull();
    expect(findDocument).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ id: "sample-brief", workspaceId: "sample-field-notes" }),
    }));
  });

  it("creates a typed document and its first body revision atomically for a member workspace", async () => {
    findWorkspace.mockResolvedValue({ id: "sample-studio" });
    createDocument.mockResolvedValue({
      id: "new-brief", workspaceId: "sample-studio", title: "New brief", summary: "Synthetic", type: "PROJECT_BRIEF",
      body: "First body", status: "DRAFT", updatedAt: new Date("2026-11-02T10:00:00.000Z"), author: { name: "Nora Ellis" },
    });
    await expect(createDemoDocument("sample-studio", {
      title: "New brief", summary: "Synthetic", type: "PROJECT_BRIEF", body: "First body",
    })).resolves.toMatchObject({ id: "new-brief", type: "PROJECT_BRIEF", body: "First body", authorName: "Nora Ellis" });
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(findWorkspace).toHaveBeenCalledWith({
      where: { id: "sample-studio", memberships: { some: { userId: "sample-author" } } }, select: { id: true },
    });
    expect(createDocument).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        authorId: "sample-author", workspaceId: "sample-studio", type: "PROJECT_BRIEF", status: "DRAFT",
        revisions: { create: { version: 1, body: "First body", editorName: "Nora Ellis" } },
      }),
    }));
  });

  it("retains the original author and adds a new immutable body version on edit", async () => {
    findDocument.mockResolvedValueOnce({
      id: "sample-brief", body: "Older body", revisions: [{ version: 1 }],
    });
    updateDocument.mockImplementation(async ({ data }) => ({
      id: "sample-brief", workspaceId: "sample-studio", title: data.title, summary: data.summary, type: data.type,
      body: data.body, status: "PUBLISHED", updatedAt: new Date("2026-11-02T11:00:00.000Z"), author: { name: "Original author" },
    }));
    await expect(updateDemoDocument("sample-studio", "sample-brief", {
      title: "Updated brief", summary: "Updated summary", type: "RESEARCH", body: "New body",
    })).resolves.toMatchObject({ title: "Updated brief", type: "RESEARCH", authorName: "Original author" });
    expect(findDocument).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: "sample-brief", workspaceId: "sample-studio", workspace: { memberships: { some: { userId: "sample-author" } } } },
    }));
    expect(updateDocument).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: "sample-brief" },
      data: expect.objectContaining({
        title: "Updated brief", summary: "Updated summary", type: "RESEARCH", body: "New body",
        revisions: { create: { version: 2, body: "New body", editorName: "Nora Ellis" } },
      }),
    }));
  });

  it("does not create a body revision for metadata-only changes", async () => {
    findDocument.mockResolvedValueOnce({ id: "sample-brief", body: "Unchanged", revisions: [{ version: 3 }] });
    updateDocument.mockResolvedValue({
      id: "sample-brief", workspaceId: "sample-studio", title: "Renamed", summary: "Still the same", type: "OPERATIONS",
      body: "Unchanged", status: "DRAFT", updatedAt: new Date("2026-11-02T12:00:00.000Z"), author: { name: "Nora Ellis" },
    });
    await updateDemoDocument("sample-studio", "sample-brief", {
      title: "Renamed", summary: "Still the same", type: "OPERATIONS", body: "Unchanged",
    });
    const call = updateDocument.mock.calls.at(-1)?.[0] as { data: Record<string, unknown> };
    expect(call.data).not.toHaveProperty("revisions");
  });
});
