import type { ComponentProps, ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export function GlassCard({
  className,
  children,
  ...props
}: ComponentProps<typeof motion.div> & { children?: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn("glass-card card-hover p-5", className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function SectionCard({
  title,
  description,
  action,
  className,
  children,
}: {
  title: string;
  description?: string | undefined;
  action?: ReactNode | undefined;
  className?: string | undefined;
  children: ReactNode;
}) {
  return (
    <GlassCard className={cn("flex flex-col gap-4", className)}>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <h3 className="font-display truncate text-base font-semibold">{title}</h3>
          {description ? <p className="mt-0.5 text-xs text-muted-foreground">{description}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </GlassCard>
  );
}