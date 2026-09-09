import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Tabs } from "radix-ui";
import { Toaster } from "sonner";
import { AnimatedSegmentedTabs } from "@/components/ui/animated-segmented-tabs";
import { BuildInfo } from "@/components/build-info";
import { ThemeToggle } from "@/components/theme-toggle";
import { CookieConsentBanner } from "@/components/cookie-consent-banner";
import { AppUpdateChecker } from "@/components/providers/app-update-checker";
import { useTheme } from "@/hooks/use-theme";

const routes = [
  { label: "首页", value: "/" },
  { label: "关于", value: "/about" },
];

export function AppLayout() {
  const { resolvedTheme } = useTheme();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const activeRoute = pathname.replace(/\/+$/, "") || "/";
  const knownRoute = routes.some((route) => route.value === activeRoute);

  return (
    <>
      <div className="app-shell bg-background text-foreground">
        <div className="app-container flex flex-col gap-10">
          <header className="flex items-center justify-between gap-4">
            <span className="font-semibold">React Vite Starter</span>
            <ThemeToggle />
          </header>
          <AnimatedSegmentedTabs
            label="主导航"
            options={routes}
            value={activeRoute}
            onValueChange={(value) => navigate(value)}
            activationMode="manual"
            className="flex flex-col gap-10"
          >
            {knownRoute ? (
              <Tabs.Content value={activeRoute} asChild>
                <main>
                  <Outlet />
                </main>
              </Tabs.Content>
            ) : (
              <main>
                <Outlet />
              </main>
            )}
          </AnimatedSegmentedTabs>
          <footer>
            <BuildInfo />
          </footer>
        </div>
      </div>
      <aside
        aria-label="站点通知"
        className="fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-50 flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg flex-col gap-3 overflow-y-auto sm:right-6"
      >
        <AppUpdateChecker />
        <CookieConsentBanner />
      </aside>
      <Toaster theme={resolvedTheme} position="top-right" richColors />
    </>
  );
}
