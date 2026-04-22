import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import { Bell, ChevronDown, LayoutGrid, Milestone, Users } from "lucide-react";
import { useState } from "react";
import { MOCK_PROFILE } from "../data/mockData";
import { Avatar } from "./Avatar";
import {
  MOCK_NOTIFICATIONS,
  type Notification,
  NotificationPanel,
} from "./NotificationPanel";
import { ProfilePanel } from "./ProfilePanel";

const NAV_TABS = [
  { label: "Board", path: "/dashboard", icon: LayoutGrid },
  { label: "Milestones", path: "/milestones", icon: Milestone },
  { label: "Team", path: "/team", icon: Users },
];

export function Navbar() {
  const router = useRouterState();
  const currentPath = router.location.pathname;

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] =
    useState<Notification[]>(MOCK_NOTIFICATIONS);

  // Dark mode: read from <html> class and toggle
  const [isDark, setIsDark] = useState(
    () =>
      typeof document !== "undefined" &&
      document.documentElement.classList.contains("dark"),
  );

  function toggleDark() {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <>
      <header
        className="sticky top-0 z-30 bg-card border-b border-border"
        style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
        data-ocid="navbar"
      >
        <div className="flex items-center h-14 px-4 gap-0">
          {/* Logo */}
          <div className="flex items-center gap-2 mr-6 flex-shrink-0">
            <div className="flex items-center gap-1.5">
              <svg
                width="28"
                height="28"
                viewBox="0 0 28 28"
                fill="none"
                className="flex-shrink-0"
                role="img"
                aria-label="WeFlow logo"
              >
                <polygon
                  points="14,2 24,7.5 24,20.5 14,26 4,20.5 4,7.5"
                  fill="oklch(0.62 0.22 40)"
                  stroke="none"
                />
                <text
                  x="14"
                  y="18"
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="700"
                  fill="white"
                  fontFamily="Space Grotesk"
                >
                  W
                </text>
              </svg>
              <div className="flex flex-col leading-none">
                <span className="text-sm font-bold font-display text-foreground tracking-tight">
                  WeFlow
                </span>
                <span className="text-[9px] text-muted-foreground font-medium tracking-wide uppercase">
                  by nHive
                </span>
              </div>
            </div>
          </div>

          {/* Workspace name */}
          <button
            type="button"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md hover:bg-muted transition-colors mr-4 text-sm font-semibold text-foreground"
            data-ocid="workspace-switcher"
          >
            InHive
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          </button>

          {/* Divider */}
          <div className="h-5 w-px bg-border mx-1 flex-shrink-0" />

          {/* Nav tabs */}
          <nav
            className="flex items-center gap-0.5 mx-3"
            aria-label="Main navigation"
          >
            {NAV_TABS.map(({ label, path, icon: Icon }) => {
              const active =
                currentPath === path ||
                (path === "/dashboard" && currentPath === "/");
              return (
                <Link
                  key={path}
                  to={path}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted",
                  )}
                  data-ocid={`nav-tab-${label.toLowerCase()}`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Notifications */}
          <div className="relative">
            <button
              type="button"
              className={cn(
                "relative p-2 rounded-md hover:bg-muted transition-colors mr-1",
                notifOpen && "bg-muted",
              )}
              aria-label="Notifications"
              aria-expanded={notifOpen}
              data-ocid="notifications-btn"
              onClick={() => {
                setNotifOpen((v) => !v);
                setProfileOpen(false);
              }}
            >
              <Bell className="w-[18px] h-[18px] text-muted-foreground" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-0.5 -right-0.5 h-4 min-w-4 p-0 flex items-center justify-center text-[9px] bg-primary text-primary-foreground border-0">
                  {unreadCount}
                </Badge>
              )}
            </button>

            {notifOpen && (
              <NotificationPanel
                notifications={notifications}
                onMarkAllRead={markAllRead}
                onClose={() => setNotifOpen(false)}
              />
            )}
          </div>

          {/* User avatar */}
          <button
            type="button"
            className={cn(
              "flex items-center gap-2 pl-2 pr-1 py-1 rounded-md hover:bg-muted transition-colors",
              profileOpen && "bg-muted",
            )}
            data-ocid="user-menu-btn"
            aria-label="User menu"
            aria-expanded={profileOpen}
            onClick={() => {
              setProfileOpen((v) => !v);
              setNotifOpen(false);
            }}
          >
            <Avatar
              initials={MOCK_PROFILE.initials}
              name={MOCK_PROFILE.name}
              size="sm"
            />
            <span className="text-sm font-medium text-foreground hidden sm:block">
              {MOCK_PROFILE.name.split(" ")[0]}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
      </header>

      {/* Profile panel overlay */}
      {profileOpen && (
        <ProfilePanel
          isDark={isDark}
          onToggleDark={toggleDark}
          onClose={() => setProfileOpen(false)}
        />
      )}
    </>
  );
}
