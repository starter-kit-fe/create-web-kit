import { format, parseISO } from "date-fns";
import { useEffect } from "react";
import { name, version } from "../../package.json";

const buildTime = import.meta.env.VITE_BUILD_TIME;
const formattedBuildTime = format(parseISO(buildTime), "yyyy-MM-dd HH:mm:ss xxx");
let printed = false;

export function BuildInfo() {
  useEffect(() => {
    // Avoid duplicate logs during Strict Mode effects and route remounts.
    if (printed) return;
    printed = true;

    const print = (key: string, value: string) =>
      console.log(
        `%c ${key} %c ${value} %c `,
        "background:#20232a ; padding: 1px; border-radius: 3px 0 0 3px;  color: #fff",
        "background:#61dafb ;padding: 1px; border-radius: 0 3px 3px 0;  color: #20232a; font-weight: bold;",
        "background:transparent",
      );

    print(name, version);
    print("build time", formattedBuildTime);

    // Only browser-public Vite values belong here. Never expose process.env.
    const variables = Object.entries(import.meta.env)
      .filter(([key]) => key !== "VITE_BUILD_TIME")
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, value]) => ({ key, value: String(value) }));

    console.groupCollapsed("Environment variables (public)");
    console.table(variables);
    console.groupEnd();
  }, []);

  return (
    <section className="rounded-lg border border-border bg-muted p-6" aria-label="构建信息">
      <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span>{name} · v{version}</span>
        <span>打包时间：<time dateTime={buildTime}>{formattedBuildTime}</time></span>
      </div>
    </section>
  );
}
