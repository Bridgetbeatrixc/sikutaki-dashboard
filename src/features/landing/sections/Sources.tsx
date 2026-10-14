import { container } from "../components/ui";
import { SOURCES } from "../content";

/** Source list for the footnote markers ([1], [2], ...) used on the home page. */
export function Sources() {
  return (
    <section id="sumber" className={`${container} grid gap-2 pt-12 pb-10 text-[12.5px] text-muted`}>
      <b className="text-[13px] font-semibold text-ink">Sumber</b>
      <ol className="grid gap-1">
        {SOURCES.map((s) => (
          <li key={s.n}>[{s.n}] {s.text}. <a href={s.url} target="_blank" rel="noreferrer" className="break-all text-brand">{s.url.replace(/^https:\/\//, "")}</a></li>
        ))}
      </ol>
    </section>
  );
}
