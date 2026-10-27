import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import HomePage from "../app/page";

describe("team-docs workspace", () => {
  it("renders its initial workspace content", () => {
    const markup = renderToStaticMarkup(createElement(HomePage));
    expect(markup).toContain("FORMA");
    expect(markup).toContain('aria-label="Search the library"');
    expect(markup).toContain('aria-label="Remove from favorites"');
    expect(markup).toContain('aria-pressed="true"');
  });
});
