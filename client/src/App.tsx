import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"

// Pages
import Dashboard from "@/pages/dashboard"
import ParserPage from "@/pages/parser"
import KnowledgeBasePage from "@/pages/knowledge-base"
import TemplatesPage from "@/pages/templates"
import GroupsPage from "@/pages/groups"
import ToolsPage from "@/pages/tools"
import LoginPage from "@/pages/login"

// Admin Pages
import AdminLoginPage from "@/pages/admin/login"
import AdminDashboardPage from "@/pages/admin/dashboard"
import AdminAnnouncementsPage from "@/pages/admin/announcements"
import AdminFaqPage from "@/pages/admin/faq"
import AdminSopPage from "@/pages/admin/sop"
import AdminTemplatesPage from "@/pages/admin/templates"
import AdminUsersPage from "@/pages/admin/users"
import AdminGroupsPage from "@/pages/admin/groups"
import AdminToolsPage from "@/pages/admin/tools"
import AdminAuditPage from "@/pages/admin/audit"
import { AdminLayout } from "@/components/admin-layout"
import { AuthGuard } from "@/components/auth-guard"

function App() {
  return (
    <Router>
      <TooltipProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          
          <Route path="/*" element={
            <AuthGuard>
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
                      <Route path="/knowledge-base" element={<KnowledgeBasePage />} />
                      <Route path="/knowledge-base/faq/:id?" element={<KnowledgeBasePage />} />
                      <Route path="/knowledge-base/sop/:id?" element={<KnowledgeBasePage />} />
                      <Route path="/templates" element={<TemplatesPage />} />
                      <Route path="/groups" element={<GroupsPage />} />
                      <Route path="/tools" element={<ToolsPage />} />
                    </Routes>
                  </div>
                </main>
                <Toaster position="top-center" richColors />
              </SidebarProvider>
            </AuthGuard>
          } />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <AuthGuard requireAdmin>
              <AdminLayout />
            </AuthGuard>
          }>
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="announcements" element={<AdminAnnouncementsPage />} />
            <Route path="faq" element={<AdminFaqPage />} />
            <Route path="sop" element={<AdminSopPage />} />
            <Route path="templates" element={<AdminTemplatesPage />} />
            <Route path="groups" element={<AdminGroupsPage />} />
            <Route path="tools" element={<AdminToolsPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="audit" element={<AdminAuditPage />} />
          </Route>
        </Routes>
      </TooltipProvider>
    </Router>
  )
}

export default App
