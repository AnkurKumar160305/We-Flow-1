import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  CheckCircle2,
  Flag,
  MessageSquare,
  UserPlus,
  X,
  Zap,
  Bell,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { AppNotification } from "../hooks/useBackend";

const iconMap: Record<string, React.ElementType> = {
  AlertTriangle,
  CheckCircle2,
  Flag,
  MessageSquare,
  UserPlus,
  Zap,
  Bell,
};

// Simple helper to format time
function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

interface NotificationPanelProps {
  notifications: AppNotification[];
  onMarkAllRead: () => void;
  onClose: () => void;
}

export function NotificationPanel({
  notifications,
  onMarkAllRead,
  onClose,
}: NotificationPanelProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-[380px] z-50 bg-popover border border-border rounded-xl shadow-2xl overflow-hidden"
      data-ocid="notifications.panel"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground font-display">
            Notifications
          </h3>
          {unreadCount > 0 && (
            <span className="bg-primary text-primary-foreground text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={onMarkAllRead}
              className="text-xs text-primary hover:text-primary/80 font-medium transition-colors px-2 py-1 rounded hover:bg-primary/10"
              data-ocid="notifications.mark_all_read"
            >
              Mark all as read
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground"
            aria-label="Close notifications"
            data-ocid="notifications.close_button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notification list */}
      <div className="max-h-[440px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-12 text-center"
            data-ocid="notifications.empty_state"
          >
            <CheckCircle2 className="w-10 h-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">
              All caught up!
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              No new notifications
            </p>
          </div>
        ) : (
          <ul>
            {notifications.map((notif, idx) => {
              const Icon = notif.icon && iconMap[notif.icon] ? iconMap[notif.icon] : Bell;
              const bgClass = notif.color ? `${notif.color.replace('text-', 'bg-')}/10` : 'bg-primary/10';
              const iconClass = notif.color || 'text-primary';
              return (
                <li
                  key={notif.id}
                  className={cn(
                    "flex gap-3 px-4 py-3 border-b border-border/60 last:border-0 hover:bg-muted/40 transition-colors cursor-pointer",
                    !notif.isRead && "bg-primary/[0.03]",
                  )}
                  data-ocid={`notifications.item.${idx + 1}`}
                >
                  {/* Icon badge */}
                  <div
                    className={cn(
                      "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5",
                      bgClass,
                    )}
                  >
                    <Icon className={cn("w-4 h-4", iconClass)} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={cn(
                          "text-sm leading-snug",
                          notif.isRead
                            ? "text-foreground/80 font-normal"
                            : "text-foreground font-semibold",
                        )}
                      >
                        {notif.title}
                      </p>
                      {!notif.isRead && (
                        <span className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-1.5" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {notif.message}
                    </p>
                    <p className="text-[11px] text-muted-foreground/60 mt-1">
                      {formatTimeAgo(notif.timestamp)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-border bg-muted/30 text-center">
        <button
          type="button"
          className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
          data-ocid="notifications.view_all"
        >
          View all notifications
        </button>
      </div>
    </div>
  );
}
