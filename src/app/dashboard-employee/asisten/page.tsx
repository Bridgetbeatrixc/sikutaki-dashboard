import type { Metadata } from "next";
import { AssistantScreen } from "@/features/employee/assistant/AssistantScreen";

export const metadata: Metadata = { title: "Asisten AI" };

export default function Page() {
  return <AssistantScreen />;
}
