import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  FilePlus2,
  Users,
  BarChart3,
  ShieldAlert,
  BrainCircuit,
  Settings,
  Landmark,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "New Application", url: "/new-application", icon: FilePlus2 },
  { title: "Applicants", url: "/applicants", icon: Users },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Fraud Monitor", url: "/fraud-monitor", icon: ShieldAlert },
  { title: "AI Decision", url: "/ai-decision", icon: BrainCircuit },
  { title: "Settings", url: "/settings", icon: Settings },
] as const;

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  return (
    <Sidebar collapsible="icon" className="border-sidebar-border">
      <SidebarHeader className="px-3 py-4">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl gradient-brand text-primary-foreground shadow-soft">
            <Landmark className="size-4.5" />
          </span>
          {!collapsed && (
            <div className="min-w-0">
              <p className="font-display truncate text-sm leading-tight font-bold">AI Underwriting</p>
              <p className="truncate text-[11px] text-muted-foreground">Dynamic Loan System</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active = pathname === item.url || pathname.startsWith(`${item.url}/`);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                      <Link to={item.url} className="flex items-center gap-2.5">
                        <item.icon className="size-4 shrink-0" />
                        <span className="truncate">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        {!collapsed && (
          <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/60 p-3">
            <p className="text-xs font-semibold">Model v4.2 · Live</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Gradient boosting ensemble with alternative-data enrichment.
            </p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}