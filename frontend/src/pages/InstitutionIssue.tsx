import { useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWallet } from "@/contexts/WalletContext";
import { prepareCredentialIssuance } from "@/lib/backend";
import { getSigner } from "@/lib/wallet";
import { ethers } from "ethers";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export default function InstitutionIssue() {
    const { isConnected } = useWallet();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        learner: "",
        credentialHash: "", // In real app, might be computed from file
        level: "1",
        category: "0",
    });

    const generateRandomHash = () => {
        // Helper for demo purposes
        const random = ethers.hexlify(ethers.randomBytes(32));
        setFormData((prev) => ({ ...prev, credentialHash: random }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isConnected) {
            setError("Please connect wallet first");
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setSuccess(null);

            // 1. Get calldata from backend
            const txData = await prepareCredentialIssuance({
                learner: formData.learner,
                credentialHash: formData.credentialHash,
                level: parseInt(formData.level),
                category: parseInt(formData.category),
            });

            // 2. Sign and send transaction
            const signer = await getSigner();
            const tx = await signer.sendTransaction({
                to: txData.to,
                data: txData.data,
            });

            console.log("Tx sent:", tx.hash);

            // 3. Wait for confirmation
            await tx.wait();

            setSuccess(`Credential issued successfully! Tx: ${tx.hash.slice(0, 10)}...`);
            setFormData((prev) => ({ ...prev, credentialHash: "" })); // Reset hash
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to issue credential");
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout userType="institution">
            <div className="max-w-2xl mx-auto space-y-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="font-display text-2xl font-bold mb-2">
                        Issue Credential
                    </h1>
                    <p className="text-muted-foreground mb-8">
                        Issue a soulbound credential to a learner's wallet address.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6 bg-card p-6 rounded-2xl border border-border">
                        <div className="space-y-2">
                            <Label htmlFor="learner">Learner Address</Label>
                            <Input
                                id="learner"
                                placeholder="0x..."
                                value={formData.learner}
                                onChange={(e) => setFormData({ ...formData, learner: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="hash">Credential Hash (SHA-256)</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="hash"
                                    placeholder="0x..."
                                    value={formData.credentialHash}
                                    onChange={(e) => setFormData({ ...formData, credentialHash: e.target.value })}
                                    required
                                />
                                <Button type="button" variant="outline" onClick={generateRandomHash}>
                                    Generate
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                In a real scenario, this would be the hash of the credential metadata or file.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="level">Skill Level (1-100)</Label>
                                <Input
                                    id="level"
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={formData.level}
                                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category">Category ID</Label>
                                <Input
                                    id="category"
                                    type="number"
                                    min="0"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-destructive/10 text-destructive rounded-lg flex items-center gap-2 text-sm">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="p-3 bg-success/10 text-success rounded-lg flex items-center gap-2 text-sm">
                                <CheckCircle className="w-4 h-4" />
                                {success}
                            </div>
                        )}

                        <Button type="submit" className="w-full" disabled={loading || !isConnected}>
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Issuing...
                                </>
                            ) : (
                                "Issue Credential"
                            )}
                        </Button>
                    </form>
                </motion.div>
            </div>
        </DashboardLayout>
    );
}
