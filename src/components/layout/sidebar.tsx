
'use client';
import { Menu } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { SidebarNav } from './sidebar-nav';
import { toolGroups } from '@/app/(main)/tools/data';


export function Sidebar() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="p-4 text-left">
            <SheetTitle>Công cụ AI</SheetTitle>
        </SheetHeader>
        <SidebarNav groups={toolGroups} />
      </SheetContent>
    </Sheet>
  );
}
