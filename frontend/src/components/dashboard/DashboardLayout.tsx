import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/contexts/WalletContext";
import {
  LayoutDashboard,
  Award,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Wallet,
  GraduationCap,
  Building2,
  Briefcase,
  LogOut,
  Menu,
  X,
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  userType: "learner" | "institution" | "employer";
}

const sidebarLinks = {
  learner: [
    { name: "Overview", href: "/learner", icon: LayoutDashboard },
    { name: "Credentials", href: "/learner/credentials", icon: Award },
    { name: "Resume", href: "/learner/resume", icon: FileText },
    { name: "Settings", href: "/learner/settings", icon: Settings },
  ],
  institution: [
    { name: "Overview", href: "/institution", icon: LayoutDashboard },
    { name: "Issue Credentials", href: "/institution/issue", icon: Award },
    { name: "Courses", href: "/institution/courses", icon: GraduationCap },
    { name: "Settings", href: "/institution/settings", icon: Settings },
  ],
  employer: [
    { name: "Verify", href: "/employer", icon: LayoutDashboard },
    { name: "History", href: "/employer/history", icon: FileText },
    { name: "Settings", href: "/employer/settings", icon: Settings },
  ],
};

const userTypeIcons = {
  learner: GraduationCap,
  institution: Building2,
  employer: Briefcase,
};

export function DashboardLayout({ children, userType }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { address, isConnected, connect, isLoading } = useWallet();
  const links = sidebarLinks[userType];
  const UserIcon = userTypeIcons[userType];

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 80 : 260 }}
        className="hidden lg:flex flex-col border-r border-border bg-sidebar fixed h-full z-40"
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground font-display font-bold text-lg">S</span>
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="font-display font-semibold text-lg text-sidebar-foreground overflow-hidden whitespace-nowrap"
                >
                  SkillChain
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-sidebar-accent transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4 text-sidebar-foreground" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-sidebar-foreground" />
            )}
          </button>
        </div>

        {/* User Type Badge */}
        <div className="p-4">
          <div className={`flex items-center gap-3 p-3 rounded-xl bg-sidebar-accent ${collapsed ? "justify-center" : ""}`}>
            <UserIcon className="w-5 h-5 text-sidebar-primary flex-shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-sm font-medium text-sidebar-foreground capitalize"
                >
                  {userType} Dashboard
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-1">
          {links.map((link) => {
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.name}
                to={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-glow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
                  } ${collapsed ? "justify-center" : ""}`}
              >
                <link.icon className="w-5 h-5 flex-shrink-0" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-sm font-medium"
                    >
                      {link.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>

        {/* Wallet */}
        <div className="p-4 border-t border-sidebar-border">
          {isConnected && address ? (
            <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
              <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                <Wallet className="w-5 h-5 text-primary-foreground" />
              </div>
              <AnimatePresence>
                {!collapsed && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 min-w-0"
                  >
                    <p className="text-sm font-medium text-sidebar-foreground truncate">
                      Connected
                    </p>
                    <p className="text-xs text-muted-foreground font-mono truncate">
                      {formatAddress(address)}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Button
              onClick={connect}
              disabled={isLoading}
              className="w-full"
              size="sm"
            >
              {isLoading ? "Connecting..." : "Connect Wallet"}
            </Button>
          )}
        </div>
      </motion.aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 glass z-40 flex items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
            <span className="text-primary-foreground font-display font-bold text-lg">S</span>
          </div>
          <span className="font-display font-semibold text-lg">SkillChain</span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg hover:bg-secondary transition-colors"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-[280px] bg-sidebar border-r border-sidebar-border z-50"
            >
              {/* Same content as desktop sidebar */}
              <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
                <Link to="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
                  <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                    <span className="text-primary-foreground font-display font-bold text-lg">S</span>
                  </div>
                  <span className="font-display font-semibold text-lg text-sidebar-foreground">
                    SkillChain
                  </span>
                </Link>
              </div>
              <nav className="p-4 space-y-1">
                {links.map((link) => {
                  const isActive = location.pathname === link.href;
                  return (
                    <Link
                      key={link.name}
                      to={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent"
                        }`}
                    >
                      <link.icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{link.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main
        className={`flex-1 min-h-screen pt-16 lg:pt-0 transition-all ${collapsed ? "lg:ml-20" : "lg:ml-[260px]"
          }`}
      >
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
