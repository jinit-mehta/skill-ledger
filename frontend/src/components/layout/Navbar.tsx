import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Menu, X, Wallet, ChevronDown } from "lucide-react";
import { connectWallet } from "@/lib/wallet";
import { getToken, clearToken } from "@/lib/auth";

// --- FIX: Import from your local frontend lib, NOT backend ---
import { siweLogin } from "../../lib/siwe"; 

const navLinks = [
  { name: "Features", href: "/#features" },
  { name: "How it Works", href: "/#how-it-works" },
  { name: "For Institutions", href: "/institution" },
  { name: "For Employers", href: "/employer" },
];

function shortAddr(a: string) {
  return `${a.slice(0, 6)}...${a.slice(-4)}`;
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const authed = useMemo(() => Boolean(getToken()), []);

  const handleConnectWallet = async () => {
    try {
      setBusy(true);
      const { address, chainId } = await connectWallet();
      setAddress(address);

      // This now calls the FRONTEND helper, which fetches from the API
      await siweLogin(address, chainId);
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Wallet/SIWE error");
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = () => {
    clearToken();
    setAddress(null);
    window.location.reload();
  };

  return (
    <motion.nav initial={{ y: -100 }} animate={{ y: 0 }} className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <span className="text-primary-foreground font-display font-bold text-lg">S</span>
            </div>
            <span className="font-display font-semibold text-lg text-foreground">SkillChain</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link key={link.name} to={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {link.name}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {address && authed ? (
              <Button variant="glass" size="sm" onClick={handleLogout}>
                <Wallet className="w-4 h-4" />
                <span className="font-mono text-xs">{shortAddr(address)}</span>
                <ChevronDown className="w-3 h-3" />
              </Button>
            ) : (
              <Button variant="gradient" size="sm" onClick={handleConnectWallet} disabled={busy}>
                <Wallet className="w-4 h-4" />
                {busy ? "Connecting..." : "Connect Wallet"}
              </Button>
            )}

            <Link to="/learner">
              <Button variant="outline" size="sm">Dashboard</Button>
            </Link>
          </div>

          <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

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
                <Button variant="gradient" className="w-full" onClick={handleConnectWallet} disabled={busy}>
                  <Wallet className="w-4 h-4" />
                  {busy ? "Connecting..." : address ? shortAddr(address) : "Connect Wallet"}
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