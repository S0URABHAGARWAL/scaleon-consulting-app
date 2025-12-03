import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "px-6 py-3 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed shadow-DEFAULT font-sans tracking-wide";
  
  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 border border-transparent",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90 border border-transparent",
    outline: "border-2 border-border bg-background text-foreground hover:bg-muted hover:text-primary hover:border-primary"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};