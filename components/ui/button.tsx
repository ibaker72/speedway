import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "premium"
  | "glass";
type ButtonSize = "sm" | "md" | "lg" | "xl";

interface ButtonBaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
}

interface ButtonAsButton
  extends ButtonBaseProps,
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonBaseProps> {
  href?: never;
}

interface ButtonAsLink extends ButtonBaseProps {
  href: string;
  target?: string;
  rel?: string;
}

type ButtonProps = ButtonAsButton | ButtonAsLink;

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-white hover:bg-accent-light active:bg-accent-dark shadow-[0_2px_12px_rgba(211,17,25,0.3)] hover:shadow-[0_4px_20px_rgba(211,17,25,0.42)]",
  premium:
    "bg-gradient-to-r from-accent via-red-600 to-accent-dark text-white shadow-[0_2px_16px_rgba(211,17,25,0.35)] hover:shadow-[0_4px_24px_rgba(211,17,25,0.5)] hover:brightness-110",
  secondary:
    "bg-surface-3 text-white hover:bg-surface-4 active:bg-surface-5 border border-white/[0.06] hover:border-white/[0.1]",
  outline:
    "border border-white/[0.15] text-white hover:bg-white/[0.06] hover:border-white/[0.25] active:bg-white/[0.08]",
  glass:
    "bg-white/[0.06] backdrop-blur-md border border-white/[0.1] text-white hover:bg-white/[0.1] hover:border-white/[0.2]",
  ghost: "text-zinc-400 hover:text-white hover:bg-white/[0.06] active:bg-white/[0.08]",
  danger:
    "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-[13px]",
  md: "px-6 py-2.5 text-sm",
  lg: "px-8 py-3.5 text-[15px]",
  xl: "px-10 py-4 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-300 ease-out hover:-translate-y-0.5 focus-visible:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-40 disabled:pointer-events-none whitespace-nowrap cursor-pointer",
    variantStyles[variant],
    sizeStyles[size],
    className
  );

  if ("href" in props && props.href) {
    const { href, target, rel } = props;
    return (
      <Link href={href} target={target} rel={rel} className={classes}>
        {children}
      </Link>
    );
  }

  const { ...buttonProps } = props as ButtonAsButton;
  return (
    <button className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
