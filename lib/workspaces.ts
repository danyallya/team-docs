import "server-only";
import { prisma } from "@/lib/prisma";
import type { WorkspaceSummary } from "@/lib/workspace-view";

const demoUserId = "sample-author";

export async function listDemoWorkspaces(): Promise<WorkspaceSummary[]> {
  return prisma.workspace.findMany({
    where: { memberships: { some: { userId: demoUserId } } },
    select: { id: true, name: true, slug: true },
    orderBy: { name: "asc" },
  });
}
