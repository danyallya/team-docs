import { LibraryView } from "@/components/library-view";
import { listDemoWorkspaces } from "@/lib/workspaces";

export const dynamic = "force-dynamic";

export default async function Home() {
  const workspaces = await listDemoWorkspaces();
  return <LibraryView workspaces={workspaces} />;
}
