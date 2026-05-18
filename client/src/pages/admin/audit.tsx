import { useState, useEffect } from "react";
import { 
  Activity, 
  Search, 
  Clock, 
  User, 
  Database, 
  Filter,
  ArrowUpDown,
  Download,
  FileJson
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn, API_BASE_URL } from "@/lib/utils";

interface AuditLog {
  timestamp: string;
  admin: string;
  action: string;
  target: string;
  details: {
    total_count?: number;
    count?: number;
    added?: unknown[];
    modified?: unknown[];
    deleted?: unknown[];
  };
}

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/audit`);
      const data = await res.json();
      setLogs(data);
    } catch (_err) {
      toast.error("無法載入稽核日誌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => 
    log.admin.toLowerCase().includes(search.toLowerCase()) ||
    log.target.toLowerCase().includes(search.toLowerCase()) ||
    log.action.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => {
    const dateA = new Date(a.timestamp).getTime();
    const dateB = new Date(b.timestamp).getTime();
    return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
  });

  const exportLogs = () => {
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    toast.success("日誌匯出成功");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="搜尋管理員、目標檔案或動作..."
            className="pl-10 h-11 rounded-xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-xl font-bold h-11 px-4"
            onClick={() => setSortOrder(prev => prev === "desc" ? "asc" : "desc")}
          >
            <ArrowUpDown className="mr-2 h-4 w-4" />
            {sortOrder === "desc" ? "最新在前" : "最舊在前"}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-xl font-bold h-11 px-4"
            onClick={exportLogs}
          >
            <Download className="mr-2 h-4 w-4" />
            匯出 JSON
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-xl shadow-slate-200/50 overflow-hidden">
        <CardHeader className="bg-slate-900 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl font-black flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                全系統操作稽核紀錄
              </CardTitle>
              <p className="text-slate-400 text-xs font-medium">記錄所有內容更新、狀態變更與權限調整動作</p>
            </div>
            <Badge className="bg-primary/20 text-primary border-none font-bold">
              共 {filteredLogs.length} 筆紀錄
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-12 bg-slate-50 border-b border-slate-100 p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
            <div className="col-span-3 flex items-center gap-2"><Clock className="h-3 w-3" /> 發生時間</div>
            <div className="col-span-2 flex items-center gap-2"><User className="h-3 w-3" /> 操作人員</div>
            <div className="col-span-2 flex items-center gap-2"><Filter className="h-3 w-3" /> 動作類型</div>
            <div className="col-span-3 flex items-center gap-2"><Database className="h-3 w-3" /> 目標對象</div>
            <div className="col-span-2 text-right"><FileJson className="h-3 w-3 inline mr-1" /> 異動詳情</div>
          </div>
          <ScrollArea className="h-[calc(100vh-22rem)]">
            <div className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="grid grid-cols-12 p-6 gap-4 animate-pulse">
                    <div className="col-span-3 h-4 bg-slate-100 rounded" />
                    <div className="col-span-2 h-4 bg-slate-50 rounded" />
                    <div className="col-span-2 h-4 bg-slate-100 rounded" />
                    <div className="col-span-3 h-4 bg-slate-50 rounded" />
                  </div>
                ))
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map((log, i) => (
                  <div key={i} className="grid grid-cols-12 p-5 items-center hover:bg-slate-50/50 transition-colors group">
                    <div className="col-span-3">
                      <p className="text-xs font-bold text-slate-500">{new Date(log.timestamp).toLocaleDateString()}</p>
                      <p className="text-[10px] text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</p>
                    </div>
                    <div className="col-span-2">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                          {log.admin.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs font-black text-slate-700">{log.admin}</span>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <Badge className={cn(
                        "text-[10px] font-black uppercase tracking-tighter border-none",
                        log.action === "UPDATE" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"
                      )}>
                        {log.action}
                      </Badge>
                    </div>
                    <div className="col-span-3">
                      <code className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {log.target}
                      </code>
                    </div>
                    <div className="col-span-2 text-right">
                      {log.details && (
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-[10px] font-bold text-slate-400">
                            總數: {log.details.total_count || log.details.count}
                          </span>
                          {( (log.details.added?.length || 0) > 0 || (log.details.modified?.length || 0) > 0 || (log.details.deleted?.length || 0) > 0) && (
                            <div className="flex gap-1">
                              {(log.details.added?.length || 0) > 0 && (
                                <Badge variant="outline" className="text-[9px] h-4 px-1 border-emerald-200 text-emerald-600 bg-emerald-50 font-bold">
                                  +{log.details.added?.length}
                                </Badge>
                              )}
                              {(log.details.modified?.length || 0) > 0 && (
                                <Badge variant="outline" className="text-[9px] h-4 px-1 border-blue-200 text-blue-600 bg-blue-50 font-bold">
                                  ~{log.details.modified?.length}
                                </Badge>
                              )}
                              {(log.details.deleted?.length || 0) > 0 && (
                                <Badge variant="outline" className="text-[9px] h-4 px-1 border-rose-200 text-rose-600 bg-rose-50 font-bold">
                                  -{log.details.deleted?.length}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-32 text-center space-y-4">
                  <Activity className="h-12 w-12 text-slate-100 mx-auto" />
                  <p className="text-slate-400 font-bold">目前無任何異動日誌</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
