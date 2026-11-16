import { useI18n } from "../i18n";
import { homeHref } from "../router";

export default function NotFoundPage({ title, copy }: { title: string; copy: string }) {
  const { t } = useI18n();
  return (
    <section className="not-found theme-dark">
      <div className="wrap">
        <p className="eyebrow">Emirates Boats</p>
        <h1 className="display-2">{title}</h1>
        <p className="lede">{copy}</p>
        <div className="actions">
          <a className="btn btn-gold" href={homeHref("fleet")}>
            {t("View the fleet")}
          </a>
          <a className="btn btn-outline" href={homeHref("services")}>
            {t("Our services")}
          </a>
        </div>
      </div>
    </section>
  );
}
