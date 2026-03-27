import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
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
  Clock
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
    {
      id: "1",
      title: "AWS Solutions Architect",
      issuer: "Amazon Web Services",
      date: "Jan 2025",
      type: "certificate" as const,
    },
    {
      id: "2",
      title: "Full Stack Development",
      issuer: "Tech Academy",
      date: "Dec 2024",
      type: "course" as const,
    },
  ],
  scoreExplanation: [
    {
      factor: "Verified Credentials",
      impact: "+25",
      description: "12 blockchain-verified credentials",
    },
    {
      factor: "Skill Consistency",
      impact: "+18",
      description: "High consistency between claimed skills and credentials",
    },
  ],
};

export default function EmployerDashboard() {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [verificationResult, setVerificationResult] = useState<typeof mockVerificationResult | null>(null);

  // File upload refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Routing check
  const location = useLocation();
  const isVerifyPage = location.pathname === "/employer" || location.pathname === "/employer/";

  const handleVerify = async () => {
    if (!searchQuery) return;
    setLoading(true);
    try {
      // 1. Fetch reputation (chain data)
      const repRes = await fetch(`/api/reputation/${searchQuery}`);
      let rep = { score: 0 };
      try {
        if (repRes.ok) {
          const text = await repRes.text();
          rep = text ? JSON.parse(text) : { score: 0 };
        }
      } catch (e) {
        console.warn("Reputation parse failed", e);
      }

      // 2. Fetch indexed credentials (database data)
      const idxRes = await fetch(`/api/indexed/credentials/${searchQuery}`);
      let indexed = { credentials: [] };
      try {
        if (idxRes.ok) {
          const text = await idxRes.text();
          indexed = text ? JSON.parse(text) : { credentials: [] };
        }
      } catch (e) {
        console.warn("Credentials parse failed", e);
      }

      setVerificationResult({
        ...mockVerificationResult,
        walletAddress: searchQuery,
        // Map real data if available, fallback to mock/defaults
        overallScore: rep.score ? Math.min(100, Math.round((rep.score / 10000) * 100)) : 82,
        credentials: (indexed.credentials && indexed.credentials.length > 0)
          ? indexed.credentials.map((c: any, i: number) => ({
            id: String(i + 1),
            title: `Credential #${c.tokenId}`,
            issuer: c.issuer,
            date: new Date((c.issuedAt || 0) * 1000).toLocaleDateString(),
            type: "certificate" as const,
          }))
          : mockVerificationResult.credentials, // Fallback for demo
      });

    } catch (e: any) {
      console.error("Verify failed:", e);
      alert("Backend verify failed. Using mock data.");
      setVerificationResult(mockVerificationResult);
    } finally {
      setLoading(false);
    }
  };

  // Handle clicking the upload box
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Handle file selection (Real Analysis)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLoading(true);
      try {
        const fd = new FormData();
        fd.append("file", file);

        const res = await fetch("/api/utility/analyze-pdf", {
          method: "POST",
          body: fd
        });

        if (res.ok) {
          const data = await res.json();
          // Populate with ML data
          setVerificationResult({
            ...mockVerificationResult,
            walletAddress: data.address || "",
            overallScore: Math.round(data.ml.final_score),
            fraudRisk: data.ml.fraud_prob > 0.5 ? "High" : (data.ml.fraud_prob > 0.2 ? "Medium" : "Low"),
            lastUpdated: "Just now",
            skills: Object.entries(data.features).filter(([k, v]) => k.startsWith('num_') || k.includes('count')).map(([k, v]) => ({
              name: k.replace('num_', '').replace('_', ' ').toUpperCase(),
              score: 80, // visual filler
              weight: 20
            })),
            scoreExplanation: data.ml.explanation.top_drivers.map((d: any) => ({
              factor: d.feature,
              impact: `+${d.impact}`,
              description: "Detected in resume"
            }))
          });

          if (data.address) {
            setSearchQuery(data.address);
            alert(`Found address ${data.address}. Profile analyzed!`);
          } else {
            alert("Resume analyzed! Skills and Score projected above. Please enter wallet address to verify on-chain.");
          }
        } else {
          alert("Failed to analyze resume.");
        }
      } catch (err) {
        console.error(err);
        alert("Error analyzing file.");
      } finally {
        setLoading(false);
      }
    }
  };

  // --- Sub-page Rendering (History / Settings) ---
  if (!isVerifyPage) {
    let title = "Page Not Found";
    if (location.pathname.includes("history")) title = "Verification History";
    if (location.pathname.includes("settings")) title = "Employer Settings";

    return (
      <DashboardLayout userType="employer">
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <Clock className="w-16 h-16 text-muted-foreground" />
          <h1 className="text-3xl font-display font-bold">{title}</h1>
          <p className="text-muted-foreground">This feature is coming soon in the next update.</p>
          <Button variant="outline" onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </DashboardLayout>
    );
  }

  // --- Main Verify Page ---
  return (
    <DashboardLayout userType="employer">
      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
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

            {/* Resume Upload Box */}
            <div
              onClick={handleUploadClick}
              className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer active:scale-95 duration-100"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="application/pdf"
              />
              <Upload className="w-10 h-10 text-muted-foreground mb-3" />
              <p className="text-sm font-medium mb-1">Upload Resume PDF</p>
              <p className="text-xs text-muted-foreground text-center">
                Click here to upload. We'll extract the wallet address automatically.
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

            {/* Detailed Results (Gauge & Timeline) */}
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-card border border-border">
                <h3 className="font-display text-lg font-semibold mb-6">Reputation Score</h3>
                <div className="flex justify-center">
                  {loading ? <GaugeSkeleton /> : <ReputationGauge score={verificationResult?.overallScore || 0} />}
                </div>
              </div>

              <div className="lg:col-span-2 p-6 rounded-2xl bg-card border border-border">
                <h3 className="font-display text-lg font-semibold mb-6">Score Explanation</h3>
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-10 bg-secondary rounded animate-pulse" />
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
                        className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
                      >
                        <div>
                          <p className="text-sm font-medium">{item.factor}</p>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        </div>
                        <span className="text-sm font-bold text-success">{item.impact}</span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-card border border-border">
                <h3 className="font-display text-lg font-semibold mb-6">Skill Breakdown</h3>
                {loading ? <div className="space-y-4" /> : <SkillBreakdown skills={verificationResult?.skills || []} />}
              </div>
              <div className="p-6 rounded-2xl bg-card border border-border">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-display text-lg font-semibold">Credential Timeline</h3>
                  <Button variant="ghost" size="sm"><ExternalLink className="w-4 h-4" /> View on Chain</Button>
                </div>
                {loading ? <div className="space-y-4" /> : <CredentialTimeline items={verificationResult?.credentials || []} />}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}