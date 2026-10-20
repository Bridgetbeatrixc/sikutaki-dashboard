import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PracticeScreen } from "@/features/employee/exercises/PracticeScreen";
import { PRACTICES, practiceById } from "@/lib/practice";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ program?: string; slot?: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return PRACTICES.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: practiceById(id)?.title ?? "Latihan" };
}

export default async function Page({ params, searchParams }: Props) {
  const { id } = await params;
  const { program, slot } = await searchParams;
  if (!practiceById(id)) notFound();
  return <PracticeScreen key={`${id}-${program ?? ""}`} id={id} program={program} slot={slot} />;
}
