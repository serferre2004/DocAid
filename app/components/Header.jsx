import React from 'react';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="flex items-center justify-between px-8 py-4 bg-white shadow-md sticky top-0 z-10">
      <Image src='/logo.png' alt='Doc Aid' width={100} height={90}/>
    </header>
  );
}