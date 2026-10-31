import { beforeEach, describe, expect, it, vi } from "vitest";

const { findWorkspace, findDocument } = vi.hoisted(() => ({
  findWorkspace: vi.fn(),
  findDocument: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    workspace: { findFirst: findWorkspace },
    document: { findFirst: findDocument },
  },
}));

import { getDemoDocument, listDemoDocuments } from "@/lib/documents";

describe("workspace-scoped document reads", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists summary fields only for a workspace with sample-member access", async () => {
    findWorkspace.mockResolvedValue({
      documents: [{
        id: "sample-brief",
        workspaceId: "sample-studio",
        title: "Fictional brief",
        summary: "Synthetic fixture.",
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
});
