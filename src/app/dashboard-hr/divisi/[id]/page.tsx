import type { Metadata } from "next";
import { DivisionDetailPage } from "@/features/hr/divisions/DivisionDetailPage";
import { sampleDataset } from "@/lib/sample";

type Props = { params: Promise<{ id: string }> };

export const metadata: Metadata = { title: "Divisi" };

// The dashboard uses the sample company's divisions (their names can be changed per company).
export const dynamicParams = false;
export const generateStaticParams = () => sampleDataset().teams.map((t) => ({ id: t.id }));

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <DivisionDetailPage id={id} />;
}
