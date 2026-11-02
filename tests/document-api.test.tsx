import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { listDemoDocuments, getDemoDocument, createDemoDocument, updateDemoDocument } = vi.hoisted(() => ({
  listDemoDocuments: vi.fn(),
  getDemoDocument: vi.fn(),
  createDemoDocument: vi.fn(),
  updateDemoDocument: vi.fn(),
}));

vi.mock("@/lib/documents", () => ({ listDemoDocuments, getDemoDocument, createDemoDocument, updateDemoDocument }));

import { GET as getDocument } from "@/app/api/workspaces/[workspaceId]/documents/[documentId]/route";
import { PATCH as updateDocument } from "@/app/api/workspaces/[workspaceId]/documents/[documentId]/route";
import { GET as getDocuments } from "@/app/api/workspaces/[workspaceId]/documents/route";
import { POST as createDocument } from "@/app/api/workspaces/[workspaceId]/documents/route";

const request = new Request("http://localhost/api/workspaces/sample-studio/documents");
const draft = { title: " Studio notes ", summary: " Synthetic summary ", type: "RESEARCH", body: " Synthetic body " };

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

describe("document write API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("DATABASE_URL", "file:./forma-dev.db");
  });
  afterEach(() => vi.unstubAllEnvs());

  it("creates a validated document with a private response", async () => {
    createDemoDocument.mockResolvedValue({ id: "created-1", ...draft });
    const response = await createDocument(new Request(request.url, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(draft),
    }), { params: Promise.resolve({ workspaceId: "sample-studio" }) });
    expect(response.status).toBe(201);
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    await expect(response.json()).resolves.toEqual({ document: { id: "created-1", ...draft } });
    expect(createDemoDocument).toHaveBeenCalledWith("sample-studio", {
      title: "Studio notes", summary: "Synthetic summary", type: "RESEARCH", body: "Synthetic body",
    });
  });

  it("rejects malformed or incomplete drafts before reaching persistence", async () => {
    const malformed = await createDocument(new Request(request.url, { method: "POST", body: "{" }), {
      params: Promise.resolve({ workspaceId: "sample-studio" }),
    });
    const invalid = await createDocument(new Request(request.url, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...draft, title: "  " }),
    }), { params: Promise.resolve({ workspaceId: "sample-studio" }) });
    expect(malformed.status).toBe(400);
    expect(invalid.status).toBe(400);
    expect(invalid.headers.get("Cache-Control")).toBe("private, no-store");
    await expect(invalid.json()).resolves.toMatchObject({ fields: { title: expect.any(String) } });
    expect(createDemoDocument).not.toHaveBeenCalled();
  });

  it("refuses writes from a remote origin before touching the sample workspace", async () => {
    const response = await createDocument(new Request(request.url, {
      method: "POST", headers: { Origin: "https://studio.example", "Content-Type": "application/json" }, body: JSON.stringify(draft),
    }), { params: Promise.resolve({ workspaceId: "sample-studio" }) });
    expect(response.status).toBe(404);
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    expect(createDemoDocument).not.toHaveBeenCalled();
  });

  it("updates a scoped document and keeps missing records private", async () => {
    updateDemoDocument.mockResolvedValueOnce({ id: "sample-brief", ...draft });
    const context = { params: Promise.resolve({ workspaceId: "sample-studio", documentId: "sample-brief" }) };
    const success = await updateDocument(new Request(request.url, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(draft),
    }), context);
    expect(success.status).toBe(200);
    expect(success.headers.get("Cache-Control")).toBe("private, no-store");
    expect(updateDemoDocument).toHaveBeenCalledWith("sample-studio", "sample-brief", {
      title: "Studio notes", summary: "Synthetic summary", type: "RESEARCH", body: "Synthetic body",
    });

    updateDemoDocument.mockResolvedValueOnce(null);
    const missing = await updateDocument(new Request(request.url, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(draft),
    }), context);
    expect(missing.status).toBe(404);
  });
});
