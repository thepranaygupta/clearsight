import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: number;
  className?: string;
}

export function LogoIcon({ size = 24, className }: LogoProps) {
  return (
    <Image
      src="/icon.svg"
      alt="ClearSight"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
    />
  );
}

export function LogoFull({ size = 24, className }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <LogoIcon size={size} />
      <span className="text-sm font-bold tracking-tight">ClearSight</span>
    </div>
  );
}
