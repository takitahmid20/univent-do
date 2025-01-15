'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';

// List of paths where navbar should be hidden
const hiddenNavbarPaths = [
  '/dashboard',
  '/signin',
  '/signup',
  '/forgot-password',
  
  // Add more paths as needed
];

export default function ClientWrapper({ children }) {
  const pathname = usePathname();

  // Check if current path should hide navbar
  const shouldHideNavbar = hiddenNavbarPaths.some(path => 
    pathname?.startsWith(path)
  );

  return (
    <>
      {!shouldHideNavbar && <Navbar />}
      {children}
    </>
  );
}