import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"

// Pages
import Dashboard from "@/pages/dashboard"
import ParserPage from "@/pages/parser"
// import FAQPage from "@/pages/faq" // Removed old import
// import SOPPage from "@/pages/sop" // Removed old import
import KnowledgeBasePage from "@/pages/knowledge-base" // Import the new unified page

function App() {
  return (
    <Router>
      <TooltipProvider>
        <SidebarProvider>
          <AppSidebar />
          <main className="flex-1 overflow-auto bg-slate-50/50 dark:bg-slate-950">
            <header className="flex h-14 items-center gap-4 border-b bg-background px-6 sticky top-0 z-10">
              <SidebarTrigger />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">領航站 / 運營工具</p>
              </div>
            </header>
            <div className="p-6 md:p-8 max-w-7xl mx-auto">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/parser" element={<ParserPage />} />
                {/* Unified Knowledge Base Routes */}
                <Route path="/knowledge-base" element={<KnowledgeBasePage initialTab="faqs" />} /> {/* Default to FAQ tab */}
                <Route path="/knowledge-base/faq/:id?" element={<KnowledgeBasePage initialTab="faqs" />} />
                <Route path="/knowledge-base/sop/:id?" element={<KnowledgeBasePage initialTab="sops" />} />
                {/* Removed old /faq and /sop routes */}
                <Route path="*" element={
                  <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                    <h2 className="text-2xl font-bold">即將推出</h2>
                    <p className="text-muted-foreground">此模組正在開發中，敬請期待。</p>
                  </div>
                } />
              </Routes>
            </div>
          </main>
          <Toaster position="top-center" richColors />
        </SidebarProvider>
      </TooltipProvider>
    </Router>
  )
}

export default App
