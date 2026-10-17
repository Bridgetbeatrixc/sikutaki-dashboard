import { DashboardMock } from "../components/DashboardMock";
import { container, SectionHead } from "../components/ui";

export function Showcase() {
  return (
    <section id="dashboard" className="bg-canvas py-[60px] sm:pt-[90px] sm:pb-[110px]">
      <div className={container}>
        <SectionHead title="Satu dashboard. Seluruh tim terlihat." text="Buka menu Peta 42 Area dan Tren untuk melihat detailnya." />
        <DashboardMock />
      </div>
    </section>
  );
}
