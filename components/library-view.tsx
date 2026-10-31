"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as Avatar from "@radix-ui/react-avatar";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Tabs from "@radix-ui/react-tabs";
import {
  FiArchive,
  FiBell,
  FiBookOpen,
  FiCheck,
  FiChevronDown,
  FiFileText,
  FiGrid,
  FiMoon,
  FiMoreHorizontal,
  FiPlus,
  FiSearch,
  FiShare2,
  FiStar,
  FiSun,
  FiUsers,
  FiX,
} from "react-icons/fi";
import type { DocumentDetail, DocumentListItem } from "@/lib/document-view";
import { formatUpdatedAt, getVisibleDocuments, orderDocuments } from "@/lib/document-view";
import { getDefaultWorkspaceId, type WorkspaceSummary } from "@/lib/workspace-view";

type LibraryViewProps = {
  workspaces: WorkspaceSummary[];
  initialDocuments: DocumentListItem[];
  initialDocument: DocumentDetail | null;
  initialListError: string | null;
  initialDetailError: string | null;
};

type Section = "all" | "favorites" | "spaces" | "archive";
type ReadStatus = "ready" | "loading" | "error";

function LibraryNavigation({
  activeSection,
  onNavigate,
  label,
  className,
}: {
  activeSection: Section;
  onNavigate: (section: Section) => void;
  label: string;
  className: string;
}) {
  return (
    <nav aria-label={label} className={className}>
      {className === "sidebar-nav" && <small>LIBRARY</small>}
      <a
        href="#library"
        className={activeSection === "all" ? "active" : undefined}
        aria-current={activeSection === "all" ? "page" : undefined}
        onClick={() => onNavigate("all")}
      >
        <FiGrid aria-hidden="true" /> All documents
      </a>
      <a
        href="#library"
        className={activeSection === "favorites" ? "active" : undefined}
        aria-current={activeSection === "favorites" ? "page" : undefined}
        onClick={() => onNavigate("favorites")}
      >
        <FiStar aria-hidden="true" /> Favorites
      </a>
      <a
        href="#team-spaces"
        className={activeSection === "spaces" ? "active" : undefined}
        aria-current={activeSection === "spaces" ? "page" : undefined}
        onClick={() => onNavigate("spaces")}
      >
        <FiUsers aria-hidden="true" /> Team spaces
      </a>
      <a
        href="#archive"
        className={activeSection === "archive" ? "active" : undefined}
        aria-current={activeSection === "archive" ? "page" : undefined}
        onClick={() => onNavigate("archive")}
      >
        <FiArchive aria-hidden="true" /> Archive
      </a>
    </nav>
  );
}

