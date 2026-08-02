import Link from "next/link";
import { Dna } from "lucide-react";

type BrandMarkProps = {
  className?: string;
  ariaLabel?: string;
};

export function BrandMark({ className = "minimal-brand", ariaLabel = "PromoterLab home" }: BrandMarkProps) {
  return (
    <Link href="/" className={className} aria-label={ariaLabel}>
      <Dna aria-hidden="true" /> <span>Promoter<span>Lab</span></span>
    </Link>
  );
}
