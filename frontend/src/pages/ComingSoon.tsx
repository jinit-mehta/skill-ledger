import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { motion } from "framer-motion";

interface ComingSoonProps {
    title: string;
    description?: string;
    userType: "learner" | "institution" | "employer";
}

export default function ComingSoon({ title, description, userType }: ComingSoonProps) {
    return (
        <DashboardLayout userType={userType}>
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md space-y-4"
                >
                    <div className="w-16 h-16 bg-secondary/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <span className="text-3xl">🚧</span>
                    </div>
                    <h1 className="text-2xl font-bold font-display">{title}</h1>
                    <p className="text-muted-foreground">
                        {description || "This feature is currently under development. Check back soon!"}
                    </p>
                </motion.div>
            </div>
        </DashboardLayout>
    );
}
