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
import { getDefaultWorkspaceId, type WorkspaceSummary } from "@/lib/workspace-view";

type Doc = {
  id: string;
  workspaceId: string;
  title: string;
  summary: string;
  kind: string;
  updated: string;
  author: string;
  initials: string;
  color: string;
  favorite: boolean;
  status: string;
  body: string;
};

type Section = "all" | "favorites" | "spaces" | "archive";

const starter: Doc[] = [
  {
    id: "preview-quiet-work",
    workspaceId: "sample-studio",
    title: "A quieter way to work",
    summary: "Principles for keeping the studio intentional as we grow.",
    kind: "Studio guide",
    updated: "12 min ago",
    author: "Nora Ellis",
    initials: "NE",
    color: "lilac",
    favorite: true,
    status: "Published",
    body: "The best work begins with room to think. We protect that room by making decisions with care, keeping our shared spaces useful, and writing down the things we learn along the way.",
  },
  {
    id: "preview-northline-house",
    workspaceId: "sample-studio",
    title: "Northline House — concept",
    summary: "Residential brief, material direction and open questions.",
    kind: "Project brief",
    updated: "Yesterday",
    author: "Milo Chen",
    initials: "MC",
    color: "sand",
    favorite: true,
    status: "In review",
    body: "A calm home for a family returning to the coast. The material palette is drawn from salt-washed stone, smoked oak and soft linen. Keep circulation simple; let the light do the work.",
  },
  {
    id: "preview-handover",
    workspaceId: "sample-studio",
    title: "Client handover checklist",
    summary: "The final details that make every handover feel complete.",
    kind: "Operations",
    updated: "2 days ago",
    author: "Nora Ellis",
    initials: "NE",
    color: "sage",
    favorite: false,
    status: "Published",
    body: "Before handover, confirm the final drawing set, material schedule, care notes and supplier contacts. Walk the space with the client and capture remaining actions in one place.",
  },
  {
    id: "preview-copenhagen",
    workspaceId: "sample-studio",
    title: "Field notes: Copenhagen",
    summary: "References from the spring material and furniture visit.",
    kind: "Research",
    updated: "Last week",
    author: "Iris Hall",
    initials: "IH",
    color: "rose",
    favorite: false,
    status: "Draft",
    body: "Collected references from small galleries, furniture makers and local stone yards. The strongest ideas were quiet in detail and generous in how they age.",
  },
  {
    id: "preview-studio-rhythm",
    workspaceId: "sample-studio",
    title: "Studio rhythm",
    summary: "A practical guide to reviews, focus time and making decisions.",
    kind: "Studio guide",
    updated: "Last week",
    author: "Milo Chen",
    initials: "MC",
    color: "blue",
    favorite: false,
    status: "Published",
    body: "Protect two mornings a week for focused work. Reviews work best when the question is clear, the material is prepared and the next decision is written down.",
  },
];

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

