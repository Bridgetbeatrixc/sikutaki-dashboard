import type { Metadata } from "next";
import { ResetPage } from "@/features/site/pages/ResetPage";
import { resetTokenValid } from "@/server/auth";

export const metadata: Metadata = { title: "Atur ulang kata sandi", robots: { index: false } };

type Props = { params: Promise<{ token: string }> };

export default async function Page({ params }: Props) {
  const { token } = await params;
  return <ResetPage token={token} valid={await resetTokenValid(token)} />;
}
