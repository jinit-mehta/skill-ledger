import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Menu, X, Wallet, ChevronDown } from "lucide-react";

const navLinks = [
  { name: "Features", href: "/#features" },
  { name: "How it Works", href: "/#how-it-works" },
  { name: "For Institutions", href: "/institution" },
  { name: "For Employers", href: "/employer" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const location = useLocation();

  const handleConnectWallet = () => {
    setWalletConnected(!walletConnected);
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 glass"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <span className="text-primary-foreground font-display font-bold text-lg">S</span>
            </div>
            <span className="font-display font-semibold text-lg text-foreground">
              SkillChain
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Wallet Button */}
          <div className="hidden md:flex items-center gap-4">
            {walletConnected ? (
              <Button variant="glass" size="sm" onClick={handleConnectWallet}>
                <Wallet className="w-4 h-4" />
                <span className="font-mono text-xs">0x1a2b...3c4d</span>
                <ChevronDown className="w-3 h-3" />
              </Button>
            ) : (
              <Button variant="gradient" size="sm" onClick={handleConnectWallet}>
                <Wallet className="w-4 h-4" />
                Connect Wallet
              </Button>
            )}
            <Link to="/learner">
              <Button variant="outline" size="sm">Dashboard</Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t border-border"
          >
            <div className="container mx-auto px-4 py-4 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="block text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-border space-y-2">
                <Button variant="gradient" className="w-full" onClick={handleConnectWallet}>
                  <Wallet className="w-4 h-4" />
                  {walletConnected ? "0x1a2b...3c4d" : "Connect Wallet"}
                </Button>
                <Link to="/learner" className="block">
                  <Button variant="outline" className="w-full">Dashboard</Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
