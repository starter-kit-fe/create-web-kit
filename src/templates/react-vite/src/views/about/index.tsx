import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function AboutPage() {
  const { hash } = useLocation();
  useEffect(() => {
    if (hash === "#cookies")
      document.getElementById("cookies")?.scrollIntoView();
  }, [hash]);
  return (
    <section className="flex max-w-2xl flex-col gap-6">
      <h1 className="text-4xl font-semibold tracking-tight">关于</h1>
      <p className="leading-7 text-muted-foreground">
        这是一个基于 React、TypeScript 和 Vite 的应用模板，内置 shadcn/ui、 Zod
        + React Hook Form、Jotai、GSAP 与 TanStack Query/Table。
      </p>
      <p className="leading-7 text-muted-foreground">
        页面位于 src/views，使用 React Router History 路由。
        外观设置和构建信息由应用布局统一提供，切换页面不会重置主题。
      </p>
      <section id="cookies" className="flex scroll-mt-6 flex-col gap-3">
        <h2 className="text-xl font-semibold">浏览器存储说明</h2>
        <p className="leading-7 text-muted-foreground">
          本模板使用本地存储保存主题、主色、圆角、字号和布局偏好。
          确认存储说明后，会保存 starter_cookie_consent
          标记，并设置一年有效的同名 Cookie。
          这些数据保存在当前浏览器中，可通过浏览器的网站数据设置清除。
        </p>
        <p className="leading-7 text-muted-foreground">
          模板不包含广告或行为分析。若后续接入非必要追踪服务，请补充真实的隐私政策与同意管理，不能将“知道了”视为追踪授权。
        </p>
      </section>
      <Button asChild variant="outline" className="self-start">
        <Link to="/">返回首页</Link>
      </Button>
    </section>
  );
}
