import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Layout } from "../components/Layout";
import { MOCK_TASKS, MOCK_SPRINTS, MOCK_WORKSPACE } from "../data/mockData";
import { useMilestones } from "../hooks/useBackend";
import {
  CalendarDays,
  Edit2,
  Info,
  LayoutGrid,
  Milestone as MilestoneIcon,
  Rocket,
  CheckCircle2,
  Clock,
  AlertCircle,
  ListTodo,
  TrendingUp,
} from "lucide-react";

export default function SettingsPage() {
  const workspace = MOCK_WORKSPACE;
  const { data: milestones = [] } = useMilestones(workspace.id);

  const creationDate = new Date(workspace.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Calculate Stats
  const totalMilestones = milestones.length;
  const totalSprints = MOCK_SPRINTS.length;
  const totalTasks = MOCK_TASKS.length;
  const doneTasks = MOCK_TASKS.filter((t) => t.status === "done").length;
  const doingTasks = MOCK_TASKS.filter((t) => t.status === "doing").length;
  const blockedTasks = MOCK_TASKS.filter((t) => t.status === "blocked").length;
  const todoTasks = MOCK_TASKS.filter((t) => t.status === "todo").length;

  return (
    <Layout>
      <div className="flex-1 overflow-y-auto bg-background p-6 md:p-10">
        <div className="max-w-4xl mx-auto space-y-10">
          {/* Header Section */}
          <div className="bg-card border border-border rounded-3xl p-8 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary">
                    <Edit2 className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem className="cursor-pointer">
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Workspace
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Delete Workspace
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <CalendarDays className="w-4 h-4 mr-2" />
                    Display Date of Creation
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex flex-col md:flex-row items-start gap-8">
              {/* Workspace Logo */}
              <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-display font-bold text-3xl shadow-md flex-shrink-0">
                {workspace.name.charAt(0)}
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-3xl font-bold font-display text-foreground leading-tight">
                    {workspace.name} <span className="font-normal text-muted-foreground text-2xl ml-1">Workspace</span>
                  </h1>
                  <p className="text-primary font-medium mt-1">{workspace.tagline}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest flex items-center gap-1.5">
                      <CalendarDays className="w-3 h-3" />
                      Created On
                    </p>
                    <p className="text-sm font-medium text-foreground">{creationDate}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest flex items-center gap-1.5">
                      <TrendingUp className="w-3 h-3" />
                      Vision
                    </p>
                    <p className="text-sm font-medium text-foreground italic">"{workspace.vision || "To innovate and lead."}"</p>
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest flex items-center gap-1.5 mb-2">
                    <Info className="w-3 h-3" />
                    Description
                  </p>
                  <p className="text-sm text-foreground leading-relaxed">
                    {workspace.description}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold font-display text-foreground flex items-center gap-2 px-1">
              <TrendingUp className="w-5 h-5 text-primary" />
              Workspace Stats
            </h2>
            
            <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {/* Core counts */}
                <div className="space-y-1 p-4 rounded-2xl bg-primary/5 border border-primary/10">
                  <MilestoneIcon className="w-5 h-5 text-primary mb-2" />
                  <p className="text-3xl font-bold font-display text-foreground">{totalMilestones}</p>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Milestones</p>
                </div>
                <div className="space-y-1 p-4 rounded-2xl bg-primary/5 border border-primary/10">
                  <Rocket className="w-5 h-5 text-primary mb-2" />
                  <p className="text-3xl font-bold font-display text-foreground">{totalSprints}</p>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sprints</p>
                </div>
                <div className="space-y-1 p-4 rounded-2xl bg-primary/5 border border-primary/10">
                  <LayoutGrid className="w-5 h-5 text-primary mb-2" />
                  <p className="text-3xl font-bold font-display text-foreground">{totalTasks}</p>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Tasks</p>
                </div>
                <div className="space-y-1 p-4 rounded-2xl bg-green-500/5 border border-green-500/10">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mb-2" />
                  <p className="text-3xl font-bold font-display text-foreground text-green-700">{doneTasks}</p>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Completed</p>
                </div>

                {/* Secondary counts */}
                <div className="space-y-1 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                  <Clock className="w-5 h-5 text-blue-600 mb-2" />
                  <p className="text-2xl font-bold font-display text-foreground">{doingTasks}</p>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ongoing (Doing)</p>
                </div>
                <div className="space-y-1 p-4 rounded-2xl bg-red-500/5 border border-red-500/10">
                  <AlertCircle className="w-5 h-5 text-red-600 mb-2" />
                  <p className="text-2xl font-bold font-display text-foreground text-red-700">{blockedTasks}</p>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Blocked</p>
                </div>
                <div className="space-y-1 p-4 rounded-2xl bg-slate-500/5 border border-slate-500/10">
                  <ListTodo className="w-5 h-5 text-slate-600 mb-2" />
                  <p className="text-2xl font-bold font-display text-foreground">{todoTasks}</p>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">To-Do</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
