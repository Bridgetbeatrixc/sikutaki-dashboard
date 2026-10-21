import type { Metadata } from "next";
import { HrProvider } from "@/features/hr/HrProvider";
import { HrShell } from "@/features/hr/HrShell";

export const metadata: Metadata = { title: { default: "Dashboard HR", template: "%s · Dashboard HR · Sikutaki" } };

export default function HrLayout({ children }: { children: React.ReactNode }) {
  return (
    <HrProvider>
      <HrShell>{children}</HrShell>
    </HrProvider>
  );
}
