export const GeometricShapes = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Large circle - top right */}
      <svg
        className="absolute -top-20 -right-20 w-96 h-96 opacity-20"
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="100" cy="100" r="80" fill="hsl(var(--primary))" />
      </svg>

      {/* Triangle - bottom left */}
      <svg
        className="absolute -bottom-10 -left-10 w-64 h-64 opacity-15"
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <polygon points="100,10 190,190 10,190" fill="hsl(var(--secondary))" />
      </svg>

      {/* Small circle - middle left */}
      <svg
        className="absolute top-1/3 -left-8 w-32 h-32 opacity-25"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="50" cy="50" r="40" fill="hsl(var(--accent))" />
      </svg>

      {/* Lines - top left */}
      <svg
        className="absolute top-20 left-20 w-48 h-48 opacity-10"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        <line x1="0" y1="20" x2="100" y2="20" stroke="hsl(var(--primary))" strokeWidth="2" />
        <line x1="0" y1="40" x2="80" y2="40" stroke="hsl(var(--primary))" strokeWidth="2" />
        <line x1="0" y1="60" x2="60" y2="60" stroke="hsl(var(--primary))" strokeWidth="2" />
      </svg>

      {/* Diamond - right middle */}
      <svg
        className="absolute top-1/2 -right-4 w-24 h-24 opacity-20"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        <polygon points="50,0 100,50 50,100 0,50" fill="hsl(var(--secondary))" />
      </svg>

      {/* Small circles cluster - bottom right */}
      <svg
        className="absolute bottom-32 right-32 w-40 h-40 opacity-15"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="20" cy="20" r="15" fill="hsl(var(--primary))" />
        <circle cx="60" cy="30" r="10" fill="hsl(var(--secondary))" />
        <circle cx="40" cy="70" r="12" fill="hsl(var(--accent))" />
      </svg>

      {/* Dotted arc - top center */}
      <svg
        className="absolute top-10 left-1/2 -translate-x-1/2 w-64 h-32 opacity-10"
        viewBox="0 0 200 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M 10 80 Q 100 -10 190 80"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="3"
          strokeDasharray="8 8"
        />
      </svg>
    </div>
  );
};

export const HeroGeometricShapes = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Animated floating shapes */}
      <div className="absolute top-20 right-10 w-20 h-20 rounded-full bg-primary/10 animate-bounce-soft" />
      <div className="absolute top-40 left-20 w-12 h-12 rounded-full bg-secondary/15 animate-pulse-soft" />
      <div className="absolute bottom-40 right-1/4 w-16 h-16 bg-accent/10 rotate-45 animate-bounce-soft" style={{ animationDelay: '1s' }} />
      
      {/* Grid pattern */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.03]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  );
};
