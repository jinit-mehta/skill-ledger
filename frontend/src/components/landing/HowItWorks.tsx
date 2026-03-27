import { motion } from "framer-motion";
import { Upload, Cpu, Award, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Upload Resume",
    description: "Submit your resume or connect your wallet to aggregate your on-chain credentials.",
    color: "from-primary to-info",
  },
  {
    icon: Cpu,
    title: "AI Analysis",
    description: "Our ML models analyze skill consistency, project credibility, and timeline verification.",
    color: "from-info to-accent",
  },
  {
    icon: Award,
    title: "Credential Issuance",
    description: "Verified institutions issue NFT credentials that are permanently stored on Polygon.",
    color: "from-accent to-primary",
  },
  {
    icon: CheckCircle,
    title: "Instant Verification",
    description: "Employers verify credentials instantly with cryptographic proof and explainable scores.",
    color: "from-primary to-success",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 relative bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-medium tracking-wider uppercase mb-4 block">
            How It Works
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            From Skills to Verified Credentials
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A seamless process that transforms your skills into blockchain-verified, 
            employer-trusted credentials.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative max-w-4xl mx-auto">
          {/* Connection Line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary via-accent to-primary opacity-30 hidden md:block" />

          <div className="space-y-12">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center gap-8 ${
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Content Card */}
                <div className="flex-1">
                  <div className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} mb-4`}>
                      <step.icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <h3 className="font-display text-xl font-semibold mb-2">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Step Number */}
                <div className="hidden md:flex items-center justify-center w-16 h-16 rounded-full bg-card border-2 border-primary text-primary font-display text-xl font-bold shadow-glow-sm">
                  {index + 1}
                </div>

                {/* Spacer */}
                <div className="flex-1 hidden md:block" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
