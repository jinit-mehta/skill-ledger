import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface ReputationGaugeProps {
  score: number;
  maxScore?: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function ReputationGauge({
  score,
  maxScore = 100,
  size = "md",
  showLabel = true,
}: ReputationGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  
  const sizes = {
    sm: { width: 120, stroke: 8, fontSize: "text-2xl" },
    md: { width: 180, stroke: 12, fontSize: "text-4xl" },
    lg: { width: 240, stroke: 16, fontSize: "text-5xl" },
  };
  
  const { width, stroke, fontSize } = sizes[size];
  const radius = (width - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = (animatedScore / maxScore) * 100;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Determine color based on score
  const getColor = () => {
    if (percentage >= 80) return "hsl(var(--success))";
    if (percentage >= 60) return "hsl(var(--primary))";
    if (percentage >= 40) return "hsl(var(--warning))";
    return "hsl(var(--destructive))";
  };

  const getGrade = () => {
    if (percentage >= 90) return "A+";
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B+";
    if (percentage >= 60) return "B";
    if (percentage >= 50) return "C";
    return "D";
  };

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = score / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        setAnimatedScore(score);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.round(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [score]);

  return (
    <div className="relative inline-flex flex-col items-center">
      <svg
        width={width}
        height={width}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={width / 2}
          cy={width / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--secondary))"
          strokeWidth={stroke}
        />
        {/* Animated progress circle */}
        <motion.circle
          cx={width / 2}
          cy={width / 2}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{
            filter: `drop-shadow(0 0 10px ${getColor()})`,
          }}
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className={`font-display font-bold ${fontSize}`}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
          {animatedScore}
        </motion.span>
        {showLabel && (
          <motion.span
            className="text-muted-foreground text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            out of {maxScore}
          </motion.span>
        )}
      </div>

      {/* Grade badge */}
      {showLabel && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-4 px-4 py-1.5 rounded-full bg-secondary"
        >
          <span className="text-sm font-medium">
            Grade: <span className="text-primary">{getGrade()}</span>
          </span>
        </motion.div>
      )}
    </div>
  );
}
