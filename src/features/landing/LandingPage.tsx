import { Areas } from "./sections/Areas";
import { Audiences } from "./sections/Audiences";
import { FinalCta, TryIt } from "./sections/Closing";
import { Footer } from "./sections/Footer";
import { GetToKnow } from "./sections/GetToKnow";
import { Header } from "./sections/Header";
import { Hero } from "./sections/Hero";
import { Showcase } from "./sections/Showcase";
import { Stats } from "./sections/Stats";
import { Why } from "./sections/Why";

/** Marketing page at "/". Every product button leads into /dashboard-hr or /dashboard-employee. */
export function LandingPage() {
  return (
    <div className="bg-white text-base text-ink">
      <Header />
      <main>
        <Hero />
        <Audiences />
        <GetToKnow />
        <Showcase />
        <Why />
        <Areas />
        <Stats />
        <TryIt />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
