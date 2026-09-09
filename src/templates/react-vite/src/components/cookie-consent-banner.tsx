import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ShieldCheck } from "lucide-react";
import { useCallback, useRef, useState } from "react";

gsap.registerPlugin(useGSAP);

const CONSENT_STORAGE_KEY = "starter_cookie_consent";
const CONSENT_COOKIE_NAME = "starter_cookie_consent";

function getStoredConsent() {
  if (typeof window === "undefined") return false;

  try {
    if (window.localStorage.getItem(CONSENT_STORAGE_KEY) === "accepted") {
      return true;
    }
  } catch {
    /* ignore */
  }

  if (typeof document !== "undefined") {
    return document.cookie
      .split(";")
      .map((s) => s.trim())
      .some((s) => s === `${CONSENT_COOKIE_NAME}=accepted`);
  }
  return false;
}

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(() => !getStoredConsent());
  const [accepting, setAccepting] = useState(false);

  // refs for GSAP
  const wrapperRef = useRef<HTMLElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  // 初始化 / 播放入场动画
  useGSAP(
    () => {
      if (
        !visible ||
        !wrapperRef.current ||
        !cardRef.current ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      )
        return;

      const ctx = gsap.context(() => {
        const items = wrapperRef.current!.querySelectorAll("[data-cc-item]");

        // 先清理旧的时间线
        tlRef.current?.kill();

        // 入场 timeline（稍微上浮、淡入，内容 stagger）
        const tl = gsap.timeline({
          defaults: { ease: "power2.out" },
          paused: true,
        });

        tl
          // 外层整体浮入
          .from(wrapperRef.current, {
            y: 12,
            opacity: 0,
            duration: 0.28,
            willChange: "transform,opacity",
          })
          // 卡片轻浮入
          .from(
            cardRef.current,
            {
              y: 8,
              opacity: 0,
              duration: 0.25,
              willChange: "transform,opacity",
            },
            "<", // 与上一段同时开始
          )
          // 主要内容逐项进入
          .from(
            items,
            {
              y: 6,
              opacity: 0,
              duration: 0.22,
              stagger: 0.04,
              willChange: "transform,opacity",
            },
            "-=0.06",
          );

        tl.play();
        tlRef.current = tl;
      }, wrapperRef);

      return () => {
        ctx.revert();
        tlRef.current = null;
      };
    },
    { dependencies: [visible], revertOnUpdate: true },
  );

  const persistConsent = useCallback(() => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(CONSENT_STORAGE_KEY, "accepted");
      } catch {
        /* ignore */
      }
    }
    if (typeof document !== "undefined") {
      document.cookie = `${CONSENT_COOKIE_NAME}=accepted; path=/; max-age=31536000; SameSite=Lax${window.location.protocol === "https:" ? "; Secure" : ""}`;
    }
  }, []);

  const handleAccept = () => {
    if (accepting) return;
    setAccepting(true);
    persistConsent();

    // 优先用时间线反向做退场；若未创建则直接隐藏
    if (tlRef.current) {
      tlRef.current.eventCallback("onReverseComplete", () => {
        setVisible(false);
      });
      if (tlRef.current.time() === 0) setVisible(false);
      else tlRef.current.timeScale(1.1).reverse();
    } else {
      // 回退：无 tl 时也保证隐藏
      setVisible(false);
    }
  };

  if (!visible) return null;

  return (
    <section
      ref={wrapperRef}
      role="region"
      aria-live="polite"
      aria-label="必要存储说明"
      className="pointer-events-auto w-full"
    >
      <Card
        ref={cardRef}
        className={[
          "pointer-events-auto w-full gap-0 overflow-hidden py-0",
          "border-border/60 bg-card/95 shadow-[0_18px_50px_-24px_rgba(15,23,42,0.35)] backdrop-blur-xl",
          "supports-[backdrop-filter]:bg-card/85",
          "rounded-2xl border",
        ].join(" ")}
      >
        <CardHeader
          className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 px-4 pt-4 pb-3 sm:px-5 sm:pt-5"
          data-cc-item
        >
          <span className="row-span-2 mt-0.5 grid size-10 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/10">
            <ShieldCheck className="size-5" />
          </span>
          <CardTitle className="text-sm leading-5 sm:text-base">
            必要的浏览器存储
          </CardTitle>
          <CardDescription className="max-w-md text-sm leading-5">
            本模板仅使用记住界面设置和存储说明确认状态所需的 Cookie
            与本地存储，不包含广告或行为分析 Cookie。
          </CardDescription>
        </CardHeader>

        <CardFooter
          className="flex flex-col-reverse gap-2 px-4 pb-4 sm:flex-row sm:items-center sm:justify-end sm:px-5 sm:pb-5"
          data-cc-item
        >
          <Button
            type="button"
            variant="ghost"
            size="sm"
            asChild
            className="w-full sm:w-auto"
            aria-label="查看 Cookie 政策"
          >
            <Link to="/about#cookies">查看存储说明</Link>
          </Button>
          <Button
            type="button"
            size="sm"
            className="w-full sm:w-auto"
            onClick={handleAccept}
            disabled={accepting}
            aria-busy={accepting}
            aria-label="确认已阅读必要存储说明"
          >
            知道了
          </Button>
        </CardFooter>
      </Card>
    </section>
  );
}
