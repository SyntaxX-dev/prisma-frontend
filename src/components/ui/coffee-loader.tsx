import { cn } from "@/lib/utils";

interface CoffeeLoaderProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function CoffeeLoader({ size = "md", className }: CoffeeLoaderProps) {
  const sizeClasses = {
    sm: "scale-75",
    md: "scale-100", 
    lg: "scale-125"
  };

  return (
    <span 
      className={cn(
        "coffee-loader inline-block",
        sizeClasses[size],
        className
      )}
    />
  );
}