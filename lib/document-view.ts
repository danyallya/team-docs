export type DocumentListItem = {
  id: string;
  workspaceId: string;
  title: string;
  summary: string;
  status: string;
  authorName: string;
  updatedAt: string;
};

export type DocumentDetail = DocumentListItem & {
  body: string;
};

export type DocumentTab = "all" | "recent" | "favorite";

export function getVisibleDocuments(
  documents: DocumentListItem[],
  query: string,
  tab: DocumentTab,
  favoriteIds: string[],
): DocumentListItem[] {
  const normalizedQuery = query.trim().toLowerCase();
  const matches = documents.filter((document) =>
    (document.title + " " + document.summary + " " + document.status + " " + document.authorName)
      .toLowerCase()
      .includes(normalizedQuery),
  );
  const tabDocuments = tab === "favorite"
    ? matches.filter((document) => favoriteIds.includes(document.id))
    : matches;

  return orderDocuments(tabDocuments, tab === "favorite" ? "all" : tab);
}

export function orderDocuments<T extends Pick<DocumentListItem, "id" | "updatedAt">>(
  documents: T[],
  tab: DocumentTab,
): T[] {
  if (tab !== "recent") return [...documents];

  return [...documents].sort((left, right) => {
    const leftTime = Date.parse(left.updatedAt);
    const rightTime = Date.parse(right.updatedAt);
    const safeLeftTime = Number.isFinite(leftTime) ? leftTime : 0;
    const safeRightTime = Number.isFinite(rightTime) ? rightTime : 0;
    return safeRightTime - safeLeftTime || (left.id < right.id ? -1 : left.id > right.id ? 1 : 0);
  });
}

export function formatUpdatedAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}
