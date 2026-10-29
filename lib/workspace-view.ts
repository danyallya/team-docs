export type WorkspaceSummary = {
  id: string;
  name: string;
  slug: string;
};

export const DEFAULT_WORKSPACE_ID = "sample-studio";

export function getDefaultWorkspaceId(workspaces: WorkspaceSummary[]) {
  return workspaces.find((workspace) => workspace.id === DEFAULT_WORKSPACE_ID)?.id
    ?? workspaces[0]?.id
    ?? "";
}
