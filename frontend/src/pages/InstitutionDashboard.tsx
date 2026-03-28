import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { StatSkeleton, CardSkeleton } from "@/components/dashboard/Skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Award,
  Users,
  BookOpen,
  Plus,
  Search,
  CheckCircle,
  Clock,
  ExternalLink,
} from "lucide-react";
import { getInstitutionStats, getInstitutionRecent } from "@/lib/backend";
import { CATEGORIES } from "@/lib/constants";

export default function InstitutionDashboard() {
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState<any>(null);
  const [recentIssuances, setRecentIssuances] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [s, r] = await Promise.all([getInstitutionStats(), getInstitutionRecent()]);
        setStats(s);
        setRecentIssuances(r.recents || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <DashboardLayout userType="institution">
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold mb-1">
              Institution Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage courses and issue blockchain credentials
            </p>
          </div>
          <Button variant="gradient" onClick={() => window.location.href = "/institution/issue"}>
            <Plus className="w-4 h-4" />
            Issue Credential
          </Button>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            <>
              <StatSkeleton /><StatSkeleton /><StatSkeleton /><StatSkeleton />
            </>
          ) : (
            <>
              <StatCard
                title="Total Issued"
                value={stats?.issuedCount || 0}
                change={0}
                icon={Award}
                index={0}
              />
              <StatCard
                title="Active Learners"
                value={stats?.activeLearners || 0}
                change={0}
                icon={Users}
                index={1}
              />
              <StatCard
                title="Pending Tasks"
                value={stats?.pendingIssuances || 0}
                change={0}
                icon={Clock}
                index={2}
              />
              <StatCard
                title="Total Courses"
                value={stats?.totalCourses || 5}
                icon={BookOpen}
                index={3}
              />
            </>
          )}
        </div>

        {/* Recent Credential Issuances */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-2xl bg-card border border-border"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-lg font-semibold">
              Recent Issuances
            </h2>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2].map(i => <div key={i} className="h-16 bg-secondary/30 rounded-xl animate-pulse" />)}
            </div>
          ) : recentIssuances.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No credentials issued yet.</p>
          ) : (
            <div className="space-y-4">
              {recentIssuances.map((issuance, index) => (
                <motion.div
                  key={issuance.token_id || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-xl bg-secondary/30 border border-border"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-primary">
                          {issuance.learner.slice(0, 10)}...{issuance.learner.slice(-8)}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-success/10 text-success text-xs">
                          Issued
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Issued <strong>Credential #{issuance.token_id}</strong> · {new Date(Number(issuance.issued_at) * 1000).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={`/employer?q=${issuance.learner}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs flex items-center gap-1 text-primary hover:underline"
                      >
                        View Learner <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
