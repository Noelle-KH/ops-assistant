import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"

function App() {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <div className="p-4 border-b flex items-center gap-4 sticky top-0 bg-background z-10">
            <SidebarTrigger />
            <h1 className="text-xl font-bold">Operations Navigator</h1>
          </div>
          <div className="p-6">
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">Welcome Back</h2>
              <p className="text-muted-foreground">Select a tool from the sidebar to get started.</p>
            </section>
          </div>
        </main>
      </SidebarProvider>
    </TooltipProvider>
  )
}

export default App
