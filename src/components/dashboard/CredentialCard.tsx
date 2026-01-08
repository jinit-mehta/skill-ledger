import { motion } from "framer-motion";
import { Award, ExternalLink, Calendar, Building2, Shield } from "lucide-react";

interface CredentialCardProps {
  title: string;
  issuer: string;
  date: string;
  type: "certificate" | "skill" | "course" | "achievement";
  verified?: boolean;
  tokenId?: string;
  index?: number;
}

const typeColors = {
  certificate: "from-primary to-info",
  skill: "from-accent to-primary",
  course: "from-success to-primary",
  achievement: "from-warning to-accent",
};

const typeIcons = {
  certificate: Award,
  skill: Shield,
  course: Award,
  achievement: Award,
};

export function CredentialCard({
  title,
  issuer,
  date,
  type,
  verified = true,
  tokenId,
  index = 0,
}: CredentialCardProps) {
  const Icon = typeIcons[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className="group relative"
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity" />
      
      <div className="relative p-5 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all">
        {/* Top Row */}
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${typeColors[type]} flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-primary-foreground" />
          </div>
          {verified && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 text-success text-xs font-medium">
              <Shield className="w-3 h-3" />
              Verified
            </div>
          )}
        </div>

        {/* Content */}
        <h3 className="font-display text-lg font-semibold mb-1 group-hover:text-primary transition-colors">
          {title}
        </h3>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <Building2 className="w-4 h-4" />
          <span>{issuer}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>{date}</span>
        </div>

        {/* Token ID */}
        {tokenId && (
          <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-mono">
              Token: {tokenId}
            </span>
            <button className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
              <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-primary" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
