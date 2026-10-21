import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProgramScreen } from "@/features/employee/exercises/ProgramScreen";
import { PROGRAMS, programById } from "@/lib/practice";

type Props = { params: Promise<{ id: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return PROGRAMS.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: programById(id)?.title ?? "Program" };
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  if (!programById(id)) notFound();
  return <ProgramScreen id={id} />;
}
