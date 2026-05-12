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
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

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
  const userName = localStorage.getItem("user_name") || "未登入"
  const userRole = localStorage.getItem("user_role") || "operator"
  const isAdmin = userRole === "admin"

  const handleLogout = () => {
    localStorage.removeItem("user_token")
    localStorage.removeItem("user_name")
    localStorage.removeItem("user_role")
    localStorage.removeItem("admin_token")
    localStorage.removeItem("admin_user")
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
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b h-14 flex items-center px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Wrench className="h-4 w-4" />
          </div>
          <span className="font-bold text-lg truncate">領航站</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <div className="px-2 py-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <SidebarInput placeholder="全域搜尋..." className="pl-8" />
          </div>
        </div>
        <SidebarGroup>
          <SidebarGroupLabel>導覽</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    tooltip={item.title}
                    isActive={location.pathname === item.url}
                  >
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 px-2">
            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
              <User className="h-4 w-4 text-slate-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">{userName}</p>
              <p className="text-[10px] font-medium text-slate-500 truncate">{getRoleLabel(userRole)}</p>
            </div>
          </div>
          
          <div className="space-y-1">
            {isAdmin && (
              <SidebarMenuButton asChild tooltip="進入管理後台">
                <Link to="/admin/dashboard" className="text-primary hover:text-primary hover:bg-primary/10">
                  <Settings className="h-4 w-4" />
                  <span>進入管理後台</span>
                </Link>
              </SidebarMenuButton>
            )}
            <SidebarMenuButton onClick={handleLogout} tooltip="登出系統" className="text-slate-500 hover:text-red-500 hover:bg-red-50">
              <LogOut className="h-4 w-4" />
              <span>登出系統</span>
            </SidebarMenuButton>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
