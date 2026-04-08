import type { PropsWithChildren } from "react";

interface ExtensionShellProps extends PropsWithChildren {
  title: string;
  description: string;
}

export function ExtensionShell({
  title,
  description,
  children,
}: ExtensionShellProps) {
  return (
    <main className="extension-shell">
      <header className="hero">
        <p className="eyebrow">Browser Extension Flow</p>
        <h1>{title}</h1>
        <p className="description">{description}</p>
      </header>
      {children}
    </main>
  );
}
