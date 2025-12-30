interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  xs: 'w-4 h-4',
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-10 h-10',
  xl: 'w-16 h-16',
};

export function Logo({ size = 'md', className = '' }: LogoProps) {
  return (
    <img 
      src="/fakesol-logo.png" 
      alt="FakeSOL Logo" 
      className={`${sizeClasses[size]} object-contain mix-blend-screen ${className}`} 
    />
  );
}

export function LogoWithText({ size = 'md', className = '' }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Logo size={size} />
      <span className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        FakeSOL
      </span>
    </div>
  );
}
