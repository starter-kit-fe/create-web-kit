import { ExtensionShell } from "../../src/components/extension-shell";

export function App() {
  return (
    <ExtensionShell
      title="WXT React Starter"
      description="Popup, options, background, and content entrypoints are ready."
    >
      <div className="stack">
        <div className="metric-card">
          <span className="label">Runtime</span>
          <strong>Manifest V3</strong>
        </div>
        <div className="metric-card">
          <span className="label">Storage</span>
          <strong>webextension-polyfill</strong>
        </div>
      </div>
    </ExtensionShell>
  );
}

export default App;
