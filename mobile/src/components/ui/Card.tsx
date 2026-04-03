import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, title, className = '' }) => {
  return (
    <div className={`fika-card ${className}`}>
      {title && (
        <h3 className="text-sm font-bold text-slate-700 mb-3 border-b border-slate-50 pb-2 uppercase tracking-wide">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};

export default Card;
