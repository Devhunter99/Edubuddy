
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface DashboardCardProps {
    title: string;
    description: string;
    icon: LucideIcon;
    children?: React.ReactNode;
    className?: string;
    headerLink?: string;
}

export default function DashboardCard({ title, description, icon: Icon, children, className, headerLink }: DashboardCardProps) {
    
    const HeaderContent = () => (
        <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-lg">
                <Icon className="h-6 w-6 text-primary" />
            </div>
            <div>
                <CardTitle className="text-xl">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </div>
        </div>
    );

    return (
        <Card className={cn("shadow-md hover:shadow-primary/20 transition-shadow flex flex-col", className)}>
            <CardHeader>
                {headerLink ? (
                    <Link href={headerLink} className="hover:opacity-80 transition-opacity">
                        <HeaderContent />
                    </Link>
                ) : (
                    <HeaderContent />
                )}
            </CardHeader>
            {children && (
              <CardContent className="flex-grow flex flex-col pt-0">
                {children}
              </CardContent>
            )}
        </Card>
    )
}
