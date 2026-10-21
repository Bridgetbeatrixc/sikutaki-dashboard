import type { Metadata } from "next";
import { ProfileScreen } from "@/features/employee/profile/ProfileScreen";

export const metadata: Metadata = { title: "Profil" };

export default function Page() {
  return <ProfileScreen />;
}
