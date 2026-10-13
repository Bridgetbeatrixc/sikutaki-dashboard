import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EXERCISES, exerciseById } from "@/features/employee/content";
import { PlayerScreen } from "@/features/employee/exercises/PlayerScreen";

type Props = { params: Promise<{ id: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return EXERCISES.map((e) => ({ id: e.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: exerciseById(id)?.title ?? "Latihan" };
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const exercise = exerciseById(id);
  if (!exercise) notFound();
  return <PlayerScreen exercise={exercise} />;
}
