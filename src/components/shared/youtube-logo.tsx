
import type { SVGProps } from 'react';

export function YoutubeLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10A24.12 24.12 0 0 1 2.5 17" />
      <path d="M11.5 14.5A15.9 15.9 0 0 1 11.5 9.5" />
      <path d="M17.5 16.5a13.9 13.9 0 0 1-8-11" />
      <path d="M17.5 16.5a13.9 13.9 0 0 0-8-11" />
    </svg>
  );
}
