import React from 'react';
import Header from './Header';
import Footer from './Footer';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50">
      <Header />
      
      <main className="flex-1 overflow-y-auto mt-16 mb-20 px-4 py-6 scroll-smooth bg-slate-50/50">
        <div key="fika-main-content-anchor" className="max-w-lg mx-auto">
          {children}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default MainLayout;
