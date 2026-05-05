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
  { title: "首頁", url: "#", icon: Home },
  { title: "FAQ 知識庫", url: "#", icon: FileQuestion },
  { title: "SOP 操作流程", url: "#", icon: FileText },
  { title: "郵件模板庫", url: "#", icon: Mail },
  { title: "群組目錄", url: "#", icon: Users },
  { title: "系統工具", url: "#", icon: Wrench },
  { title: "歸屬鏈解析器", url: "#", icon: Link2 },
]

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b h-14 flex items-center px-4">
        <span className="font-bold text-lg truncate">領航站</span>
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
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
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
