import Image from 'next/image';

import { cn } from '@/lib/utils';

type BrandLogoProps = {
  compact?: boolean;
  className?: string;
  priority?: boolean;
};

export function BrandLogo({ compact = false, className, priority = false }: BrandLogoProps) {
  return (
    <Image
      src={compact ? '/android-chrome-192x192.png' : '/logo-with-text.png'}
      alt="Habitix"
      width={compact ? 192 : 2138}
      height={compact ? 192 : 779}
      priority={priority}
      className={cn('object-contain', className)}
    />
  );
}