export function LibraryView({ workspaces }: { workspaces: WorkspaceSummary[] }) {
  const [docs, setDocs] = useState(starter);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(() => getDefaultWorkspaceId(workspaces));
  const [selectedId, setSelectedId] = useState(starter[0].id);
  const [query, setQuery] = useState("");
  const [dark, setDark] = useState(false);
  const [create, setCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [libraryTab, setLibraryTab] = useState("all");
  const [activeSection, setActiveSection] = useState<Section>("all");
  const titleInputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLElement>(null);

  const activeWorkspace = workspaces.find((workspace) => workspace.id === activeWorkspaceId);
  const filtered = useMemo(
    () =>
      docs.filter(
        (doc) =>
          doc.workspaceId === activeWorkspaceId &&
          (doc.title + " " + doc.summary + " " + doc.kind).toLowerCase().includes(query.toLowerCase()),
      ),
    [docs, activeWorkspaceId, query],
  );
  const selected = filtered.find((doc) => doc.id === selectedId) ?? filtered[0] ?? null;

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

  function selectWorkspace(workspaceId: string) {
    setActiveWorkspaceId(workspaceId);
    setLibraryTab("all");
    setActiveSection("all");
    setQuery("");
  }

  function toggleFavorite(doc: Doc) {
    setDocs((current) =>
      current.map((item) => (item.id === doc.id ? { ...item, favorite: !item.favorite } : item)),
    );
  }

  function createDocument() {
    const cleanTitle = title.trim();
    if (!cleanTitle || !activeWorkspace) return;

    const doc: Doc = {
      id: `preview-${Date.now()}`,
      workspaceId: activeWorkspace.id,
      title: cleanTitle,
      summary: "A new studio note, ready to take shape.",
      kind: "Studio guide",
      updated: "Just now",
      author: "Nora Ellis",
      initials: "NE",
      color: "lilac",
      favorite: false,
      status: "Draft",
      body: "Add the context, decisions and details the team needs to keep moving.",
    };
    setDocs((current) => [doc, ...current]);
    setSelectedId(doc.id);
    setLibraryTab("all");
    setActiveSection("all");
    setQuery("");
    setTitle("");
    setCreate(false);
  }

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
            <article><small>IN THE LIBRARY</small><b>32 <span>documents</span></b><i>Thoughtfully collected</i></article>
            <article><small>ACTIVE PROJECTS</small><b>06 <span>spaces</span></b><i>Across the studio</i></article>
            <article><small>UPDATED THIS WEEK</small><b>14 <span>notes</span></b><i>Good ideas in motion</i></article>
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
              <div className="doc-layout">
                <div className="doc-list">
                  {(["all", "recent", "favorite"] as const).map((tab) => (
                    <Tabs.Content key={tab} value={tab} className="tab-content">
                      {filtered
                        .filter((doc) => tab !== "favorite" || doc.favorite)
                        .map((doc) => (
                          <button
                            key={doc.id}
                            className={selected?.id === doc.id ? "doc-card selected" : "doc-card"}
                            onClick={() => setSelectedId(doc.id)}
                          >
                            <div className="doc-icon"><FiFileText aria-hidden="true" /></div>
                            <div className="doc-meta">
                              <b>{doc.title}</b>
                              <small>{doc.summary}</small>
                              <span>{doc.kind} <i>·</i> {doc.updated}</span>
                            </div>
                            <FiMoreHorizontal className="doc-more" aria-hidden="true" />
                          </button>
                        ))}
                      {filtered.filter((doc) => tab !== "favorite" || doc.favorite).length === 0 && (
                        <p className="list-empty" role="status">
                          {query
                            ? "No documents match this search."
                            : tab === "favorite"
                              ? "No favorites in this workspace yet."
                              : `No documents in ${activeWorkspace?.name ?? "this workspace"} yet.`}
                        </p>
                      )}
                    </Tabs.Content>
                  ))}
                </div>

                {selected ? (
                  <article className="preview">
                    <div className="preview-tools">
                      <span className={`status ${selected.status.toLowerCase().replace(" ", "-")}`}>{selected.status}</span>
                      <div>
                        <button
                          aria-label={selected.favorite ? "Remove from favorites" : "Add to favorites"}
                          aria-pressed={selected.favorite}
                          onClick={() => toggleFavorite(selected)}
                        >
                          <FiStar style={{ fill: selected.favorite ? "currentColor" : "none" }} aria-hidden="true" />
                        </button>
                        <button aria-label="Share"><FiShare2 aria-hidden="true" /></button>
                        <button aria-label="More"><FiMoreHorizontal aria-hidden="true" /></button>
                      </div>
                    </div>
                    <small className="preview-kind">{selected.kind.toUpperCase()} <i>·</i> UPDATED {selected.updated.toUpperCase()}</small>
                    <h2>{selected.title}</h2>
                    <p className="preview-summary">{selected.summary}</p>
                    <div className="author">
                      <Avatar.Root className={`avatar ${selected.color}`}><Avatar.Fallback>{selected.initials}</Avatar.Fallback></Avatar.Root>
                      <span><b>{selected.author}</b><small>{activeWorkspace?.name ?? "Demo workspace"}</small></span>
                    </div>
                    <div className="rule" />
                    <div className="preview-body">
                      <p>{selected.body}</p>
                      <h3>A note for the team</h3>
                      <p>Keep the useful detail close to the work. When something changes, add the reason and the next decision so the whole team can move with confidence.</p>
                      <div className="callout"><FiBookOpen aria-hidden="true" /><span>Shared with the {activeWorkspace?.name ?? "demo"} team</span></div>
                    </div>
                    <footer>Version 03 <i>·</i> Last edited by {selected.author}</footer>
                  </article>
                ) : (
                  <article className="preview empty-preview" role="status">
                    <FiFileText aria-hidden="true" />
                    <h2>{query ? "No matching documents" : "This space is ready"}</h2>
                    <p>{query ? "Try a different search." : "There are no preview documents in this workspace yet."}</p>
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
            <p className="preview-note">This sample identity is not authentication or a permission boundary. Document content remains a separate curated preview.</p>
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
