import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
    queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
    component: () => (
        <div className="min-h-screen">
            <header className="sticky top-0 p-6 z-50">
                <div className="absolute inset-0 backdrop-blur-sm bg-black/30 [mask-image:linear-gradient(to_bottom,black_0%,transparent_100%)]" />
                <div className="relative text-xl font-medium">Nuevo.Tokyo™</div>
            </header>
            {/* <hr /> */}
            <Outlet />
            <TanStackRouterDevtools />
            <footer className="mt-24 py-12 px-6 border-t border-zinc-800">
                <div className="text-sm text-zinc-500">
                    © 2024 Nuevo.Tokyo™. All rights reserved.
                </div>
            </footer>
        </div>
    ),
})
