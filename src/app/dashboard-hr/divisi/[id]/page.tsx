import type { Metadata } from "next";
import { DivisionDetailPage } from "@/features/hr/divisions/DivisionDetailPage";

type Props = { params: Promise<{ id: string }> };

export const metadata: Metadata = { title: "Divisi" };

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <DivisionDetailPage id={id} />;
}
