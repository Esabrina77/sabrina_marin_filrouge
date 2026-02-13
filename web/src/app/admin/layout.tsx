import React from 'react';
import { Sidebar } from '@/components/admin/Sidebar';
import { TopBar } from '@/components/admin/TopBar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f8f9fa] text-gray-900 flex">
      {/* Sidebar - Fixed */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 ml-64 flex flex-col min-h-screen">
        <TopBar />
        <div className="flex-1 px-8 pb-8 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
