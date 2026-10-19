import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { HrProvider } from "@/features/hr/HrProvider";
import { HrShell } from "@/features/hr/HrShell";
import { ROUTES } from "@/lib/paths";
import { getViewer } from "@/server/auth";
import { buildDataset } from "@/server/dataset";

export const metadata: Metadata = { title: { default: "Dashboard HR", template: "%s · Dashboard HR · Sikutaki" } };

export default async function HrLayout({ children }: { children: React.ReactNode }) {
  const viewer = await getViewer();
  if (viewer?.role !== "hr") redirect(viewer ? ROUTES.employee.home : `${ROUTES.login}?untuk=hr`);
  const dataset = viewer.kind === "user" ? await buildDataset(viewer.user.companyId, viewer.user.id) : null;
  return (
    <HrProvider dataset={dataset}>
      <HrShell>{children}</HrShell>
    </HrProvider>
  );
}
