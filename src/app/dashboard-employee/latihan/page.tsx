import type { Metadata } from "next";
import { ExercisesScreen } from "@/features/employee/exercises/ExercisesScreen";

export const metadata: Metadata = { title: "Latihan" };

export default function Page() {
  return <ExercisesScreen />;
}
