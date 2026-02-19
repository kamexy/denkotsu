"use client";

import { trackSponsoredToolClick } from "@/lib/telemetry";

interface TrackedExternalLinkProps {
  href: string;
  label: string;
  toolId: string;
  toolName: string;
  className?: string;
}

export function TrackedExternalLink({
  href,
  label,
  toolId,
  toolName,
  className,
}: TrackedExternalLinkProps) {
  const handleClick = () => {
    trackSponsoredToolClick({
      toolId,
      toolName,
      destination: href,
    });
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={handleClick}
      className={className}
    >
      {label}
    </a>
  );
}
