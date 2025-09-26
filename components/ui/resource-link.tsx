import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

type ResourceLinkProps = {
  href: string;
  label: string;
  className?: string;
};

export function ResourceLink({ href, label, className }: ResourceLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group inline-flex items-center gap-1 text-xs font-medium text-accent hover:text-accent-muted",
        className
      )}
    >
      <span>{label}</span>
      <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </a>
  );
}
