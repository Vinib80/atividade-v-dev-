interface StarsProps {
  rating: number;
  count?: number;
  size?: number;
}

export function Stars({ rating, count, size = 14 }: StarsProps) {
  return (
    <div className="stars" style={{ fontSize: size }}>
      {[1, 2, 3, 4, 5].map(i => {
        const filled = rating >= i;
        const half = !filled && rating >= i - 0.5;
        return (
          <span key={i} className={`star ${filled ? 'filled' : half ? 'half' : ''}`}>
            ★
          </span>
        );
      })}
      {count !== undefined && (
        <span className="rating-label">({count})</span>
      )}
    </div>
  );
}
