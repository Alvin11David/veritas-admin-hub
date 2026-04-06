import {
  Newspaper, BookOpen, Users, Calendar, Image, HelpCircle,
  GraduationCap, Link, FlaskConical, Award, DollarSign,
  MessageSquare, FileText, Mail, LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Newspaper, BookOpen, Users, Calendar, Image, HelpCircle,
  GraduationCap, Link, FlaskConical, Award, DollarSign,
  MessageSquare, FileText, Mail,
};

interface StatCardProps {
  label: string;
  count: number;
  icon: string;
}

export function StatCard({ label, count, icon }: StatCardProps) {
  const Icon = iconMap[icon] || FileText;

  return (
    <div className="group rounded-lg border border-border bg-card p-4 card-hover cursor-default">
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 rounded-md bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </div>
      <p className="text-2xl font-bold text-foreground">{count}</p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
    </div>
  );
}