export function LibraryView({
  workspaces,
  initialDocuments,
  initialDocument,
  initialListError,
  initialDetailError,
}: LibraryViewProps) {
  const [docs, setDocs] = useState(initialDocuments);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(() => getDefaultWorkspaceId(workspaces));
  const [selectedId, setSelectedId] = useState(initialDocument?.id ?? initialDocuments[0]?.id ?? "");
  const [selectedDocument, setSelectedDocument] = useState(initialDocument);
  const [listStatus, setListStatus] = useState<ReadStatus>(initialListError ? "error" : "ready");
  const [listError, setListError] = useState(initialListError);
  const [detailStatus, setDetailStatus] = useState<ReadStatus | null>(
    initialDetailError ? "error" : initialDocument ? "ready" : null,
  );
  const [detailError, setDetailError] = useState(initialDetailError);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [dark, setDark] = useState(false);
  const [create, setCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [libraryTab, setLibraryTab] = useState("all");
  const [activeSection, setActiveSection] = useState<Section>("all");
  const titleInputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const listRequestRef = useRef(0);
  const detailRequestRef = useRef(0);

  const activeWorkspace = workspaces.find((workspace) => workspace.id === activeWorkspaceId);
  const workspaceDocuments = useMemo(
    () => docs.filter((doc) => doc.workspaceId === activeWorkspaceId),
    [docs, activeWorkspaceId],
  );
  const selected = selectedDocument?.workspaceId === activeWorkspaceId ? selectedDocument : null;

  useEffect(() => {
    if (!create) return;

    const returnFocusTo = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    titleInputRef.current?.focus();

    function containDialogFocus(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setCreate(false);
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", containDialogFocus);
    return () => {
      document.removeEventListener("keydown", containDialogFocus);
      returnFocusTo?.focus();
    };
  }, [create]);

  function handleNavigate(section: Section) {
    setActiveSection(section);
    if (section === "all") setLibraryTab("all");
    if (section === "favorites") setLibraryTab("favorite");
  }

  async function loadDocument(workspaceId: string, documentId: string) {
    const requestId = ++detailRequestRef.current;
    setSelectedId(documentId);
    setSelectedDocument(null);
    setDetailStatus("loading");
    setDetailError(null);

    try {
      const response = await fetch(
        `/api/workspaces/${encodeURIComponent(workspaceId)}/documents/${encodeURIComponent(documentId)}`,
        { cache: "no-store" },
      );
      const payload = (await response.json()) as { document?: DocumentDetail };
      if (!response.ok || !payload.document) throw new Error("Document request failed");
      if (requestId !== detailRequestRef.current) return;

      setSelectedDocument(payload.document);
      setDetailStatus("ready");
    } catch {
      if (requestId !== detailRequestRef.current) return;
      setSelectedDocument(null);
      setDetailStatus("error");
      setDetailError("We couldn't load this document. Please try again.");
    }
  }

  async function loadWorkspaceDocuments(workspaceId: string) {
    const requestId = ++listRequestRef.current;
    detailRequestRef.current += 1;
    setDocs([]);
    setSelectedId("");
    setSelectedDocument(null);
    setListStatus("loading");
    setListError(null);
    setDetailStatus(null);
    setDetailError(null);

    try {
      const response = await fetch(
        `/api/workspaces/${encodeURIComponent(workspaceId)}/documents`,
        { cache: "no-store" },
      );
      const payload = (await response.json()) as { documents?: DocumentListItem[] };
      if (!response.ok || !payload.documents) throw new Error("Document list request failed");
      if (requestId !== listRequestRef.current) return;

      setDocs(payload.documents);
      setListStatus("ready");
      const firstDocument = payload.documents[0];
      if (firstDocument) void loadDocument(workspaceId, firstDocument.id);
    } catch {
      if (requestId !== listRequestRef.current) return;
      setListStatus("error");
      setListError("We couldn't load this workspace's documents. Please try again.");
    }
  }

  function selectWorkspace(workspaceId: string) {
    if (workspaceId === activeWorkspaceId) return;
    setActiveWorkspaceId(workspaceId);
    setLibraryTab("all");
    setActiveSection("all");
    setQuery("");
    void loadWorkspaceDocuments(workspaceId);
  }

  function toggleFavorite(documentId: string) {
    setFavoriteIds((current) =>
      current.includes(documentId)
        ? current.filter((id) => id !== documentId)
        : [...current, documentId],
    );
  }

  function createDocument() {
    const cleanTitle = title.trim();
    if (!cleanTitle || !activeWorkspace) return;

    const doc: DocumentDetail = {
      id: `preview-${Date.now()}`,
      workspaceId: activeWorkspace.id,
      title: cleanTitle,
      summary: "A new studio note, ready to take shape.",
      status: "DRAFT",
      authorName: "Nora Ellis",
      updatedAt: new Date().toISOString(),
      body: "Add the context, decisions and details the team needs to keep moving.",
    };
    setDocs((current) => [doc, ...current]);
    setSelectedId(doc.id);
    setSelectedDocument(doc);
    setDetailStatus("ready");
    setDetailError(null);
    setLibraryTab("all");
    setActiveSection("all");
    setQuery("");
    setTitle("");
    setCreate(false);
  }

  function documentsForTab(tab: "all" | "recent" | "favorite") {
    return getVisibleDocuments(workspaceDocuments, query, tab, favoriteIds);
  }

  const latestDocument = orderDocuments(docs, "recent")[0] ?? null;

  return (
    <main className={dark ? "forma dark" : "forma"}>
      <aside className="sidebar">
        <div className="brand">
          <span>f.</span>
          <div>
            <b>FORMA</b>
            <small>STUDIO LIBRARY</small>
          </div>
        </div>
        <LibraryNavigation
          activeSection={activeSection}
          onNavigate={handleNavigate}
          label="Library sections"
          className="sidebar-nav"
        />
        <div className="sidebar-bottom">
          <div className="storage">
            <span>SPACE USED</span>
            <b>1.8 GB <small>of 10 GB</small></b>
            <i><em /></i>
          </div>
          <div className="user">
            <Avatar.Root className="avatar"><Avatar.Fallback>NE</Avatar.Fallback></Avatar.Root>
            <span><b>Nora Ellis</b><small>Studio owner</small></span>
            <FiMoreHorizontal aria-hidden="true" />
          </div>
        </div>
      </aside>

      <section className="main">
        <header>
          <div className="header-context">
            <DropdownMenu.Root>
              <DropdownMenu.Trigger
                className="workspace-trigger"
                aria-label={activeWorkspace ? `Switch workspace, current ${activeWorkspace.name}` : "Choose a workspace"}
                disabled={workspaces.length === 0}
              >
                <span>{activeWorkspace?.name ?? "No workspace available"}</span>
                <FiChevronDown aria-hidden="true" />
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content className="menu workspace-menu" align="start">
                  <DropdownMenu.Label className="menu-label">Your demo workspaces</DropdownMenu.Label>
                  <DropdownMenu.RadioGroup value={activeWorkspaceId} onValueChange={selectWorkspace}>
                    {workspaces.map((workspace) => (
                      <DropdownMenu.RadioItem key={workspace.id} value={workspace.id} className="menu-item">
                        <DropdownMenu.ItemIndicator className="menu-indicator">
                          <FiCheck aria-hidden="true" />
                        </DropdownMenu.ItemIndicator>
                        {workspace.name}
                      </DropdownMenu.RadioItem>
                    ))}
                  </DropdownMenu.RadioGroup>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
            <span className="header-section">Library</span>
          </div>
          <div className="head-actions">
            <label className="search">
              <FiSearch aria-hidden="true" />
              <input aria-label="Search the library" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search the library" />
            </label>
            <button aria-label="Notifications"><FiBell aria-hidden="true" /></button>
            <button aria-label="Toggle theme" onClick={() => setDark((current) => !current)}>
              {dark ? <FiSun aria-hidden="true" /> : <FiMoon aria-hidden="true" />}
            </button>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger className="profile-trigger" aria-label="Open profile menu">
                <Avatar.Root className="avatar small"><Avatar.Fallback>NE</Avatar.Fallback></Avatar.Root>
                <FiChevronDown aria-hidden="true" />
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content className="menu" align="end">
                  <DropdownMenu.Item className="menu-item">Account settings</DropdownMenu.Item>
                  <DropdownMenu.Item className="menu-item">Workspace preferences</DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </header>

        <div className="content">
          <LibraryNavigation
            activeSection={activeSection}
            onNavigate={handleNavigate}
            label="Quick library navigation"
            className="mobile-nav"
          />

          <section className="intro">
            <div>
              <small className="eyebrow">A WORKING LIBRARY</small>
              <h1>Good work has<br /><em>a place to live.</em></h1>
              <p>Ideas, decisions and details from the {activeWorkspace?.name ?? "demo workspace"} team.</p>
            </div>
            <button className="create-button" onClick={() => setCreate(true)} disabled={!activeWorkspace}>
              <FiPlus aria-hidden="true" /> New document
            </button>
          </section>

          <div className="highlights">
            <article>
              <small>IN THE LIBRARY</small>
              <b>{listStatus === "ready" ? docs.length.toString().padStart(2, "0") : "—"} <span>documents</span></b>
              <i>Read from the local library</i>
            </article>
            <article>
              <small>WORKSPACES</small>
              <b>{workspaces.length.toString().padStart(2, "0")} <span>spaces</span></b>
              <i>Available to this sample member</i>
            </article>
            <article>
              <small>MOST RECENT UPDATE</small>
              <b>{latestDocument ? formatUpdatedAt(latestDocument.updatedAt) : "—"}</b>
              <i>{latestDocument?.title ?? "No document updates"}</i>
            </article>
          </div>

          <section className="library-panel" id="library" tabIndex={-1} aria-labelledby="library-heading">
            <Tabs.Root
              value={libraryTab}
              onValueChange={(value) => {
                setLibraryTab(value);
                setActiveSection(value === "favorite" ? "favorites" : "all");
              }}
            >
              <div className="panel-top">
                <div>
                  <small className="eyebrow">{activeWorkspace?.name?.toUpperCase() ?? "NO WORKSPACE"}</small>
                  <h2 id="library-heading">Studio library</h2>
                </div>
                <Tabs.List className="tabs" aria-label="Document views">
                  <Tabs.Trigger value="all">All documents</Tabs.Trigger>
                  <Tabs.Trigger value="recent">Recent</Tabs.Trigger>
                  <Tabs.Trigger value="favorite">Favorites</Tabs.Trigger>
                </Tabs.List>
              </div>
              <div className="doc-layout" aria-busy={listStatus === "loading"}>
                <div className="doc-list" aria-label="Documents">
                  {listStatus === "loading" && (
                    <p className="read-state" role="status" aria-live="polite">Loading documents…</p>
                  )}
                  {listStatus === "error" && (
                    <div className="read-state" role="alert">
                      <p>{listError ?? "We couldn't load documents."}</p>
                      <button
                        className="read-retry"
                        onClick={() => activeWorkspaceId ? void loadWorkspaceDocuments(activeWorkspaceId) : window.location.reload()}
                      >
                        Try again
                      </button>
                    </div>
                  )}
                  {listStatus === "ready" && (["all", "recent", "favorite"] as const).map((tab) => (
                    <Tabs.Content key={tab} value={tab} className="tab-content">
                      {documentsForTab(tab).map((doc) => (
                        <button
                          key={doc.id}
                          className={selectedId === doc.id ? "doc-card selected" : "doc-card"}
                          aria-pressed={selectedId === doc.id}
                          onClick={() => void loadDocument(activeWorkspaceId, doc.id)}
                        >
                          <div className="doc-icon"><FiFileText aria-hidden="true" /></div>
                          <div className="doc-meta">
                            <b>{doc.title}</b>
                            <small>{doc.summary}</small>
                            <span>{doc.status.toLowerCase().replaceAll("_", " ")} <i>·</i> Updated {formatUpdatedAt(doc.updatedAt)}</span>
                          </div>
                          <FiMoreHorizontal className="doc-more" aria-hidden="true" />
                        </button>
                      ))}
                      {documentsForTab(tab).length === 0 && (
                        <p className="list-empty" role="status">
                          {query
                            ? "No documents match this search."
                            : tab === "favorite"
                              ? "No favorites in this workspace yet."
                              : activeWorkspace
                                ? `No documents in ${activeWorkspace.name} yet.`
                                : "Choose a workspace to read its documents."}
                        </p>
                      )}
                    </Tabs.Content>
                  ))}
                </div>

                {listStatus === "loading" ? (
                  <article className="preview read-state" role="status" aria-live="polite" aria-busy="true">
                    <FiFileText aria-hidden="true" />
                    <p>Loading this workspace&apos;s documents…</p>
                  </article>
                ) : listStatus === "error" ? (
                  <article className="preview empty-preview" aria-hidden="true">
                    <FiFileText aria-hidden="true" />
                    <p>Document details will appear here.</p>
                  </article>
                ) : detailStatus === "loading" ? (
                  <article className="preview read-state" role="status" aria-live="polite" aria-busy="true">
                    <FiFileText aria-hidden="true" />
                    <p>Loading document…</p>
                  </article>
                ) : detailStatus === "error" ? (
                  <article className="preview read-state" role="alert">
                    <FiFileText aria-hidden="true" />
                    <h2>Document unavailable</h2>
                    <p>{detailError ?? "We couldn't load this document."}</p>
                    {selectedId && <button className="read-retry" onClick={() => void loadDocument(activeWorkspaceId, selectedId)}>Try again</button>}
                  </article>
                ) : selected ? (
                  <article className="preview">
                    <div className="preview-tools">
                      <span className={`status ${selected.status.toLowerCase().replaceAll("_", "-")}`}>
                        {selected.status.toLowerCase().replaceAll("_", " ")}
                      </span>
                      <div>
                        <button
                          aria-label={favoriteIds.includes(selected.id) ? "Remove from favorites" : "Add to favorites"}
                          aria-pressed={favoriteIds.includes(selected.id)}
                          onClick={() => toggleFavorite(selected.id)}
                        >
                          <FiStar style={{ fill: favoriteIds.includes(selected.id) ? "currentColor" : "none" }} aria-hidden="true" />
                        </button>
                        <button aria-label="Share"><FiShare2 aria-hidden="true" /></button>
                        <button aria-label="More"><FiMoreHorizontal aria-hidden="true" /></button>
                      </div>
                    </div>
                    <small className="preview-kind">UPDATED {formatUpdatedAt(selected.updatedAt).toUpperCase()}</small>
                    <h2>{selected.title}</h2>
                    <p className="preview-summary">{selected.summary}</p>
                    <div className="author">
                      <Avatar.Root className="avatar lilac"><Avatar.Fallback>{selected.authorName.slice(0, 2).toUpperCase()}</Avatar.Fallback></Avatar.Root>
                      <span><b>{selected.authorName}</b><small>{activeWorkspace?.name ?? "Demo workspace"}</small></span>
                    </div>
                    <div className="rule" />
                    <div className="preview-body">
                      <p>{selected.body}</p>
                      <div className="callout"><FiBookOpen aria-hidden="true" /><span>Shared with the {activeWorkspace?.name ?? "demo"} team</span></div>
                    </div>
                    <footer>Updated {formatUpdatedAt(selected.updatedAt)} <i>·</i> {selected.status.toLowerCase().replaceAll("_", " ")}</footer>
                  </article>
                ) : (
                  <article className="preview empty-preview" role="status">
                    <FiFileText aria-hidden="true" />
                    <h2>{query ? "No matching documents" : "This space is ready"}</h2>
                    <p>{query ? "Try a different search." : "There are no saved documents in this workspace yet."}</p>
                  </article>
                )}
              </div>
            </Tabs.Root>
          </section>

          <section id="team-spaces" className="secondary-panel" tabIndex={-1} aria-labelledby="spaces-heading">
            <div className="secondary-heading">
              <small className="eyebrow">TEAM SPACES</small>
              <h2 id="spaces-heading">Your workspaces</h2>
              <p>Choose a space in this local preview. Workspace names and membership come from the SQLite demo seed.</p>
            </div>
            <div className="space-grid">
              {workspaces.map((workspace) => (
                <button
                  key={workspace.id}
                  className={workspace.id === activeWorkspaceId ? "space-card selected" : "space-card"}
                  aria-pressed={workspace.id === activeWorkspaceId}
                  onClick={() => selectWorkspace(workspace.id)}
                >
                  <span className="space-mark"><FiUsers aria-hidden="true" /></span>
                  <span className="space-card-copy"><b>{workspace.name}</b><small>{workspace.id === "sample-studio" ? "Default workspace" : "Demo workspace"}</small></span>
                  {workspace.id === activeWorkspaceId && <FiCheck className="space-check" aria-label="Current workspace" />}
                </button>
              ))}
              {workspaces.length === 0 && <p className="list-empty">No sample workspaces were found. Run the local setup and seed commands.</p>}
            </div>
            <p className="preview-note">The library and document above are persisted synthetic examples from SQLite. The sample identity is not authentication or a permission boundary.</p>
          </section>

          <section id="archive" className="secondary-panel archive-panel" tabIndex={-1} aria-labelledby="archive-heading">
            <div className="secondary-heading">
              <small className="eyebrow">ARCHIVE</small>
              <h2 id="archive-heading">Archived documents</h2>
              <p>No archived documents in this demo workspace.</p>
            </div>
            <a href="#library" className="return-link" onClick={() => handleNavigate("all")}>Return to the library</a>
          </section>

          <div className="page-footer">A considered home for the way you work.<span>FORMA / 2026</span></div>
        </div>
      </section>

      {create && (
        <div className="overlay" onClick={() => setCreate(false)}>
          <section
            ref={dialogRef}
            className="dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-document"
            onClick={(event) => event.stopPropagation()}
          >
            <button className="close" onClick={() => setCreate(false)} aria-label="Close"><FiX aria-hidden="true" /></button>
            <small>ADD TO YOUR LIBRARY</small>
            <h2 id="new-document">Create a document</h2>
            <p>Start a new note for the {activeWorkspace?.name ?? "demo"} team.</p>
            <label>Document title<input ref={titleInputRef} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Give this note a name" /></label>
            <label>Document type<select defaultValue="Studio guide"><option>Studio guide</option><option>Project brief</option><option>Research</option><option>Operations</option></select></label>
            <button className="create-button" onClick={createDocument} disabled={!activeWorkspace}><FiPlus aria-hidden="true" /> Create document</button>
          </section>
        </div>
      )}
    </main>
  );
}
