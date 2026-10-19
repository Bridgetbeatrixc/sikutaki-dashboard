import type { Metadata, Viewport } from "next";
import { redirect } from "next/navigation";
import { EmployeeProvider } from "@/features/employee/EmployeeProvider";
import { EmployeeShell } from "@/features/employee/EmployeeShell";
import { ROUTES } from "@/lib/paths";
import { getViewer } from "@/server/auth";
import { demoEmployee, loadEmployee } from "@/server/employee";

export const metadata: Metadata = { title: { default: "Sikutaki", template: "%s · Sikutaki" } };
export const viewport: Viewport = { themeColor: "#ffffff", viewportFit: "cover" };

export default async function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const viewer = await getViewer();
  if (viewer?.role !== "employee") redirect(viewer ? ROUTES.hr.root : `${ROUTES.login}?untuk=karyawan`);
  const data = viewer.kind === "user" ? await loadEmployee(viewer.user) : demoEmployee();
  return (
    <EmployeeProvider data={data}>
      <EmployeeShell>{children}</EmployeeShell>
    </EmployeeProvider>
  );
}
