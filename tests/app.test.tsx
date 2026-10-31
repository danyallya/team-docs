import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { LibraryView } from "../components/library-view";
import { formatUpdatedAt, getVisibleDocuments, orderDocuments, type DocumentDetail, type DocumentListItem } from "../lib/document-view";
import { getDefaultWorkspaceId, type WorkspaceSummary } from "../lib/workspace-view";

const workspaces: WorkspaceSummary[] = [
  { id: "sample-field-notes", name: "Field Notes", slug: "field-notes" },
  { id: "sample-studio", name: "Northline Studio", slug: "northline-studio" },
];

const documents: DocumentListItem[] = [
  {
    id: "sample-brief",
    workspaceId: "sample-studio",
    title: "Fictional studio brief",
    summary: "Setup fixture only.",
    status: "DRAFT",
    authorName: "Nora Ellis",
    updatedAt: "2026-10-28T10:00:00.000Z",
  },
  {
    id: "sample-workspace-notes",
    workspaceId: "sample-studio",
    title: "Workspace notes",
    summary: "A synthetic reading example.",
    status: "PUBLISHED",
    authorName: "Nora Ellis",
    updatedAt: "2026-10-30T10:00:00.000Z",
  },
];

const firstDocument: DocumentDetail = {
  ...documents[0],
  body: "Synthetic persisted body for the reading test.",
};

describe("Forma workspace library", () => {
  it("renders persisted document detail and semantic workspace destinations", () => {
    const markup = renderToStaticMarkup(createElement(LibraryView, {
      workspaces,
      initialDocuments: documents,
      initialDocument: firstDocument,
      initialListError: null,
      initialDetailError: null,
    }));

    expect(markup).toContain("Northline Studio");
    expect(markup).toContain('aria-label="Switch workspace, current Northline Studio"');
    expect(markup).toContain('href="#library"');
    expect(markup).toContain('href="#team-spaces"');
    expect(markup).toContain('href="#archive"');
    expect(markup).toContain("Fictional studio brief");
    expect(markup).toContain("Synthetic persisted body for the reading test.");
    expect(markup).toContain("Nora Ellis");
    expect(markup).toContain("The sample identity is not authentication or a permission boundary.");
  });

  it("shows an empty state for an accessible workspace with no documents", () => {
    const markup = renderToStaticMarkup(createElement(LibraryView, {
      workspaces: [workspaces[0]],
      initialDocuments: [],
      initialDocument: null,
      initialListError: null,
      initialDetailError: null,
    }));

    expect(markup).toContain("No documents in Field Notes yet.");
    expect(markup).toContain("There are no saved documents in this workspace yet.");
  });

  it("shows separate list and detail read failures with retry controls", () => {
    const listMarkup = renderToStaticMarkup(createElement(LibraryView, {
      workspaces,
      initialDocuments: [],
      initialDocument: null,
      initialListError: "We couldn't load the library. Please try again.",
      initialDetailError: null,
    }));
    const detailMarkup = renderToStaticMarkup(createElement(LibraryView, {
      workspaces,
      initialDocuments: [documents[0]],
      initialDocument: null,
      initialListError: null,
      initialDetailError: "We couldn't load this document. Please try again.",
    }));

    expect(listMarkup).toContain('role="alert"');
    expect(listMarkup).toContain("Try again");
    expect(detailMarkup).toContain("Document unavailable");
    expect(detailMarkup).toContain("We couldn&#x27;t load this document. Please try again.");
  });

  it("orders Recent by update time and resolves ties by document id", () => {
    expect(orderDocuments(documents, "all").map((document) => document.id)).toEqual([
      "sample-brief",
      "sample-workspace-notes",
    ]);
    expect(orderDocuments(documents, "recent").map((document) => document.id)).toEqual([
      "sample-workspace-notes",
      "sample-brief",
    ]);

    const tied = [
      { ...documents[0], id: "z-document", updatedAt: documents[0].updatedAt },
      { ...documents[0], id: "a-document", updatedAt: documents[0].updatedAt },
    ];
    expect(orderDocuments(tied, "recent").map((document) => document.id)).toEqual([
      "a-document",
      "z-document",
    ]);
  });

  it("composes Recent ordering with a case-insensitive document search", () => {
    expect(getVisibleDocuments(documents, "WORKSPACE", "recent", []).map((document) => document.id)).toEqual([
      "sample-workspace-notes",
    ]);
    expect(getVisibleDocuments(documents, "draft", "recent", []).map((document) => document.id)).toEqual([
      "sample-brief",
    ]);
  });

  it("chooses the seeded workspace or the first membership when it is absent", () => {
    expect(getDefaultWorkspaceId(workspaces)).toBe("sample-studio");
    expect(getDefaultWorkspaceId([workspaces[0]])).toBe("sample-field-notes");
    expect(getDefaultWorkspaceId([])).toBe("");
  });

  it("formats timestamps in a stable UTC locale and handles invalid values", () => {
    expect(formatUpdatedAt("2026-10-30T23:30:00.000Z")).toBe("Oct 30, 2026");
    expect(formatUpdatedAt("not-a-date")).toBe("Date unavailable");
  });
});
