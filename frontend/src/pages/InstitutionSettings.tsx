import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Bell, Shield, Building } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";

export default function InstitutionSettings() {
  const { address } = useWallet();

  return (
    <DashboardLayout userType="institution">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold mb-1">
            Institution Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your educational institution details and API keys.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 text-primary font-medium transition-colors text-left">
              <Building className="w-4 h-4" />
              Institution Info
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors text-left">
              <Bell className="w-4 h-4" />
              Notifications
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors text-left">
              <Shield className="w-4 h-4" />
              Security
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors text-left">
              <Settings className="w-4 h-4" />
              Integration
            </button>
          </div>

          <div className="md:col-span-2 space-y-6">
            <div className="p-6 rounded-2xl bg-card border border-border">
              <h2 className="font-display text-xl font-bold mb-6">Institution Info</h2>
              
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Institution Name</Label>
                    <Input id="name" defaultValue="Global Tech University" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="id">Registration ID</Label>
                    <Input id="id" defaultValue="EDU-89240" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wallet">Issuer Wallet Address</Label>
                  <Input id="wallet" value={address || "Not connected"} disabled className="bg-secondary/50 font-mono text-sm" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact">Admin Email</Label>
                  <Input id="contact" type="email" defaultValue="admin@gtu.edu" />
                </div>

                <div className="pt-4 flex justify-end">
                  <Button variant="gradient" onClick={() => alert("Settings saved successfully!")}>Save Changes</Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
