import type { Metadata } from "next";
import { JoinPage } from "@/features/site/pages/JoinPage";

export const metadata: Metadata = { title: "Gabung" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function Page({ searchParams }: Props) {
  const q = await searchParams;
  return <JoinPage code={typeof q.kode === "string" ? q.kode.trim() : ""} />;
}
