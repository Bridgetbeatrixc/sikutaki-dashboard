import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { PracticeScreen } from "@/features/employee/exercises/PracticeScreen";
import { PRACTICES, practiceById } from "@/lib/practice";

type Props = { params: Promise<{ id: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return PRACTICES.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: practiceById(id)?.title ?? "Latihan" };
}

/** The program session (?program=&slot=) is read in the browser, so the page stays static. */
export default async function Page({ params }: Props) {
  const { id } = await params;
  if (!practiceById(id)) notFound();
  return <Suspense><PracticeScreen id={id} /></Suspense>;
}
