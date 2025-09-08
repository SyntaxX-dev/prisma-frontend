import { cn } from "@/lib/utils";

interface LoadingProps {
  type?: "page" | "login";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Loading({ type = "page", size = "md", className }: LoadingProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  };

  if (type === "login") {
    return (
      <span 
        className={cn(
          "loader-spinner",
          sizeClasses[size],
          className
        )}
      />
    );
  }

  return (
    <span 
      className={cn(
        "loader-dots",
        sizeClasses[size],
        className
      )}
    />
  );
}

