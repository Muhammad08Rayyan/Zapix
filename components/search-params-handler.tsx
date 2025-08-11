"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

interface SearchParamsHandlerProps {
  mounted: boolean;
}

export function SearchParamsHandler({ mounted }: SearchParamsHandlerProps) {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (mounted && searchParams.get('scrollTo') === 'contact') {
      setTimeout(() => {
        const contactSection = document.getElementById('contact');
        if (contactSection) {
          contactSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [mounted, searchParams]);

  return null;
}