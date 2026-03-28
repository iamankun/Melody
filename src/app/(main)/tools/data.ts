
import {
  Code,
  Lightbulb,
  Music,
  Palette,
  Shield,
} from 'lucide-react';

import { type SidebarNavGroup } from '@/components/layout/sidebar-nav';

export const toolGroups: SidebarNavGroup[] = [
  {
    title: 'Sáng tạo & Soạn nhạc',
    items: [
      {
        title: 'Tạo ý tưởng âm nhạc',
        href: '/tools/music-idea',
        icon: Lightbulb,
      },
      {
        title: 'Đề xuất âm nhạc',
        href: '/tools/music-preferences',
        icon: Music,
      },
      {
        title: 'Âm nhạc màu sắc',
        href: '/tools/color-music',
        icon: Palette,
      },
    ],
  },
  {
    title: 'Công cụ & Tiện ích',
    items: [
      {
        title: 'Tạo mã',
        href: '/tools/code-generator',
        icon: Code,
      },
      {
        title: 'Tư vấn IP & Bản quyền',
        href: '/tools/ip-advisor',
        icon: Shield,
      },
    ],
  },
];
