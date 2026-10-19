import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AreaDetailPage } from "@/features/hr/areas/AreaDetailPage";
import { areaById } from "@/lib/catalog";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: areaById(id)?.name ?? "Area" };
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  if (!areaById(id)) notFound();
  return <AreaDetailPage id={id} />;
}
