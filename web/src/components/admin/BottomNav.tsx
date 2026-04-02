"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Users 
} from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Bord',     href: '/admin/dashboard' },
  { icon: ShoppingBag,    label: 'Cmds',    href: '/admin/orders' },
  { icon: Package,        label: 'Prods',    href: '/admin/products' },
  { icon: Users,          label: 'Clients',  href: '/admin/clients' },
];

export const BottomNav = () => {
  const pathname = usePathname();

  return (
    <nav className="mobile-bottom-nav">
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.href);
        return (
          <Link key={item.href} href={item.href} className={`nav-item ${isActive ? 'active' : ''}`}>
            <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
