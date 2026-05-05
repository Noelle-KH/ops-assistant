import { 
  Home, 
  Search, 
  FileQuestion, 
  FileText, 
  Mail, 
  Users, 
  Wrench, 
  Link2 
} from "lucide-react"
import { Link, useLocation } from "react-router-dom"

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
} from "@/components/ui/sidebar"

const items = [
  { title: "首頁", url: "/", icon: Home },
  { title: "FAQ 知識庫", url: "/faq", icon: FileQuestion },
  { title: "SOP 操作流程", url: "/sop", icon: FileText },
  { title: "郵件模板庫", url: "/templates", icon: Mail },
  { title: "群組目錄", url: "/groups", icon: Users },
  { title: "系統工具", url: "/tools", icon: Wrench },
  { title: "歸屬鏈解析器", url: "/parser", icon: Link2 },
]

export function AppSidebar() {
  const location = useLocation()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b h-14 flex items-center px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Link2 className="h-4 w-4" />
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
    </Sidebar>
  )
}
