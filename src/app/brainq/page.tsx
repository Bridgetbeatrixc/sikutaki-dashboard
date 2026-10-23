import { WorkforceDashboard } from "@/features/brainq/WorkforceDashboard";
import { getDashboard } from "@/features/brainq/api";

export const dynamic = "force-dynamic";

/** /brainq?kode=DEMO. Without a code it opens the sample company. */
export default async function Page({ searchParams }: { searchParams: Promise<{ kode?: string }> }) {
  const code = ((await searchParams).kode || "DEMO").toUpperCase();
  let data = null, error = "";
  try {
    data = await getDashboard(code);
  } catch (e) {
    error = e instanceof Error ? e.message : "Gagal memuat data.";
  }
  return <WorkforceDashboard code={code} data={data} error={error} />;
}
