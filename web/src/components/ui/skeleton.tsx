"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
  style?: React.CSSProperties;
}

export const Skeleton = ({
  width = '100%',
  height = '1rem',
  borderRadius = 8,
  className = '',
  style = {}
}: SkeletonProps) => {
  return (
    <motion.div
      animate={{
        opacity: [0.4, 1, 0.4],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={`skeleton ${className}`}
      style={{
        width,
        height,
        borderRadius,
        background: 'linear-gradient(90deg, var(--bg-surface) 25%, var(--border-subtle) 50%, var(--bg-surface) 75%)',
        backgroundSize: '200% 100%',
        ...style,
      }}
    />
  );
};

export const TableSkeleton = ({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) => (
  <div style={{ width: '100%' }}>
    {[...Array(rows)].map((_, i) => (
      <div key={i} style={{ 
        display: 'flex', 
        padding: '14px 22px', 
        borderBottom: i < rows - 1 ? '1px solid var(--border-subtle)' : 'none',
        gap: 20,
        alignItems: 'center'
      }}>
        {[...Array(cols)].map((_, j) => (
          <Skeleton 
            key={j} 
            height={j === 0 ? 40 : 16} 
            width={j === 0 ? 150 : (j === cols - 1 ? 80 : '15%')} 
            style={{ flexShrink: 0 }}
          />
        ))}
      </div>
    ))}
  </div>
);
