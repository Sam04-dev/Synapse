interface Props {
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ className = "", style }: Props) {
  return (
    <div
      className={`animate-pulse ${className}`}
      style={{
        background: "rgba(255, 255, 255, 0.05)",
        borderRadius: "2px",
        willChange: "opacity",
        ...style,
      }}
    />
  );
}
