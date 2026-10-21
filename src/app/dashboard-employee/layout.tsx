import type { Metadata, Viewport } from "next";
import { EmployeeProvider } from "@/features/employee/EmployeeProvider";
import { EmployeeShell } from "@/features/employee/EmployeeShell";

export const metadata: Metadata = { title: { default: "Sikutaki", template: "%s · Sikutaki" } };
export const viewport: Viewport = { themeColor: "#ffffff", viewportFit: "cover" };

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  return (
    <EmployeeProvider>
      <EmployeeShell>{children}</EmployeeShell>
    </EmployeeProvider>
  );
}
