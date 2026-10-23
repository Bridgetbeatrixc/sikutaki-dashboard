import type { Metadata } from "next";
import { LoginPage, type LoginNotice } from "@/features/site/pages/LoginPage";

export const metadata: Metadata = { title: "Masuk" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function Page({ searchParams }: Props) {
  const q = await searchParams;
  const next = typeof q.lanjut === "string" ? q.lanjut : undefined;
  const notice: LoginNotice | undefined = q.sandi ? "sandi" : q.tautan ? "kedaluwarsa" : q.hapus ? "hapus" : undefined;
  return <LoginPage next={next} notice={notice} />;
}
