
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { buttonVariants } from '../ui/button';

export type SidebarNavGroup = {
  title: string;
  items: {
    title: string;
    href: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
};

export function SidebarNav({
  groups,
  className,
}: {
  groups: SidebarNavGroup[];
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <nav className={cn('flex flex-col gap-2 p-4 pt-0', className)}>
      {groups.map((group) => (
        <div key={group.title}>
          <h4 className="px-3 py-2 text-sm font-medium text-muted-foreground">
            {group.title}
          </h4>
          <div className="grid grid-flow-row auto-rows-max text-sm">
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'group',
                    buttonVariants({
                      variant: pathname === item.href ? 'secondary' : 'ghost',
                      size: 'sm',
                    }),
                    'justify-start'
                  )}
                >
                  {Icon && <Icon className="mr-2 h-4 w-4" />}
                  {item.title}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
