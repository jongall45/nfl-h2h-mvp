// app/components/ui/BorderBeamButton.tsx

import React from 'react';

interface BorderBeamButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
}

export function BorderBeamButton({ children, className, ...props }: BorderBeamButtonProps) {
  return (
    <button
      className={`border-beam border border-white/30 hover:border-transparent rounded-full ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}