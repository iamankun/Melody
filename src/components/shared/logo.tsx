import type { SVGProps } from 'react';
import Image from 'next/image';

export function Logo(props: { className?: string }) {
  // The user has uploaded their own logo.svg, so we'll use that.
  // The props are passed to the Image component, which will handle className, etc.
  return (
    <Image 
      src="/logo.svg" 
      alt="Melody AI - Chàng trai Giai Điều"
      width={300}
      height={300} 
      className={props.className}
    />
  );
}
