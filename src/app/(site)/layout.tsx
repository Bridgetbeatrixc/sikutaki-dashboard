import { SiteFooter } from "@/features/site/SiteFooter";
import { SiteHeader } from "@/features/site/SiteHeader";

/** Header and footer shared by the home page and the company pages. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white text-base text-ink">
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}
