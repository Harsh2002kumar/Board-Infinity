'use client';
import React from 'react';
import Image from 'next/image';
import {
  MagnifyingGlassCircleIcon,
  UserCircleIcon,
} from '@heroicons/react/24/solid';
import Avatar from 'react-avatar';

function Header() {
  return (
    <div className=" ">
      <div className="flex flex-col md:flex-row items-center p-5  rounded-b-2xl border-b-2 border-gray-300 ">
        <Image
          src="/logo.png"
          alt="logo image"
          width={100}
          height={50}
          className=" pb-10 md:pb-0 object-contain "
        />
      </div>
    </div>
  );
}

export default Header;
