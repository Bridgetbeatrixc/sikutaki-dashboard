import type { Metadata } from "next";
import { SettingsPage } from "@/features/hr/settings/SettingsPage";

export const metadata: Metadata = { title: "Pengaturan" };

export default function Page() {
  return <SettingsPage />;
}
