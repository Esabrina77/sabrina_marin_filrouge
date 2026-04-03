import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className = '', 
  ...props 
}) => {
  const variants = {
    primary: "fika-btn-primary",
    secondary: "fika-btn-secondary",
    outline: "bg-transparent border border-slate-200 text-slate-600 hover:bg-slate-50 px-6 py-3 rounded-2xl font-bold",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-50 border-none px-4",
    link: "bg-transparent text-fika-primary hover:underline border-none p-0 h-auto font-bold underline-offset-4",
  };

  const currentVariant = variants[variant];

  return (
    <button 
      className={`${currentVariant} flex items-center justify-center gap-2 ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && (
        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
};

export default Button;
