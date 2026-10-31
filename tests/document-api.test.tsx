import { beforeEach, describe, expect, it, vi } from "vitest";

const { listDemoDocuments, getDemoDocument } = vi.hoisted(() => ({
  listDemoDocuments: vi.fn(),
  getDemoDocument: vi.fn(),
}));

vi.mock("@/lib/documents", () => ({ listDemoDocuments, getDemoDocument }));

import { GET as getDocument } from "@/app/api/workspaces/[workspaceId]/documents/[documentId]/route";
import { GET as getDocuments } from "@/app/api/workspaces/[workspaceId]/documents/route";

const request = new Request("http://localhost/api/workspaces/sample-studio/documents");

describe("document read API", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns a private, uncached document list", async () => {
    listDemoDocuments.mockResolvedValue([{ id: "sample-brief", title: "Fictional brief" }]);

    const response = await getDocuments(request, { params: Promise.resolve({ workspaceId: "sample-studio" }) });

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    await expect(response.json()).resolves.toEqual({
      documents: [{ id: "sample-brief", title: "Fictional brief" }],
    });
    expect(listDemoDocuments).toHaveBeenCalledWith("sample-studio");
  });

  it("returns 404 for a workspace the sample member cannot read", async () => {
    listDemoDocuments.mockResolvedValue(null);

    const response = await getDocuments(request, { params: Promise.resolve({ workspaceId: "outside" }) });

    expect(response.status).toBe(404);
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    await expect(response.json()).resolves.toEqual({ error: "Workspace not found." });
  });

  it("returns a generic uncached error when the list read fails", async () => {
    listDemoDocuments.mockRejectedValue(new Error("database detail must remain private"));

    const response = await getDocuments(request, { params: Promise.resolve({ workspaceId: "sample-studio" }) });

    expect(response.status).toBe(500);
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    await expect(response.json()).resolves.toEqual({ error: "Unable to load documents." });
  });

  it("returns a scoped document detail and generic missing/error responses", async () => {
    getDemoDocument.mockResolvedValue({ id: "sample-brief", body: "Synthetic body." });
    const context = { params: Promise.resolve({ workspaceId: "sample-studio", documentId: "sample-brief" }) };
    const success = await getDocument(request, context);

    expect(success.status).toBe(200);
    expect(success.headers.get("Cache-Control")).toBe("private, no-store");
    await expect(success.json()).resolves.toEqual({ document: { id: "sample-brief", body: "Synthetic body." } });
    expect(getDemoDocument).toHaveBeenCalledWith("sample-studio", "sample-brief");

    getDemoDocument.mockResolvedValueOnce(null);
    const missing = await getDocument(request, context);
    expect(missing.status).toBe(404);
    await expect(missing.json()).resolves.toEqual({ error: "Document not found." });

    getDemoDocument.mockRejectedValueOnce(new Error("database detail must remain private"));
    const failed = await getDocument(request, context);
    expect(failed.status).toBe(500);
    expect(failed.headers.get("Cache-Control")).toBe("private, no-store");
    await expect(failed.json()).resolves.toEqual({ error: "Unable to load this document." });
  });
});
