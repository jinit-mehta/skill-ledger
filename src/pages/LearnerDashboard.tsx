import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ReputationGauge } from "@/components/dashboard/ReputationGauge";
import { CredentialCard } from "@/components/dashboard/CredentialCard";
import { SkillBreakdown } from "@/components/dashboard/SkillBreakdown";
import { StatCard } from "@/components/dashboard/StatCard";
import { CredentialTimeline } from "@/components/dashboard/CredentialTimeline";
import { CardSkeleton, StatSkeleton, GaugeSkeleton } from "@/components/dashboard/Skeleton";
import { Award, Shield, FileText, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

// Mock data
const mockCredentials = [
  {
    title: "Full Stack Web Development",
    issuer: "Tech Academy",
    date: "Dec 2024",
    type: "certificate" as const,
    tokenId: "#0x1a2b...3c4d",
  },
  {
    title: "Smart Contract Development",
    issuer: "Blockchain Institute",
    date: "Nov 2024",
    type: "skill" as const,
    tokenId: "#0x4e5f...6g7h",
  },
  {
    title: "Machine Learning Fundamentals",
    issuer: "AI University",
    date: "Oct 2024",
    type: "course" as const,
    tokenId: "#0x8i9j...0k1l",
  },
];

const mockSkills = [
  { name: "JavaScript/TypeScript", score: 92, weight: 25 },
  { name: "React & Web Development", score: 88, weight: 20 },
  { name: "Blockchain & Smart Contracts", score: 75, weight: 20 },
  { name: "Python & ML", score: 70, weight: 15 },
  { name: "System Design", score: 65, weight: 20 },
];

const mockTimeline = [
  { id: "1", title: "AWS Solutions Architect", issuer: "Amazon Web Services", date: "Jan 2025", type: "certificate" as const },
  { id: "2", title: "React Advanced Patterns", issuer: "Frontend Masters", date: "Dec 2024", type: "course" as const },
  { id: "3", title: "Solidity Developer", issuer: "Ethereum Foundation", date: "Nov 2024", type: "skill" as const },
  { id: "4", title: "Data Structures & Algorithms", issuer: "Stanford Online", date: "Oct 2024", type: "course" as const },
];

export default function LearnerDashboard() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <DashboardLayout userType="learner">
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold mb-1">
              Welcome back, Alex
            </h1>
            <p className="text-muted-foreground">
              Your reputation is growing! Here's your overview.
            </p>
          </div>
          <Button variant="gradient">
            <FileText className="w-4 h-4" />
            Upload Resume
          </Button>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            <>
              <StatSkeleton />
              <StatSkeleton />
              <StatSkeleton />
              <StatSkeleton />
            </>
          ) : (
            <>
              <StatCard
                title="Total Credentials"
                value="12"
                change={8}
                icon={Award}
                index={0}
              />
              <StatCard
                title="Verified Skills"
                value="28"
                change={12}
                icon={Shield}
                index={1}
              />
              <StatCard
                title="Resume Score"
                value="85/100"
                change={5}
                icon={FileText}
                index={2}
              />
              <StatCard
                title="Profile Views"
                value="143"
                change={-3}
                icon={TrendingUp}
                index={3}
              />
            </>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Reputation Score */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-2xl bg-card border border-border"
          >
            <h2 className="font-display text-lg font-semibold mb-6">
              Reputation Score
            </h2>
            <div className="flex justify-center">
              {loading ? <GaugeSkeleton /> : <ReputationGauge score={78} />}
            </div>
          </motion.div>

          {/* Skill Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 p-6 rounded-2xl bg-card border border-border"
          >
            <h2 className="font-display text-lg font-semibold mb-6">
              Skill Breakdown
            </h2>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between">
                      <div className="h-4 w-32 bg-secondary rounded animate-pulse" />
                      <div className="h-4 w-16 bg-secondary rounded animate-pulse" />
                    </div>
                    <div className="h-2 bg-secondary rounded-full" />
                  </div>
                ))}
              </div>
            ) : (
              <SkillBreakdown skills={mockSkills} />
            )}
          </motion.div>
        </div>

        {/* Credentials Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-lg font-semibold">
              Recent Credentials
            </h2>
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              <>
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </>
            ) : (
              mockCredentials.map((credential, index) => (
                <CredentialCard key={credential.tokenId} {...credential} index={index} />
              ))
            )}
          </div>
        </motion.div>

        {/* Timeline Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-6 rounded-2xl bg-card border border-border"
        >
          <h2 className="font-display text-lg font-semibold mb-6">
            Credential Timeline
          </h2>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-4 pl-10">
                  <div className="flex-1 p-4 rounded-xl bg-secondary/50 animate-pulse">
                    <div className="h-4 w-3/4 bg-secondary rounded mb-2" />
                    <div className="h-3 w-1/2 bg-secondary rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <CredentialTimeline items={mockTimeline} />
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
