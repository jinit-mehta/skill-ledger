import { motion } from "framer-motion";
import { Shield, Brain, Award, Link as LinkIcon, Users, BarChart3 } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Tamper-Proof Credentials",
    description: "Every credential is minted as an NFT on Polygon, creating an immutable record that can never be falsified or altered.",
  },
  {
    icon: Brain,
    title: "AI-Powered Scoring",
    description: "Our ML models analyze resumes, verify skill consistency, and detect fraud patterns with explainable scoring.",
  },
  {
    icon: Award,
    title: "Reputation System",
    description: "Build a verifiable reputation through credentials, contributions, and institutional endorsements.",
  },
  {
    icon: LinkIcon,
    title: "Instant Verification",
    description: "Employers can verify any credential in seconds using just a wallet address or uploaded resume.",
  },
  {
    icon: Users,
    title: "Multi-Party Trust",
    description: "Institutions issue, learners own, and employers verify—all with cryptographic proof.",
  },
  {
    icon: BarChart3,
    title: "Explainable Insights",
    description: "Every score comes with a detailed breakdown showing exactly how it was calculated.",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function Features() {
  return (
    <section id="features" className="py-24 relative">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-medium tracking-wider uppercase mb-4 block">
            Features
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Why Choose SkillChain?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A complete ecosystem for verifiable credentials, powered by blockchain 
            technology and artificial intelligence.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={item}
              className="group relative p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300"
            >
              {/* Hover Glow Effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4 group-hover:shadow-glow-sm transition-shadow">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
