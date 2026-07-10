import { useState, useEffect } from 'react';

interface TokenImageProps {
  assetId: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
  fallback?: React.ReactNode;
}

export const TokenImage = ({ assetId, size = "md", className = "", fallback = null }: TokenImageProps) => {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!assetId) {
      setImgUrl(null);
      setHasError(true);
      return;
    }

    const url = `/img/${assetId}.png`;
    const img = new Image();
    img.src = url;
    
    img.onload = () => {
      setImgUrl(url);
      setHasError(false);
    };
    
    img.onerror = () => {
      setImgUrl(null);
      setHasError(true);
    };
  }, [assetId]);

  if (hasError || !imgUrl) return <>{fallback}</>;

  const sizeClasses = {
    xs: "w-4 h-4 rounded",
    sm: "w-6 h-6 rounded-lg",
    md: "w-10 h-10 rounded-xl",
    lg: "w-14 h-14 rounded-2xl"
  };

  return (
    <img 
      src={imgUrl} 
      alt={`Token ${assetId}`} 
      className={`object-contain bg-background/50 border border-border/40 shadow-sm flex-shrink-0 ${sizeClasses[size]} ${className}`}
    />
  );
};

export default TokenImage;
