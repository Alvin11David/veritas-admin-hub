import {
  LayoutDashboard,
  Newspaper,
  BookOpen,
  Users,
  Calendar,
  Image,
  HelpCircle,
  Link,
  FlaskConical,
  Award,
  DollarSign,
  MessageSquare,
  FileText,
  Mail,
  Bell,
  Settings,
  GraduationCap,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAppSettings } from "@/lib/app-settings";

const mainItems = [{ title: "Dashboard", url: "/", icon: LayoutDashboard }];

const contentItems = [
  { title: "News & Articles", url: "/news", icon: Newspaper },
  { title: "Courses & Programs", url: "/courses", icon: BookOpen },
  { title: "Faculty", url: "/faculty", icon: Users },
  { title: "Events", url: "/events", icon: Calendar },
  { title: "Gallery", url: "/gallery", icon: Image },
  { title: "FAQs", url: "/faqs", icon: HelpCircle },
  { title: "Programs", url: "/programs", icon: GraduationCap },
  { title: "Quick Links", url: "/quick-links", icon: Link },
  { title: "Research", url: "/research", icon: FlaskConical },
  { title: "Alumni", url: "/alumni", icon: Award },
  { title: "Scholarships", url: "/scholarships", icon: DollarSign },
  { title: "Student Stories", url: "/student-stories", icon: MessageSquare },
  { title: "Legal Pages", url: "/legal", icon: FileText },
];

const systemItems = [
  { title: "Submissions", url: "/submissions", icon: Mail },
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "Settings", url: "/settings", icon: Settings },
];

function SidebarSection({
  label,
  items,
}: {
  label: string;
  items: typeof mainItems;
}) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <SidebarGroup>
      {!collapsed && (
        <SidebarGroupLabel className="text-muted-foreground/60 text-xs uppercase tracking-wider">
          {label}
        </SidebarGroupLabel>
      )}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <NavLink
                  to={item.url}
                  end={item.url === "/"}
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                  activeClassName="bg-sidebar-accent text-primary font-medium"
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span className="truncate">{item.title}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { settings } = useAppSettings();
  const softwareName = settings.softwareName;
  const softwareInitial = softwareName.charAt(0).toUpperCase() || "A";

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <div className="p-4 flex items-center gap-3 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <span className="text-primary-foreground font-bold text-sm">{softwareInitial}</span>
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <h2 className="font-semibold text-sm text-sidebar-foreground truncate">
              {softwareName}
            </h2>
            <p className="text-xs text-muted-foreground">Admin Panel</p>
          </div>
        )}
      </div>
      <SidebarContent className="py-2">
        <SidebarSection label="Overview" items={mainItems} />
        <SidebarSection label="Content" items={contentItems} />
        <SidebarSection label="System" items={systemItems} />
      </SidebarContent>
    </Sidebar>
  );
}
