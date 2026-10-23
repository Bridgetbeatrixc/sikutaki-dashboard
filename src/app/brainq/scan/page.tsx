import type { Metadata } from "next";
import { ScanForm } from "@/features/brainq/ScanForm";
import { getCompany } from "@/features/brainq/api";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Scan karyawan" };

/** /brainq/scan?kode=DEMO: the employee's 3-minute scan. The company only ever sees team averages. */
export default async function Page({ searchParams }: { searchParams: Promise<{ kode?: string }> }) {
  const code = ((await searchParams).kode || "DEMO").toUpperCase();
  const company = await getCompany(code).catch(() => null);
  return <ScanForm code={code} company={company} />;
}
