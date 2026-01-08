import { motion } from "framer-motion";
import { Award, ExternalLink } from "lucide-react";

interface TimelineItem {
  id: string;
  title: string;
  issuer: string;
  date: string;
  type: "certificate" | "skill" | "course";
}

interface CredentialTimelineProps {
  items: TimelineItem[];
}

const typeColors = {
  certificate: "bg-primary",
  skill: "bg-accent",
  course: "bg-success",
};

export function CredentialTimeline({ items }: CredentialTimelineProps) {
  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

      <div className="space-y-6">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative flex gap-4 pl-10"
          >
            {/* Timeline dot */}
            <div
              className={`absolute left-2.5 w-3 h-3 rounded-full ${typeColors[item.type]} ring-4 ring-background`}
            />

            {/* Content */}
            <div className="flex-1 p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors group">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium group-hover:text-primary transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">{item.issuer}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{item.date}</span>
                  <button className="p-1 rounded hover:bg-secondary transition-colors">
                    <ExternalLink className="w-3 h-3 text-muted-foreground" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
