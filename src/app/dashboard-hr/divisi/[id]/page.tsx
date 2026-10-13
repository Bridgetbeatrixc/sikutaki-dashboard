import type { Metadata } from "next";
import { DivisionDetailPage } from "@/features/hr/divisions/DivisionDetailPage";
import { teamById, TEAMS } from "@/lib/data";

type Props = { params: Promise<{ id: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => TEAMS.map((t) => ({ id: t.id }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: teamById(id)?.name ?? "Divisi" };
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <DivisionDetailPage id={id} />;
}
