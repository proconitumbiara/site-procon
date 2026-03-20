import Link from "next/link";
import { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

type ButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link";

interface IconButtonLinkProps {
  label: string;
  icon?: LucideIcon;
  url: string;
  variant?: ButtonVariant;
  className?: string;
}

export default function IconButtonLink({
  label,
  icon: Icon,
  url,
  variant = "outline",
  className,
}: IconButtonLinkProps) {
  return (
    <Button asChild variant={variant} className={className}>
      <Link
        href={url}
        className="no-underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        {Icon && <Icon aria-hidden="true" />}
        <span className="whitespace-nowrap">{label}</span>
      </Link>
    </Button>
  );
}

