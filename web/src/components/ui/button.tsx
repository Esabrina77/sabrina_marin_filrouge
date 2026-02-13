import React from 'react';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost' | 'glass';
  isLoading?: boolean;
}

export const Button = ({
  className,
  variant = 'primary',
  isLoading,
  children,
  ...props
}: ButtonProps) => {
  const variants = {
    primary: "bg-amber-600 text-white hover:bg-amber-700 shadow-lg shadow-amber-900/20",
    outline: "border border-amber-600 text-amber-600 hover:bg-amber-600/10",
    ghost: "text-stone-300 hover:bg-stone-800 hover:text-white",
    glass: "glass glass-hover text-white border-white/10"
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative flex h-12 items-center justify-center rounded-xl px-6 py-2 text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-amber-600 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        className
      )}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      ) : (
        children
      )}
    </motion.button>
  );
};
