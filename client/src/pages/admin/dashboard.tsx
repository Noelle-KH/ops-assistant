import { useState, useEffect } from "react";
import { 
  BookOpen, 
  FileText, 
  Mail, 
  Activity, 
  Users, 
  Clock, 
  ChevronRight,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { cn, API_BASE_URL, fetchWithAuth } from "@/lib/utils";

interface Stats {
  faqs: number;
  sops: number;
  templates: number;
  announcements: number;
  activeFaqs: number;
  activeSops: number;
  activeTemplates: number;
  activeAnnouncements: number;
}

interface AuditLog {
  timestamp: string;
  admin: string;
  action: string;
  target: string;
  details?: {
    count?: number;
  };
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({
    faqs: 0, sops: 0, templates: 0, announcements: 0,
    activeFaqs: 0, activeSops: 0, activeTemplates: 0, activeAnnouncements: 0
  });
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [faqRes, sopRes, tplRes, annRes, auditRes] = await Promise.all([
        fetchWithAuth(`${API_BASE_URL}/api/faq`),
        fetchWithAuth(`${API_BASE_URL}/api/sop`),
        fetchWithAuth(`${API_BASE_URL}/api/templates`),
        fetchWithAuth(`${API_BASE_URL}/api/announcements`),
        fetchWithAuth(`${API_BASE_URL}/api/admin/audit`)
      ]);

      const faqs = await faqRes.json();
      const sops = await sopRes.json();
      const templates = await tplRes.json();
      const announcements = await annRes.json();
      const logsData = await auditRes.json();

      setStats({
        faqs: Array.isArray(faqs) ? faqs.length : 0,
        sops: Array.isArray(sops) ? sops.length : 0,
        templates: Array.isArray(templates) ? templates.length : 0,
        announcements: Array.isArray(announcements) ? announcements.length : 0,
        activeFaqs: Array.isArray(faqs) ? faqs.filter((f: any) => f.status === "active").length : 0,
        activeSops: Array.isArray(sops) ? sops.filter((s: any) => s.status === "active").length : 0,
        activeTemplates: Array.isArray(templates) ? templates.filter((t: any) => t.status === "active").length : 0,
        activeAnnouncements: Array.isArray(announcements) ? announcements.filter((a: any) => a.status === "active").length : 0,
      });
      
      if (Array.isArray(logsData)) {
        setLogs(logsData.slice(0, 10)); // Top 10 latest logs
      } else {
        setLogs([]);
      }
    } catch (err) {
      toast.error("無法載入儀表板數據");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const STAT_CARDS = [
    { label: "FAQ 總數", value: stats.faqs, active: stats.activeFaqs, icon: BookOpen, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "SOP 流程", value: stats.sops, active: stats.activeSops, icon: FileText, color: "text-emerald-500", bg: "bg-emerald-50" },
    { label: "郵件模板", value: stats.templates, active: stats.activeTemplates, icon: Mail, color: "text-purple-500", bg: "bg-purple-50" },
    { label: "系統公告", value: stats.announcements, active: stats.activeAnnouncements, icon: Activity, color: "text-amber-500", bg: "bg-amber-50" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Welcome Section */}
      <section className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900">數據概覽</h2>
          <p className="text-slate-500 font-medium">即時監控系統內容狀態與維護紀錄。</p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <Clock className="h-4 w-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-600">{new Date().toLocaleDateString()}</span>
        </div>
      </section>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {STAT_CARDS.map((stat) => (
          <Card key={stat.label} className="border-none shadow-xl shadow-slate-200/50 overflow-hidden group">
            <CardContent className="p-6 relative">
              <div className={cn("absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500", stat.color)}>
                <stat.icon size={100} />
              </div>
              <div className="flex items-center justify-between mb-4">
                <div className={cn("p-3 rounded-2xl", stat.bg)}>
                  <stat.icon className={cn("h-6 w-6", stat.color)} />
                </div>
                <Badge variant="outline" className="font-bold border-slate-100 text-slate-400">
                  {stat.active} 已啟用
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
                <p className="text-4xl font-black text-slate-900">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <Card className="lg:col-span-2 border-none shadow-xl shadow-slate-200/50">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 pb-6">
            <div className="space-y-1">
              <CardTitle className="text-xl font-black flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                最近操作日誌
              </CardTitle>
              <CardDescription>顯示系統中最近發生的內容異動紀錄</CardDescription>
            </div>
            <TrendingUp className="h-5 w-5 text-slate-200" />
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px]">
              <div className="divide-y divide-slate-50">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="p-6 space-y-2 animate-pulse">
                      <div className="h-4 w-1/4 bg-slate-100 rounded" />
                      <div className="h-4 w-3/4 bg-slate-50 rounded" />
                    </div>
                  ))
                ) : logs.length > 0 ? (
                  logs.map((log, i) => (
                    <div key={i} className="p-6 hover:bg-slate-50/50 transition-colors flex items-start gap-4 group">
                      <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                        <Users className="h-4 w-4 text-slate-400" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-black text-slate-800">
                            {log.admin} 
                            <span className="mx-2 text-slate-300 font-normal">|</span> 
                            <span className="text-primary uppercase tracking-tighter">{log.action}</span>
                          </p>
                          <span className="text-[10px] font-bold text-slate-400">{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-slate-500 font-medium">
                          修改了 <span className="text-slate-700 font-bold underline underline-offset-4 decoration-slate-200">{log.target}</span> 檔案內容
                        </p>
                        {log.details?.count && (
                          <p className="text-[10px] text-slate-400 italic">異動數據筆數：{log.details.count}</p>
                        )}
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-200 mt-2 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  ))
                ) : (
                  <div className="py-20 text-center space-y-3">
                    <AlertCircle className="h-10 w-10 text-slate-100 mx-auto" />
                    <p className="text-slate-400 font-bold">目前尚無任何操作日誌</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* System Info & Tips */}
        <div className="space-y-6">
          <Card className="bg-primary border-none shadow-xl shadow-primary/20 text-white overflow-hidden relative">
            <div className="absolute right-0 top-0 h-32 w-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
            <CardHeader>
              <CardTitle className="text-xl font-black">系統狀態</CardTitle>
              <CardDescription className="text-primary-foreground/70">當前運行環境與連線品質</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/10">
                <span className="text-xs font-bold">API 伺服器</span>
                <Badge className="bg-emerald-400/20 text-emerald-100 border-none">良好 (Online)</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/10">
                <span className="text-xs font-bold">JSON 儲存路徑</span>
                <code className="text-[10px] opacity-70">server/src/data</code>
              </div>
            </CardContent>
          </Card>

          <Card className="border-dashed border-2 border-slate-200 shadow-none bg-transparent">
            <CardHeader>
              <CardTitle className="text-sm font-black text-slate-600">維護提醒</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-slate-400 font-medium leading-relaxed">
              為確保數據安全，請定期下載備份 `data/` 目錄下的 JSON 檔案。目前系統採每次請求讀取策略，異動將即時反映給前台運營人員。
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
