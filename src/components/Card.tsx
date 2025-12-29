import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  gradient?: boolean;
}

export function Card({ children, className = '', gradient = false }: CardProps) {
  if (gradient) {
    return (
      <div className={`gradient-border p-6 ${className}`}>
        {children}
      </div>
    );
  }

  return (
    <div className={`bg-zinc-900 border border-zinc-800 rounded-xl p-6 ${className}`}>
      {children}
    </div>
  );
}
