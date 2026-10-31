import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { LibraryView } from "../components/library-view";
import { getDefaultWorkspaceId, type WorkspaceSummary } from "../lib/workspace-view";

const workspaces: WorkspaceSummary[] = [
  { id: "sample-field-notes", name: "Field Notes", slug: "field-notes" },
  { id: "sample-studio", name: "Northline Studio", slug: "northline-studio" },
];

describe("Forma workspace library", () => {
  it("shows the seeded default space and semantic section destinations", () => {
    const markup = renderToStaticMarkup(createElement(LibraryView, { workspaces }));

    expect(markup).toContain("Northline Studio");
    expect(markup).toContain('aria-label="Switch workspace, current Northline Studio"');
    expect(markup).toContain('href="#library"');
    expect(markup).toContain('href="#team-spaces"');
    expect(markup).toContain('href="#archive"');
    expect(markup).toContain('id="team-spaces"');
    expect(markup).toContain('id="archive"');
    expect(markup).toContain("Field Notes");
    expect(markup).toContain("No archived documents in this demo workspace.");
    expect(markup).toContain("Document content remains a separate curated preview.");
  });

  it("chooses the seeded workspace or the first membership when it is absent", () => {
    expect(getDefaultWorkspaceId(workspaces)).toBe("sample-studio");
    expect(getDefaultWorkspaceId([workspaces[0]])).toBe("sample-field-notes");
    expect(getDefaultWorkspaceId([])).toBe("");
  });
});
