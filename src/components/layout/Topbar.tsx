import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Bell, Moon, Search, Sun, LogOut, User, Settings as SettingsIcon } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTheme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";
import { initials } from "@/lib/format";

const notifications = [
  { title: "3 applications flagged for fraud", detail: "Duplicate device fingerprints detected", tone: "text-destructive" },
  { title: "Model v4.2 deployed", detail: "Alternative-data weights refreshed", tone: "text-info" },
  { title: "12 files awaiting manual review", detail: "SLA breach in 4 hours", tone: "text-warning" },
];

export function Topbar() {
  const { theme, toggle } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-3 py-3 sm:px-6">
        <SidebarTrigger className="shrink-0" />

        <form
          className="min-w-0"
          onSubmit={(e) => {
            e.preventDefault();
            navigate({ to: "/applicants", search: { q: query } });
          }}
        >
          <div className="relative max-w-md">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search applicants, loan IDs…"
              className="rounded-xl border-border/70 bg-card/60 pl-9"
              aria-label="Search applicants"
            />
          </div>
        </form>

        <div className="flex shrink-0 items-center gap-1.5">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative rounded-xl" aria-label="Notifications">
                <Bell className="size-4.5" />
                <span className="absolute top-2 right-2 size-2 rounded-full bg-destructive" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 rounded-2xl p-2">
              <p className="px-2 py-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Notifications
              </p>
              {notifications.map((n) => (
                <div key={n.title} className="rounded-xl p-2 transition-colors hover:bg-accent">
                  <p className={`text-sm font-medium ${n.tone}`}>{n.title}</p>
                  <p className="text-xs text-muted-foreground">{n.detail}</p>
                </div>
              ))}
            </PopoverContent>
          </Popover>

          <Button variant="ghost" size="icon" className="rounded-xl" onClick={toggle} aria-label="Toggle dark mode">
            {theme === "dark" ? <Sun className="size-4.5" /> : <Moon className="size-4.5" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 rounded-xl px-1.5 sm:px-2">
                <Avatar className="size-8">
                  <AvatarFallback className="gradient-brand text-xs font-semibold text-primary-foreground">
                    {initials(user?.name ?? "Credit Officer")}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden max-w-28 truncate text-sm font-medium sm:block">
                  {user?.name ?? "Credit Officer"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-2xl">
              <DropdownMenuLabel>
                <p className="text-sm font-semibold">{user?.name ?? "Credit Officer"}</p>
                <p className="truncate text-xs font-normal text-muted-foreground">{user?.email ?? "demo@bank.in"}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/settings">
                  <User className="size-4" /> Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings">
                  <SettingsIcon className="size-4" /> Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  logout();
                  navigate({ to: "/" });
                }}
              >
                <LogOut className="size-4" /> Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}