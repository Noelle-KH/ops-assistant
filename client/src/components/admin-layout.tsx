import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { 
  LayoutDashboard, 
  FileText, 
  BookOpen, 
  Mail, 
  Settings, 
  LogOut, 
  ChevronRight,
  ShieldAlert,
  Home,
  MessageSquare,
  Wrench,
  UserCog,
  Menu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Sheet, 
  SheetContent, 
  SheetDescription,
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";

const NAV_ITEMS = [
  { label: "儀表板", path: "/admin/dashboard", icon: LayoutDashboard },
  { label: "公告管理", path: "/admin/announcements", icon: ShieldAlert },
  { label: "FAQ 管理", path: "/admin/faq", icon: BookOpen },
  { label: "SOP 管理", path: "/admin/sop", icon: FileText },
  { label: "模板管理", path: "/admin/templates", icon: Mail },
  { label: "群組管理", path: "/admin/groups", icon: MessageSquare },
  { label: "工具管理", path: "/admin/tools", icon: Wrench },
  { label: "帳號與權限", path: "/admin/users", icon: UserCog },
  { label: "系統日誌", path: "/admin/audit", icon: ShieldAlert },
];

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("user_token");
    const role = localStorage.getItem("user_role");
    if (!token || role !== "admin") {
      toast.error("權限不足，請重新登入");
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user_token");
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_role");
    localStorage.removeItem("last_activity");
    toast.info("已成功登出系統");
    navigate("/login");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-white">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800/50 shrink-0">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
          <Settings className="h-5 w-5 text-white" />
        </div>
        <span className="font-black tracking-tight text-lg">領航站後台</span>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 py-4 custom-scrollbar">
        <nav className="px-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSheetOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm",
                  isActive 
                    ? "bg-primary text-white shadow-lg shadow-primary/20" 
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
                {isActive && <ChevronRight className="ml-auto h-3 w-3" />}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-800/50 shrink-0 bg-slate-900/50">
        <div className="bg-slate-800/50 rounded-2xl p-4 mb-4">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">當前管理員</p>
          <p className="text-sm font-bold text-slate-200 truncate">{localStorage.getItem("user_name") || "Administrator"}</p>
        </div>
        
        <div className="space-y-1">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-slate-400 hover:text-primary hover:bg-primary/10 gap-3 font-bold h-10"
            asChild
          >
            <Link to="/">
              <Home className="h-4 w-4" />
              回到領航站
            </Link>
          </Button>
          
          <Button 
            variant="ghost" 
            className="w-full justify-start text-slate-400 hover:text-red-400 hover:bg-red-400/10 gap-3 font-bold h-10"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            登出系統
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-slate-50/50">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside className="w-64 bg-slate-900 text-white flex flex-col sticky top-0 h-screen shrink-0 shadow-2xl">
          <SidebarContent />
        </aside>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b px-4 md:px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4">
            {isMobile && (
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-72 border-none">
                  <SheetHeader className="sr-only">
                    <SheetTitle>管理選單</SheetTitle>
                    <SheetDescription>
                      切換管理後台各個模組的導覽選單。
                    </SheetDescription>
                  </SheetHeader>
                  <SidebarContent />
                </SheetContent>
              </Sheet>
            )}
            <h1 className="text-base md:text-lg font-black text-slate-800 truncate">
              {NAV_ITEMS.find(item => item.path === location.pathname)?.label || "管理控制台"}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex h-8 px-3 rounded-full bg-slate-100 items-center text-[10px] font-black text-slate-500 uppercase tracking-wider">
              Mode: Development
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

