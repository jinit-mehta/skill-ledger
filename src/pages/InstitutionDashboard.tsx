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
  XCircle,
} from "lucide-react";

// Mock data
const mockPendingIssuances = [
  {
    id: "1",
    learner: "0x1a2b...3c4d",
    course: "Full Stack Development",
    completedAt: "2 hours ago",
    score: 92,
    status: "pending",
  },
  {
    id: "2",
    learner: "0x4e5f...6g7h",
    course: "Blockchain Fundamentals",
    completedAt: "5 hours ago",
    score: 88,
    status: "pending",
  },
  {
    id: "3",
    learner: "0x8i9j...0k1l",
    course: "Smart Contract Security",
    completedAt: "1 day ago",
    score: 95,
    status: "pending",
  },
];

const mockCourses = [
  {
    id: "1",
    name: "Full Stack Web Development",
    enrollments: 234,
    completions: 189,
    issuedCredentials: 156,
  },
  {
    id: "2",
    name: "Blockchain Fundamentals",
    enrollments: 156,
    completions: 98,
    issuedCredentials: 78,
  },
  {
    id: "3",
    name: "Smart Contract Security",
    enrollments: 89,
    completions: 45,
    issuedCredentials: 32,
  },
];

export default function InstitutionDashboard() {
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
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
          <Button variant="gradient">
            <Plus className="w-4 h-4" />
            Create Course
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
                title="Total Courses"
                value="12"
                change={2}
                icon={BookOpen}
                index={0}
              />
              <StatCard
                title="Active Learners"
                value="1,234"
                change={15}
                icon={Users}
                index={1}
              />
              <StatCard
                title="Issued Credentials"
                value="856"
                change={8}
                icon={Award}
                index={2}
              />
              <StatCard
                title="Pending Issuances"
                value="3"
                icon={Clock}
                index={3}
              />
            </>
          )}
        </div>

        {/* Pending Credential Issuances */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-2xl bg-card border border-border"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-lg font-semibold">
              Pending Credential Issuances
            </h2>
            <Button variant="outline" size="sm">
              Issue All
            </Button>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-secondary/30 animate-pulse"
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-secondary rounded" />
                      <div className="h-3 w-48 bg-secondary rounded" />
                    </div>
                    <div className="h-8 w-24 bg-secondary rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {mockPendingIssuances.map((issuance, index) => (
                <motion.div
                  key={issuance.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-xl bg-secondary/30 border border-border hover:border-primary/30 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-primary">
                          {issuance.learner}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-success/10 text-success text-xs">
                          Score: {issuance.score}%
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Completed <strong>{issuance.course}</strong> · {issuance.completedAt}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <XCircle className="w-4 h-4 text-destructive" />
                      </Button>
                      <Button variant="default" size="sm">
                        <CheckCircle className="w-4 h-4" />
                        Issue Credential
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Courses Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-2xl bg-card border border-border"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="font-display text-lg font-semibold">
              Your Courses
            </h2>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockCourses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-5 rounded-2xl bg-secondary/30 border border-border hover:border-primary/30 transition-all group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-info flex items-center justify-center mb-4">
                    <BookOpen className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h3 className="font-display font-semibold mb-3 group-hover:text-primary transition-colors">
                    {course.name}
                  </h3>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-lg font-bold text-primary">{course.enrollments}</p>
                      <p className="text-xs text-muted-foreground">Enrolled</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-success">{course.completions}</p>
                      <p className="text-xs text-muted-foreground">Completed</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-accent">{course.issuedCredentials}</p>
                      <p className="text-xs text-muted-foreground">Issued</p>
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
