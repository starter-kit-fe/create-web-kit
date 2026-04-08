import { ExtensionShell } from "../../src/components/extension-shell";

export function App() {
  return (
    <ExtensionShell
      title="Extension Options"
      description="Use this surface for preferences, onboarding, and connected account setup."
    >
      <div className="stack">
        <div className="metric-card">
          <span className="label">Surface</span>
          <strong>options page</strong>
        </div>
      </div>
    </ExtensionShell>
  );
}

export default App;
