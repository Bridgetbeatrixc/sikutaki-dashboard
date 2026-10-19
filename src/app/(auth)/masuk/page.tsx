import type { Metadata } from "next";
import { LoginPage } from "@/features/site/pages/LoginPage";

export const metadata: Metadata = { title: "Masuk" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function Page({ searchParams }: Props) {
  const q = await searchParams;
  return <LoginPage notice={q.reset ? "reset" : q.hapus ? "hapus" : undefined} />;
}
