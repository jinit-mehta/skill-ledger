import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ReputationGauge } from "@/components/dashboard/ReputationGauge";
import { SkillBreakdown } from "@/components/dashboard/SkillBreakdown";
import { CredentialTimeline } from "@/components/dashboard/CredentialTimeline";
import { GaugeSkeleton } from "@/components/dashboard/Skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Upload,
  Shield,
  AlertTriangle,
  CheckCircle,
  FileText,
  ExternalLink,
  Wallet,
} from "lucide-react";

// Mock verification result
const mockVerificationResult = {
  walletAddress: "0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t",
  name: "Alex Johnson",
  overallScore: 82,
  fraudRisk: "Low",
  lastUpdated: "2 hours ago",
  skills: [
    { name: "JavaScript/TypeScript", score: 92, weight: 25 },
    { name: "React & Frontend", score: 88, weight: 20 },
    { name: "Node.js & Backend", score: 78, weight: 20 },
    { name: "Blockchain Development", score: 75, weight: 15 },
    { name: "System Architecture", score: 70, weight: 20 },
  ],
  credentials: [
    { id: "1", title: "AWS Solutions Architect", issuer: "Amazon Web Services", date: "Jan 2025", type: "certificate" as const },
    { id: "2", title: "Full Stack Development", issuer: "Tech Academy", date: "Dec 2024", type: "course" as const },
    { id: "3", title: "Solidity Developer", issuer: "Ethereum Foundation", date: "Nov 2024", type: "skill" as const },
    { id: "4", title: "React Advanced Patterns", issuer: "Frontend Masters", date: "Oct 2024", type: "course" as const },
  ],
  scoreExplanation: [
    { factor: "Verified Credentials", impact: "+25", description: "12 blockchain-verified credentials from trusted institutions" },
    { factor: "Skill Consistency", impact: "+18", description: "High consistency between claimed skills and credentials" },
    { factor: "Timeline Verification", impact: "+15", description: "No gaps or inconsistencies in career timeline" },
    { factor: "Institution Trust Score", impact: "+12", description: "Credentials from high-reputation institutions" },
    { factor: "Contribution History", impact: "+8", description: "Active contributions to verified projects" },
    { factor: "Recency Bonus", impact: "+4", description: "Recent skill updates and certifications" },
  ],
};

export default function EmployerDashboard() {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [verificationResult, setVerificationResult] = useState<typeof mockVerificationResult | null>(null);

  const handleVerify = () => {
    if (!searchQuery) return;
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setVerificationResult(mockVerificationResult);
      setLoading(false);
    }, 2000);
  };

  return (
    <DashboardLayout userType="employer">
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-display text-2xl sm:text-3xl font-bold mb-1">
            Credential Verification
          </h1>
          <p className="text-muted-foreground">
            Instantly verify candidate credentials with blockchain proof
          </p>
        </motion.div>

        {/* Search/Verify Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-8 rounded-2xl bg-card border border-border"
        >
          <h2 className="font-display text-lg font-semibold mb-6">
            Verify a Candidate
          </h2>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Wallet Address Input */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50 border border-border">
                <Wallet className="w-5 h-5 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium mb-1">Enter Wallet Address</p>
                  <Input
                    placeholder="0x1a2b3c4d..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-0 p-0 h-auto focus-visible:ring-0"
                  />
                </div>
              </div>
              <Button
                variant="gradient"
                className="w-full"
                onClick={handleVerify}
                disabled={loading || !searchQuery}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Verify Credentials
                  </>
                )}
              </Button>
            </div>

            {/* Resume Upload */}
            <div className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer">
              <Upload className="w-10 h-10 text-muted-foreground mb-3" />
              <p className="text-sm font-medium mb-1">Upload Resume PDF</p>
              <p className="text-xs text-muted-foreground text-center">
                We'll extract the wallet address and verify credentials automatically
              </p>
            </div>
          </div>
        </motion.div>

        {/* Verification Results */}
        {(loading || verificationResult) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Summary Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-card border border-border">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground">Overall Score</span>
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                {loading ? (
                  <div className="h-8 w-16 bg-secondary rounded animate-pulse" />
                ) : (
                  <p className="font-display text-3xl font-bold text-primary">
                    {verificationResult?.overallScore}
                  </p>
                )}
              </div>

              <div className="p-5 rounded-2xl bg-card border border-border">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground">Fraud Risk</span>
                  <AlertTriangle className="w-5 h-5 text-success" />
                </div>
                {loading ? (
                  <div className="h-8 w-16 bg-secondary rounded animate-pulse" />
                ) : (
                  <p className="font-display text-3xl font-bold text-success">
                    {verificationResult?.fraudRisk}
                  </p>
                )}
              </div>

              <div className="p-5 rounded-2xl bg-card border border-border">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground">Verified Credentials</span>
                  <CheckCircle className="w-5 h-5 text-primary" />
                </div>
                {loading ? (
                  <div className="h-8 w-16 bg-secondary rounded animate-pulse" />
                ) : (
                  <p className="font-display text-3xl font-bold">
                    {verificationResult?.credentials.length}
                  </p>
                )}
              </div>

              <div className="p-5 rounded-2xl bg-card border border-border">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground">Last Updated</span>
                  <FileText className="w-5 h-5 text-muted-foreground" />
                </div>
                {loading ? (
                  <div className="h-8 w-24 bg-secondary rounded animate-pulse" />
                ) : (
                  <p className="font-display text-lg font-bold">
                    {verificationResult?.lastUpdated}
                  </p>
                )}
              </div>
            </div>

            {/* Detailed Results */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Score Gauge */}
              <div className="p-6 rounded-2xl bg-card border border-border">
                <h3 className="font-display text-lg font-semibold mb-6">
                  Reputation Score
                </h3>
                <div className="flex justify-center">
                  {loading ? (
                    <GaugeSkeleton />
                  ) : (
                    <ReputationGauge score={verificationResult?.overallScore || 0} />
                  )}
                </div>
              </div>

              {/* Score Explanation */}
              <div className="lg:col-span-2 p-6 rounded-2xl bg-card border border-border">
                <h3 className="font-display text-lg font-semibold mb-6">
                  Score Explanation
                </h3>
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-secondary/30">
                        <div className="h-4 w-40 bg-secondary rounded animate-pulse" />
                        <div className="h-4 w-12 bg-secondary rounded animate-pulse" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {verificationResult?.scoreExplanation.map((item, index) => (
                      <motion.div
                        key={item.factor}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                      >
                        <div>
                          <p className="text-sm font-medium">{item.factor}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                        <span className="text-sm font-bold text-success">
                          {item.impact}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Skills & Timeline */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Skills */}
              <div className="p-6 rounded-2xl bg-card border border-border">
                <h3 className="font-display text-lg font-semibold mb-6">
                  Skill Breakdown
                </h3>
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
                  <SkillBreakdown skills={verificationResult?.skills || []} />
                )}
              </div>

              {/* Credential Timeline */}
              <div className="p-6 rounded-2xl bg-card border border-border">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-display text-lg font-semibold">
                    Credential Timeline
                  </h3>
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="w-4 h-4" />
                    View on Chain
                  </Button>
                </div>
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
                  <CredentialTimeline items={verificationResult?.credentials || []} />
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && !verificationResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center mb-6">
              <Search className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="font-display text-xl font-semibold mb-2">
              Enter a wallet address to verify
            </h3>
            <p className="text-muted-foreground max-w-md">
              Input a candidate's wallet address or upload their resume to instantly 
              verify their blockchain credentials and get an explainable reputation score.
            </p>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
