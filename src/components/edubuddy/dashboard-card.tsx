
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
    title: string;
    description: string;
    icon: LucideIcon;
    children?: React.ReactNode;
    className?: string;
}

export default function DashboardCard({ title, description, icon: Icon, children, className }: DashboardCardProps) {
    return (
        <Card className={cn("shadow-md hover:shadow-primary/20 transition-shadow", className)}>
            <CardHeader>
                <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                       <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-xl">{title}</CardTitle>
                        <CardDescription>{description}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            {children && (
              <CardContent>
                {children}
              </CardContent>
            )}
        </Card>
    )
}
