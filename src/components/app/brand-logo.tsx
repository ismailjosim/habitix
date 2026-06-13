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
      src="/android-chrome-192x192.png"
      alt="Habitix"
      width={192}
      height={192}
      priority={priority}
      sizes={compact ? '40px' : '32px'}
      className={cn(
        'shrink-0 object-contain',
        compact ? 'size-10 rounded-xl' : 'size-8',
        className
      )}
    />
  );
}
