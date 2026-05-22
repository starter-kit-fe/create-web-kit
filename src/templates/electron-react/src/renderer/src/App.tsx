import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { MonitorCogIcon, MoonIcon, RadioIcon, RouteIcon, SendIcon, SunIcon } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@renderer/components/ui/badge'
import { Button } from '@renderer/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@renderer/components/ui/card'
import { Separator } from '@renderer/components/ui/separator'
import { Switch } from '@renderer/components/ui/switch'
import { Tabs, TabsList, TabsTrigger } from '@renderer/components/ui/tabs'
import { Toaster } from '@renderer/components/ui/sonner'
import { cn } from '@renderer/lib/utils'
import { commandCountAtom, darkModeAtom, routeModeAtom } from '@renderer/store/app'

const shellItems = [
  {
    label: 'Overview',
    path: '/overview',
    icon: MonitorCogIcon
  },
  {
    label: 'Settings',
    path: '/settings',
    icon: RouteIcon
  }
]

function App(): React.JSX.Element {
  const [darkMode, setDarkMode] = useAtom(darkModeAtom)

  return (
    <div className={cn(darkMode && 'dark')}>
      <div className="min-h-screen bg-background text-foreground">
        <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-6 py-6">
          <Header darkMode={darkMode} onDarkModeChange={setDarkMode} />
          <main className="grid flex-1 gap-6 lg:grid-cols-[220px_1fr]">
            <Sidebar />
            <section className="min-w-0">
              <Routes>
                <Route path="/" element={<Navigate to="/overview" replace />} />
                <Route path="/overview" element={<OverviewPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Routes>
            </section>
          </main>
        </div>
        <Toaster />
      </div>
    </div>
  )
}

function Header({
  darkMode,
  onDarkModeChange
}: {
  darkMode: boolean
  onDarkModeChange: (value: boolean) => void
}): React.JSX.Element {
  return (
    <header className="flex flex-col gap-4 border-b pb-5 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">Electron React</Badge>
          <Badge variant="outline">Hash Router</Badge>
          <Badge variant="outline">Jotai</Badge>
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Desktop Starter</h1>
          <p className="text-sm text-muted-foreground">
            A route-ready Electron shell with shadcn/ui and local application state.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <SunIcon className="text-muted-foreground" />
        <Switch
          checked={darkMode}
          onCheckedChange={onDarkModeChange}
          aria-label="Toggle dark mode"
        />
        <MoonIcon className="text-muted-foreground" />
      </div>
    </header>
  )
}

function Sidebar(): React.JSX.Element {
  const location = useLocation()

  return (
    <aside className="flex flex-col gap-2 border-b pb-4 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-4">
      {shellItems.map((item) => {
        const Icon = item.icon
        const active = location.pathname === item.path

        return (
          <Button
            key={item.path}
            asChild
            variant={active ? 'secondary' : 'ghost'}
            className="justify-start"
          >
            <Link to={item.path}>
              <Icon data-icon="inline-start" />
              {item.label}
            </Link>
          </Button>
        )
      })}
    </aside>
  )
}

function OverviewPage(): React.JSX.Element {
  const commandCount = useAtomValue(commandCountAtom)
  const incrementCommandCount = useSetAtom(commandCountAtom)
  const routeMode = useAtomValue(routeModeAtom)
  const versions = window.electron.process.versions

  function sendPing(): void {
    window.electron.ipcRenderer.send('ping')
    incrementCommandCount((count) => count + 1)
    toast.success('IPC ping sent')
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Runtime</CardTitle>
          <CardDescription>
            Electron, Chromium, and Node versions from the preload bridge.
          </CardDescription>
          <CardAction>
            <Button onClick={sendPing}>
              <SendIcon data-icon="inline-start" />
              Send IPC
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Metric label="Electron" value={versions.electron ?? 'unknown'} />
          <Metric label="Chromium" value={versions.chrome ?? 'unknown'} />
          <Metric label="Node" value={versions.node ?? 'unknown'} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Application State</CardTitle>
          <CardDescription>Jotai atoms are wired for shared UI state and commands.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2 rounded-lg border p-4">
            <span className="text-sm text-muted-foreground">Router mode</span>
            <div className="flex items-center gap-2 text-lg font-semibold">
              <RadioIcon />
              {routeMode}
            </div>
          </div>
          <div className="flex flex-col gap-2 rounded-lg border p-4">
            <span className="text-sm text-muted-foreground">IPC commands</span>
            <span className="text-lg font-semibold">{commandCount}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function SettingsPage(): React.JSX.Element {
  const [routeMode, setRouteMode] = useAtom(routeModeAtom)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Routing</CardTitle>
        <CardDescription>
          Hash routing is the default for packaged Electron renderer files.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={routeMode} onValueChange={(value) => setRouteMode(value as 'hash' | 'memory')}>
          <TabsList>
            <TabsTrigger value="hash">Hash</TabsTrigger>
            <TabsTrigger value="memory">Memory</TabsTrigger>
          </TabsList>
        </Tabs>
        <Separator className="my-6" />
        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
          <p>Current location: {window.location.hash || '#/'}</p>
          <p>Use HashRouter when loading the renderer from local files in production builds.</p>
        </div>
      </CardContent>
    </Card>
  )
}

function Metric({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <div className="flex flex-col gap-2 rounded-lg border p-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-mono text-lg font-semibold">{value}</span>
    </div>
  )
}

export default App
