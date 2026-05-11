import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { 
  LayoutDashboard, 
  FileText, 
  BookOpen, 
  Mail, 
  Users, 
  Settings, 
  LogOut, 
  ChevronRight,
  ShieldAlert
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { toast } from "sonner";

const NAV_ITEMS = [
  { label: "儀表板", path: "/admin/dashboard", icon: LayoutDashboard },
  { label: "公告管理", path: "/admin/announcements", icon: ShieldAlert },
  { label: "FAQ 管理", path: "/admin/faq", icon: BookOpen },
  { label: "SOP 管理", path: "/admin/sop", icon: FileText },
  { label: "模板管理", path: "/admin/templates", icon: Mail },
  { label: "群組與權限", path: "/admin/users", icon: Users },
  { label: "系統日誌", path: "/admin/audit", icon: ShieldAlert },
];

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const adminUser = localStorage.getItem("admin_user");

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      toast.error("未經授權，請先登入");
      navigate("/admin/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    toast.info("已成功登出管理系統");
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen flex bg-slate-50/50">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col sticky top-0 h-screen">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800/50">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Settings className="h-5 w-5 text-white" />
          </div>
          <span className="font-black tracking-tight text-lg">領航站後台</span>
        </div>

        <nav className="flex-1 p-4 space-y-1 mt-4">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
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

        <div className="p-4 border-t border-slate-800/50">
          <div className="bg-slate-800/50 rounded-2xl p-4 mb-4">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">當前管理員</p>
            <p className="text-sm font-bold text-slate-200">{adminUser || "Administrator"}</p>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-slate-400 hover:text-red-400 hover:bg-red-400/10 gap-3 font-bold"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            登出系統
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b px-8 flex items-center justify-between sticky top-0 z-20">
          <h1 className="text-lg font-black text-slate-800">
            {NAV_ITEMS.find(item => item.path === location.pathname)?.label || "管理控制台"}
          </h1>
          <div className="flex items-center gap-4">
            <div className="h-8 px-3 rounded-full bg-slate-100 flex items-center text-[10px] font-black text-slate-500 uppercase tracking-wider">
              Mode: Development
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
