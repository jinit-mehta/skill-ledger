import { motion } from "framer-motion";

interface Skill {
  name: string;
  score: number;
  weight: number;
}

interface SkillBreakdownProps {
  skills: Skill[];
}

export function SkillBreakdown({ skills }: SkillBreakdownProps) {
  const maxScore = 100;

  return (
    <div className="space-y-4">
      {skills.map((skill, index) => (
        <motion.div
          key={skill.name}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{skill.name}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Weight: {skill.weight}%
              </span>
              <span className="text-sm font-semibold text-primary">
                {skill.score}/{maxScore}
              </span>
            </div>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${skill.score}%` }}
              transition={{ delay: index * 0.1 + 0.3, duration: 0.8, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-primary to-info rounded-full"
              style={{
                boxShadow: "0 0 10px hsl(var(--primary) / 0.5)",
              }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
