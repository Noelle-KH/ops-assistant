import { 
  Home,
  Search,
  FileQuestion,
  Mail,
  Users,
  Wrench,
  LogOut,
  User,
  Settings
  } from "lucide-react"

  import { Link, useLocation, useNavigate } from "react-router-dom"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarInput,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useState, useEffect } from "react"
import { GlobalSearch } from "./global-search"
import { cn } from "@/lib/utils"

const items = [
  { title: "首頁", url: "/", icon: Home },
  { title: "知識庫", url: "/knowledge-base", icon: FileQuestion },
  { title: "郵件模板庫", url: "/templates", icon: Mail },
  { title: "群組目錄", url: "/groups", icon: Users },
  { title: "系統工具", url: "/tools", icon: Wrench },
]

export function AppSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { state } = useSidebar()
  const [searchOpen, setSearchOpen] = useState(false)
  const isCollapsed = state === "collapsed"
  
  const userName = localStorage.getItem("user_name") || "未登入"
  const userRole = localStorage.getItem("user_role") || "operator"
  const isAdmin = userRole === "admin"

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setSearchOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("user_token")
    localStorage.removeItem("user_name")
    localStorage.removeItem("user_role")
    localStorage.removeItem("admin_token")
    localStorage.removeItem("admin_user")
    localStorage.removeItem("last_activity")
    toast.success("已成功登出系統")
    navigate("/login")
  }

  const getRoleLabel = (role: string) => {
    switch(role) {
      case "admin": return "系統管理員"
      case "high_level": return "高級運營"
      default: return "一般運營"
    }
  }

  return (
    <>
      <Sidebar collapsible="icon" className="border-r border-slate-100">
        {!isCollapsed && (
          <SidebarHeader className="h-16 flex items-center justify-center px-4 border-b border-slate-50">
            <Link to="/" className="flex items-center gap-3 w-full overflow-hidden transition-all">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                <Wrench className="h-5 w-5" />
              </div>
              <span className="font-black text-xl tracking-tight text-slate-900 animate-in fade-in slide-in-from-left-2 duration-300">
                領航站
              </span>
            </Link>
          </SidebarHeader>
        )}
        
        <SidebarContent className="py-4">
          <div className="px-3 mb-6">
            <div 
              className={cn(
                "relative group cursor-pointer transition-all",
                isCollapsed ? "flex justify-center" : ""
              )} 
              onClick={() => setSearchOpen(true)}
            >
              <Search className={cn(
                "absolute h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors z-10",
                isCollapsed ? "static" : "left-3 top-2.5"
              )} />
              {!isCollapsed && (
                <SidebarInput 
                  placeholder="全域搜尋... (Ctrl+K)" 
                  className="pl-9 h-10 cursor-pointer hover:border-primary/50 transition-all rounded-xl bg-slate-50/50 border-slate-100" 
                  readOnly
                />
              )}
            </div>
          </div>

          <SidebarGroup className="px-3">
            <SidebarGroupLabel className="px-2 mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
              導覽
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      tooltip={item.title}
                      isActive={location.pathname === item.url}
                      className={cn(
                        "h-11 rounded-xl transition-all",
                        location.pathname === item.url 
                          ? "bg-primary/5 text-primary shadow-sm shadow-primary/5" 
                          : "text-slate-500 hover:bg-slate-50"
                      )}
                    >
                      <Link to={item.url} className="flex items-center gap-3">
                        <item.icon className={cn("h-5 w-5", location.pathname === item.url ? "text-primary" : "text-slate-400")} />
                        <span className="font-bold text-sm">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-3 border-t border-slate-50 bg-slate-50/20">
          <div className="flex flex-col gap-3">
            {!isCollapsed && (
              <div className="flex items-center gap-3 px-2 py-2 rounded-2xl bg-white border border-slate-100 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                <div className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                  <User className="h-5 w-5 text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-slate-900 truncate">{userName}</p>
                  <p className="text-[10px] font-bold text-slate-400 truncate uppercase tracking-tight">{getRoleLabel(userRole)}</p>
                </div>
              </div>
            )}
            
            <div className="space-y-1">
              {isAdmin && (
                <SidebarMenuButton 
                  asChild 
                  tooltip="進入管理後台"
                  className="h-10 rounded-xl text-primary hover:text-primary hover:bg-primary/10 transition-all font-bold"
                >
                  <Link to="/admin/dashboard" className="flex items-center gap-3">
                    <Settings className="h-4 w-4" />
                    {!isCollapsed && <span>管理後台</span>}
                  </Link>
                </SidebarMenuButton>
              )}
              <SidebarMenuButton 
                onClick={handleLogout} 
                tooltip="登出系統" 
                className="h-10 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all font-bold"
              >
                <div className="flex items-center gap-3 w-full">
                  <LogOut className="h-4 w-4" />
                  {!isCollapsed && <span>登出系統</span>}
                </div>
              </SidebarMenuButton>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  )
}


