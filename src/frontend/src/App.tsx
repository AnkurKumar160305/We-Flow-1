import { Skeleton } from "@/components/ui/skeleton";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import { Suspense, lazy } from "react";

// ─── Lazy page imports ────────────────────────────────────────────────────────
const DashboardPage = lazy(() => import("./pages/Dashboard"));
const OnboardingPage = lazy(() => import("./pages/Onboarding"));
const MilestonesPage = lazy(() => import("./pages/Milestones"));
const TeamPage = lazy(() => import("./pages/Team"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const AcceptInvitePage = lazy(() => import("./pages/AcceptInvite"));


// ─── Page fallback ────────────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="flex-1 p-6 space-y-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-40" />
      <div className="grid grid-cols-3 gap-4 mt-6">
        {["a", "b", "c"].map((k) => (
          <Skeleton key={k} className="h-64 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

// ─── Root layout ──────────────────────────────────────────────────────────────
const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

// ─── Routes ───────────────────────────────────────────────────────────────────
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: () => {
    throw redirect({ to: "/onboarding" });
  },
  component: () => null,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <DashboardPage />
    </Suspense>
  ),
});

const onboardingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/onboarding",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <OnboardingPage />
    </Suspense>
  ),
});

const milestonesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/milestones",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <MilestonesPage />
    </Suspense>
  ),
});

const teamRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/team",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <TeamPage />
    </Suspense>
  ),
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <ProfilePage />
    </Suspense>
  ),
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <SettingsPage />
    </Suspense>
  ),
});

const acceptInviteRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/accept-invite/$token",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <AcceptInvitePage />
    </Suspense>
  ),
});


// ─── Router ───────────────────────────────────────────────────────────────────
const routeTree = rootRoute.addChildren([
  indexRoute,
  dashboardRoute,
  onboardingRoute,
  milestonesRoute,
  teamRoute,
  profileRoute,
  settingsRoute,
  acceptInviteRoute,
]);


const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  return <RouterProvider router={router} />;
}
