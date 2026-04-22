import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  CheckCircle2,
  Flag,
  MessageSquare,
  UserPlus,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useRef } from "react";

export interface Notification {
  id: string;
  type:
    | "sprint_started"
    | "task_assigned"
    | "teammate_joined"
    | "milestone_created"
    | "sprint_completed"
    | "task_overdue"
    | "comment";
  title: string;
  description: string;
  timeAgo: string;
  isRead: boolean;
}

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "notif-1",
    type: "sprint_started",
    title: "Sprint 1 is now live",
    description: "Your active sprint kicked off. 8 tasks are ready to roll.",
    timeAgo: "10 minutes ago",
    isRead: false,
  },
  {
    id: "notif-2",
    type: "task_assigned",
    title: "Task assigned to you",
    description:
      '"Redesign onboarding flow" was assigned to you by Jordan Lee.',
    timeAgo: "1 hour ago",
    isRead: false,
  },
  {
    id: "notif-3",
    type: "teammate_joined",
    title: "Casey Kim joined the workspace",
    description: "Casey Kim accepted their invite and joined InHive as Viewer.",
    timeAgo: "3 hours ago",
    isRead: false,
  },
  {
    id: "notif-4",
    type: "milestone_created",
    title: "New milestone created",
    description: '"Q2 Product Launch" milestone was created with 4 sprints.',
    timeAgo: "Yesterday",
    isRead: true,
  },
  {
    id: "notif-5",
    type: "sprint_completed",
    title: "Sprint 2 completed 🎉",
    description:
      "Sprint 2 wrapped up with a velocity of 28 points. Great work!",
    timeAgo: "2 days ago",
    isRead: true,
  },
  {
    id: "notif-6",
    type: "task_overdue",
    title: "Task overdue",
    description: '"Resolve API rate limiting bug" is past its due date.',
    timeAgo: "2 days ago",
    isRead: true,
  },
  {
    id: "notif-7",
    type: "comment",
    title: "Sam Chen commented",
    description: '"Looks good to me! Just need to confirm the spacing tokens."',
    timeAgo: "3 days ago",
    isRead: true,
  },
];

const TYPE_META: Record<
  Notification["type"],
  { icon: React.ElementType; iconClass: string; bgClass: string }
> = {
  sprint_started: {
    icon: Zap,
    iconClass: "text-primary",
    bgClass: "bg-primary/10",
  },
  task_assigned: {
    icon: Flag,
    iconClass: "text-blue-600 dark:text-blue-400",
    bgClass: "bg-blue-500/10",
  },
  teammate_joined: {
    icon: UserPlus,
    iconClass: "text-green-600 dark:text-green-400",
    bgClass: "bg-green-500/10",
  },
  milestone_created: {
    icon: CheckCircle2,
    iconClass: "text-purple-600 dark:text-purple-400",
    bgClass: "bg-purple-500/10",
  },
  sprint_completed: {
    icon: CheckCircle2,
    iconClass: "text-primary",
    bgClass: "bg-primary/10",
  },
  task_overdue: {
    icon: AlertTriangle,
    iconClass: "text-destructive",
    bgClass: "bg-destructive/10",
  },
  comment: {
    icon: MessageSquare,
    iconClass: "text-teal-600 dark:text-teal-400",
    bgClass: "bg-teal-500/10",
  },
};

interface NotificationPanelProps {
  notifications: Notification[];
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
              const meta = TYPE_META[notif.type];
              const Icon = meta.icon;
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
                      meta.bgClass,
                    )}
                  >
                    <Icon className={cn("w-4 h-4", meta.iconClass)} />
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
                      {notif.description}
                    </p>
                    <p className="text-[11px] text-muted-foreground/60 mt-1">
                      {notif.timeAgo}
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
