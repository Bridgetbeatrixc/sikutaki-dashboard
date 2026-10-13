import type { Metadata } from "next";
import { EmployeeProvider } from "@/features/employee/EmployeeProvider";
import { EmployeeShell } from "@/features/employee/EmployeeShell";

export const metadata: Metadata = { title: { default: "Aplikasi karyawan", template: "%s · Aplikasi karyawan · Sikutaki" } };

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  return (
    <EmployeeProvider>
      <EmployeeShell>{children}</EmployeeShell>
    </EmployeeProvider>
  );
}
