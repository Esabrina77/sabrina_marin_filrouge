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
    primary: "bg-amber-500 text-white hover:bg-amber-600 shadow-md shadow-amber-200",
    outline: "border-2 border-amber-500 text-amber-500 hover:bg-amber-50",
    ghost: "text-gray-500 hover:bg-gray-100 hover:text-gray-900",
    glass: "bg-white/80 backdrop-blur-md border border-gray-100 text-gray-900 shadow-sm"
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "relative flex h-12 items-center justify-center rounded-xl px-6 py-2 text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        className
      )}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        children
      )}
    </motion.button>
  );
};
