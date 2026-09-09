import { useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SweepShine } from "@/components/ui/sweep-shine";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

gsap.registerPlugin(useGSAP);
const schema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "请输入至少两个字符")
    .max(40, "最多输入 40 个字符"),
});
type FormValues = z.infer<typeof schema>;

export function HomePage() {
  const root = useRef<HTMLDivElement>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "" },
  });

  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-intro]", {
          y: 20,
          autoAlpha: 0,
          duration: 0.5,
          stagger: 0.1,
          clearProps: "all",
        });
      });
      return () => media.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} className="flex flex-col gap-12">
      <section data-intro className="flex max-w-2xl flex-col gap-4">
        <h1 className="text-4xl font-semibold tracking-tight">
          从这里开始构建应用。
        </h1>
        <p className="leading-7 text-muted-foreground">
          React Router History 路由、shadcn/ui、Zod + React Hook
          Form、Jotai、GSAP 和 TanStack Query/Table
          已就绪。使用右上角设置切换亮色、暗黑或跟随系统。
        </p>
      </section>
      <section data-intro className="flex max-w-md flex-col gap-6">
        <h2 className="text-xl font-medium">试试表单校验</h2>
        <form
          noValidate
          onSubmit={handleSubmit(({ name }) => {
            toast.success(`你好，${name}！`);
          })}
        >
          <FieldGroup>
            <Field data-invalid={Boolean(errors.name)}>
              <FieldLabel htmlFor="name">你的名字</FieldLabel>
              <Input
                id="name"
                autoComplete="name"
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "name-error" : undefined}
                {...register("name")}
              />
              <FieldError id="name-error" errors={[errors.name]} />
            </Field>
            <Button
              type="submit"
              className="w-32"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
            >
              <SweepShine active={isSubmitting}>
              {isSubmitting ? "提交中…" : "提交示例"}
            </SweepShine>
            </Button>
          </FieldGroup>
        </form>
      </section>
    </div>
  );
}
