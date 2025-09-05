import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

export const LoadingSpinner = ({ 
  size = "md", 
  text = "Loading...", 
  className = "" 
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-[#046658]`} />
      {text && (
        <p className="text-sm text-[#3E4C4B]/70 font-medium">{text}</p>
      )}
    </div>
  );
};

export const PageLoadingSpinner = () => (
  <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] via-[#D1F1F2] to-[#F5F7FA] flex items-center justify-center">
    <LoadingSpinner size="lg" text="Loading your dashboard..." />
  </div>
);

export const AuthLoadingSpinner = () => (
  <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] via-[#D1F1F2] to-[#F5F7FA] flex items-center justify-center">
    <div className="text-center space-y-4">
      <LoadingSpinner size="lg" text="Authenticating..." />
      <p className="text-[#3E4C4B]/70 text-sm">
        Please wait while we verify your credentials
      </p>
    </div>
  </div>
);
