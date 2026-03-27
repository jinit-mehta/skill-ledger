import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Award, Zap } from "lucide-react";
import { Link } from "react-router-dom";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-surface" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(ellipse_at_center,_hsl(174_72%_56%_/_0.1)_0%,_transparent_70%)]" />
      <div className="absolute top-20 right-20 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 left-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "-3s" }} />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(222_30%_18%_/_0.1)_1px,transparent_1px),linear-gradient(to_bottom,hsl(222_30%_18%_/_0.1)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8"
          >
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm text-muted-foreground">Powered by Polygon Blockchain</span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
          >
            Verify Skills.{" "}
            <span className="text-gradient">Build Trust.</span>
            <br />
            Own Your Future.
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            Blockchain-verified credentials and AI-powered reputation scoring. 
            Immutable proof of your skills, trusted by employers worldwide.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Link to="/learner">
              <Button variant="gradient" size="xl">
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/employer">
              <Button variant="outline" size="xl">
                Verify Credentials
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-3 gap-8 max-w-2xl mx-auto"
          >
            {[
              { icon: Shield, label: "Credentials Issued", value: "50K+" },
              { icon: Award, label: "Verified Skills", value: "120K+" },
              { icon: Zap, label: "Institutions", value: "500+" },
            ].map((stat, index) => (
              <div key={stat.label} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-secondary mb-3">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
