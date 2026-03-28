import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Clock, Shield, AlertTriangle, User } from "lucide-react";

export default function EmployerHistory() {
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem("employer_history");
    if (raw) {
      setHistory(JSON.parse(raw));
    }
  }, []);

  return (
    <DashboardLayout userType="employer">
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold mb-1">
            Verification History
          </h1>
          <p className="text-muted-foreground">
            A local log of all candidates you've verified.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border overflow-x-auto">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
              <Clock className="w-12 h-12 text-muted-foreground/50" />
              <div className="text-muted-foreground">No verification history found.</div>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-xs uppercase text-muted-foreground">
                  <th className="pb-3 font-semibold w-12">#</th>
                  <th className="pb-3 font-semibold">Candidate Wallet</th>
                  <th className="pb-3 font-semibold">Score</th>
                  <th className="pb-3 font-semibold">Risk Level</th>
                  <th className="pb-3 font-semibold text-right">Verified At</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {history.map((entry, idx) => (
                  <tr key={idx} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                    <td className="py-4 text-muted-foreground">{idx + 1}</td>
                    <td className="py-4 font-mono text-primary flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      {entry.address}
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-primary" />
                        <span className="font-bold">{entry.score}</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
                        ${entry.risk === 'High' ? 'bg-destructive/10 text-destructive' :
                          entry.risk === 'Medium' ? 'bg-warning/10 text-warning' :
                          'bg-success/10 text-success'}`}>
                        {entry.risk === 'High' && <AlertTriangle className="w-3 h-3" />}
                        {entry.risk}
                      </div>
                    </td>
                    <td className="py-4 text-right text-muted-foreground">
                      {new Date(entry.verifiedAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
