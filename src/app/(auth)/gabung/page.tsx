import type { Metadata } from "next";
import { JoinPage } from "@/features/site/pages/JoinPage";
import { db, hasDatabase } from "@/server/db";

export const metadata: Metadata = { title: "Gabung" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

/** Employee sign-up. With ?kode= the company and its divisions are looked up first. */
export default async function Page({ searchParams }: Props) {
  const raw = (await searchParams).kode;
  const code = (Array.isArray(raw) ? raw[0] : raw ?? "").trim().toUpperCase();
  let company: { name: string; teams: { id: string; name: string }[] } | null = null;
  if (code && hasDatabase()) {
    const sql = await db();
    const [c] = await sql<{ id: string; name: string }[]>`select id, name from companies where invite_code = ${code}`;
    if (c) {
      const teams = await sql<{ id: string; name: string }[]>`select id, name from teams where company_id = ${c.id} order by created_at, name`;
      company = { name: c.name, teams: teams.map((t) => ({ ...t })) };
    }
  }
  return <JoinPage code={code} company={company} noDatabase={!hasDatabase()} />;
}
