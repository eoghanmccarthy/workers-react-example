import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import type { QueryClient } from "@tanstack/react-query";

import { Logo } from "../components/logo.tsx";

interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <div className="min-h-screen">
      <header className="sticky top-0 p-6 z-50">
        <div className="absolute inset-0" />
        <div className="relative text-xl font-medium">
          <Logo className="w-16 h-auto" fill="white" />
        </div>
      </header>
      <Outlet />
      <TanStackRouterDevtools />
      <footer className="mt-24 py-12 px-6">
        <div className="text-sm text-zinc-500 text-center">Blah.</div>
      </footer>
    </div>
  ),
});
