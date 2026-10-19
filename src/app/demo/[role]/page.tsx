import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OpenDemo } from "@/features/site/OpenDemo";

export const metadata: Metadata = { title: "Demo", robots: { index: false } };

type Props = { params: Promise<{ role: string }> };

/** /demo/hr and /demo/karyawan open the demo company. The cookie is set by a server action, never during a prefetch. */
export default async function Page({ params }: Props) {
  const { role } = await params;
  if (role !== "hr" && role !== "karyawan") notFound();
  return <OpenDemo role={role === "hr" ? "hr" : "employee"} />;
}
