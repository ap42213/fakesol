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

const iconSizeClasses = {
  xs: 'w-2.5 h-2.5',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-10 h-10',
};

export function Logo({ size = 'md', className = '' }: LogoProps) {
  return (
    <div className={`${sizeClasses[size]} rounded-xl bg-gradient-to-br from-purple-500 via-violet-500 to-green-400 flex items-center justify-center ${className}`}>
      <svg 
        className={iconSizeClasses[size]} 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Solana-inspired logo */}
        <path 
          d="M5 17.5L8.5 14H19L15.5 17.5H5Z" 
          fill="white"
        />
        <path 
          d="M5 6.5L8.5 10H19L15.5 6.5H5Z" 
          fill="white"
        />
        <path 
          d="M5 12L8.5 8.5H19L15.5 12H5Z" 
          fill="white"
          opacity="0.7"
        />
      </svg>
    </div>
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
