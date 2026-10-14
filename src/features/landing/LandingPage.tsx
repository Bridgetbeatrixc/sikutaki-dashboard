import { Areas } from "./sections/Areas";
import { Audiences } from "./sections/Audiences";
import { FinalCta, TryIt } from "./sections/Closing";
import { GetToKnow } from "./sections/GetToKnow";
import { Hero } from "./sections/Hero";
import { Showcase } from "./sections/Showcase";
import { Sources } from "./sections/Sources";
import { Stats } from "./sections/Stats";
import { Why } from "./sections/Why";

/** Marketing home at "/". Header and footer come from the (site) layout. */
export function LandingPage() {
  return (
    <>
      <Hero />
      <Audiences />
      <GetToKnow />
      <Showcase />
      <Why />
      <Areas />
      <Stats />
      <TryIt />
      <FinalCta />
      <Sources />
    </>
  );
}
