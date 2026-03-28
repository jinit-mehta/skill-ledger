import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ReputationGauge } from "@/components/dashboard/ReputationGauge";
import { CredentialTimeline } from "@/components/dashboard/CredentialTimeline";
import { StatCard } from "@/components/dashboard/StatCard";
import { StatSkeleton, GaugeSkeleton, CardSkeleton } from "@/components/dashboard/Skeleton";
import { Award, Shield, FileText, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

import { uploadResumePdf, scoreResume, getChainReputation, getMyCredentials } from "@/lib/backend";
import { useWallet } from "@/contexts/WalletContext";

export default function LearnerDashboard() {
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(false);
  const [repScore, setRepScore] = useState<number>(0);
  const [resumeFinal, setResumeFinal] = useState<number | null>(null);
  const [fraudProb, setFraudProb] = useState<number | null>(null);
  const [explanation, setExplanation] = useState<any>(null);
  const [features, setFeatures] = useState<any>(null);
  const [credentials, setCredentials] = useState<any[]>([]);
  const { address } = useWallet();

  const fileRef = useRef<HTMLInputElement | null>(null);

  // F2: Auto-load on-chain reputation and credentials on mount when wallet is connected
  useEffect(() => {
    if (!address) return;

    async function loadInitialData() {
      try {
        setInitLoading(true);
        const [rep, creds] = await Promise.allSettled([
          getChainReputation(address!),
          getMyCredentials(),
        ]);

        if (rep.status === "fulfilled") {
          setRepScore(rep.value.score ?? 0);
        }
        if (creds.status === "fulfilled") {
          setCredentials(creds.value.credentials ?? []);
        }
      } catch (e) {
        console.warn("Failed to load initial data:", e);
      } finally {
        setInitLoading(false);
      }
    }

    loadInitialData();
  }, [address]);

  const onPick = () => fileRef.current?.click();

  const onFile = async (f: File) => {
    try {
      setLoading(true);

      // upload
      const up = await uploadResumePdf(f);
      setFeatures(up.features);

      // score via ML
      const sc = await scoreResume(up.resumeId);
      setResumeFinal(sc.final_score);
      setFraudProb(sc.fraud_prob);
      setExplanation(sc.explanation); // B4: only set once

      // refresh on-chain rep for connected wallet
      if (address) {
        const rep = await getChainReputation(address);
        setRepScore(rep.score ?? 0);
      }
    } catch (e: any) {
      console.error(e);
      alert(e?.error || e?.message || "Upload/score failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout userType="learner">
      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold mb-1">
              Learner Dashboard
            </h1>
            <p className="text-muted-foreground">
              Upload your resume to get an explainable score, then collect on-chain credentials.
            </p>
          </div>

          <div>
            <input
              ref={fileRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void onFile(f);
              }}
            />
            <Button variant="gradient" onClick={onPick} disabled={loading}>
              <FileText className="w-4 h-4" />
              {loading ? "Processing..." : "Upload Resume"}
            </Button>
          </div>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading || initLoading ? (
            <>
              <StatSkeleton /><StatSkeleton /><StatSkeleton /><StatSkeleton />
            </>
          ) : (
            <>
              {/* B5: Real credential count from /me/credentials */}
              <StatCard title="Total Credentials" value={credentials.length} change={0} icon={Award} index={0} />
              <StatCard title="Fraud Probability" value={fraudProb == null ? "—" : `${Math.round(fraudProb * 100)}%`} change={0} icon={Shield} index={1} />
              <StatCard title="Resume Score" value={resumeFinal == null ? "—" : `${Math.round(resumeFinal)}/100`} change={0} icon={FileText} index={2} />
              <StatCard title="Profile Views" value="—" change={0} icon={TrendingUp} index={3} />
            </>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="p-6 rounded-2xl bg-card border border-border">
            <h2 className="font-display text-lg font-semibold mb-6">On-chain Reputation</h2>
            <div className="flex flex-col items-center justify-center gap-4">
              {loading || initLoading ? <GaugeSkeleton /> : <ReputationGauge score={repScore} maxScore={10000} />}

              {/* DEMO Helper: Self-Issue Credential */}
              {!initLoading && repScore === 0 && (
                <Button variant="outline" size="sm" onClick={() => window.location.href = "/institution/issue"}>
                  <Award className="w-4 h-4 mr-2" />
                  Boost Score (Demo)
                </Button>
              )}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="lg:col-span-2 space-y-6">

            {/* Top Drivers */}
            <div className="p-6 rounded-2xl bg-card border border-border">
              <h2 className="font-display text-lg font-semibold mb-6">ML Explanation (Top Drivers)</h2>
              {!explanation?.top_drivers ? (
                <p className="text-muted-foreground text-sm">Upload a resume to see an explainable score.</p>
              ) : (
                <div className="space-y-2">
                  {explanation.top_drivers.map((d: any) => (
                    <div key={d.feature} className="flex justify-between text-sm bg-secondary/30 p-3 rounded-lg">
                      <span className="font-medium">{d.feature}</span>
                      <span className="font-mono">{d.impact.toFixed(1)} pts</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Fraud Analysis */}
            <div className="p-6 rounded-2xl bg-card border border-border">
              <h2 className="font-display text-lg font-semibold mb-4">Fraud Analysis</h2>
              {!explanation?.fraud_indicators ? (
                <p className="text-muted-foreground text-sm">No analysis available.</p>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-3 rounded-lg border ${explanation.fraud_indicators.unrealistic_claims ? 'bg-red-500/10 border-red-500/30' : 'bg-green-500/10 border-green-500/30'}`}>
                    <p className="text-xs font-medium mb-1">Unrealistic Claims</p>
                    <p className="text-sm font-bold">{explanation.fraud_indicators.unrealistic_claims ? "Detected" : "Clean"}</p>
                  </div>
                  <div className={`p-3 rounded-lg border ${explanation.fraud_indicators.inconsistencies ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-green-500/10 border-green-500/30'}`}>
                    <p className="text-xs font-medium mb-1">Inconsistencies</p>
                    <p className="text-sm font-bold">{explanation.fraud_indicators.inconsistencies ? "Possible" : "None"}</p>
                  </div>
                  <div className={`p-3 rounded-lg border ${explanation.fraud_indicators.missing_data ? 'bg-orange-500/10 border-orange-500/30' : 'bg-green-500/10 border-green-500/30'}`}>
                    <p className="text-xs font-medium mb-1">Data Completeness</p>
                    <p className="text-sm font-bold">{explanation.fraud_indicators.missing_data ? "Missing Info" : "Good"}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Detected Skills */}
            <div className="p-6 rounded-2xl bg-card border border-border">
              <h2 className="font-display text-lg font-semibold mb-4">Detected Skills</h2>
              {!features?.detectedSkills || features.detectedSkills.length === 0 ? (
                <p className="text-muted-foreground text-sm">No specific skills detected from our list.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {features.detectedSkills.map((s: string) => (
                    <span key={s} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium capitalize">
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* F1: Real Credential Timeline */}
        {(initLoading || credentials.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-6 rounded-2xl bg-card border border-border"
          >
            <h2 className="font-display text-lg font-semibold mb-6">My On-chain Credentials</h2>
            {initLoading ? (
              <div className="space-y-3">
                {[1, 2].map(i => <div key={i} className="h-14 bg-secondary/30 rounded-xl animate-pulse" />)}
              </div>
            ) : (
              <CredentialTimeline
                items={credentials.map((c, i) => ({
                  id: String(i + 1),
                  title: `Credential #${c.token_id}`,
                  issuer: c.issuer,
                  date: new Date((c.issued_at || 0) * 1000).toLocaleDateString(),
                  type: "certificate" as const,
                }))}
              />
            )}
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}