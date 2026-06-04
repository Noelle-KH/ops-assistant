import { useState, useEffect } from "react";
import { Search, Wrench, ShieldAlert, Eye, EyeOff, ExternalLink, Lock, User, Key, Check, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { cn, API_BASE_URL, fetchWithAuth } from "@/lib/utils";

interface AccountItem {
  role: string;
  username: string;
  password: string;
  is_sensitive: boolean;
}

interface ToolItem {
  id: string;
  category: string;
  name: string;
  url?: string;
  desc: string;
  accounts?: AccountItem[];
}

export default function ToolsPage() {
  const [tools, setTools] = useState<ToolItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Get user role from session storage or default to operator
  const userRole = sessionStorage.getItem("user_role") || "operator"; 
  const canSeeSensitive = userRole === "admin" || userRole === "high-level";

  useEffect(() => {
    const fetchTools = async () => {
      try {
        const res = await fetchWithAuth(`${API_BASE_URL}/api/tools`)
        const data = await res.json()
        if (Array.isArray(data)) {
          setTools(data);
        } else {
          console.error("Received non-array data from API:", data);
          setTools([]);
        }
      } catch (err) {
        console.error("Failed to fetch tools:", err);
      } finally {
        setLoading(false);
      }
    };

    void fetchTools();
  }, [userRole]);

  const filteredTools = tools.filter(tool => 
    tool.name.toLowerCase().includes(search.toLowerCase()) ||
    tool.category.toLowerCase().includes(search.toLowerCase()) ||
    tool.desc.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    // Auto-hide passwords after 5 minutes
    const timer = setTimeout(() => {
      if (Object.keys(showPasswords).length > 0) {
        setShowPasswords({});
        toast.info("基於安全性，明文密碼已自動隱藏");
      }
    }, 5 * 60 * 1000);

    return () => clearTimeout(timer);
  }, [showPasswords]);

  useEffect(() => {
    // Hide passwords when navigating away
    return () => setShowPasswords({});
  }, []);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success("已複製到剪貼簿");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const togglePassword = (accId: string) => {
    setShowPasswords(prev => ({ ...prev, [accId]: !prev[accId] }));
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin": return "系統管理員";
      case "high_level": return "高級運營";
      default: return "一般運營";
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 mb-2">系統工具與帳號資源</h2>
          <p className="text-muted-foreground">快速訪問核心系統並管理受保護的測試帳號。</p>
        </div>
        <Badge variant="outline" className="h-8 px-4 border-primary/20 bg-primary/5 text-primary font-bold">
          <ShieldAlert className="mr-2 h-4 w-4" />
          當前權限：{getRoleBadge(userRole)}
        </Badge>
      </section>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="搜尋系統名稱或功能..."
          className="pl-11 h-12 bg-white shadow-sm border-slate-200 focus:ring-primary"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <ScrollArea className="h-[calc(100vh-20rem)] rounded-2xl border bg-white/50 p-1">
        <div className="p-6">
          {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} className="h-48 animate-pulse bg-slate-100" />
                ))}
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredTools.map(tool => (
                <Card key={tool.id} className="border-slate-200 hover:shadow-md transition-all group">
                  <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                    <div className="space-y-1">
                      <CardTitle className="text-xl font-bold text-slate-900">{tool.name}</CardTitle>
                      <CardDescription>{tool.desc}</CardDescription>
                    </div>
                    {tool.url && (
                      <Button variant="ghost" size="icon" className="text-slate-400 hover:text-primary" asChild>
                        <a href={tool.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-5 w-5" />
                        </a>
                      </Button>
                    )}
                  </CardHeader>
                  
                  <CardContent>
                    {tool.accounts && tool.accounts.length > 0 ? (
                      <div className="space-y-3 mt-2">
                        <div className="flex items-center justify-between px-1">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">帳號資訊 ({tool.accounts.length})</span>
                        </div>
                        <ScrollArea className={cn(
                          "rounded-xl border border-slate-100 bg-slate-50/30 p-2",
                          tool.accounts.length > 3 ? "h-[280px]" : "h-auto"
                        )}>
                          <div className="space-y-3 pr-3">
                            {tool.accounts.map((acc, idx) => {
                              const accId = `${tool.id}-${idx}`;
                              const isRestricted = acc.is_sensitive && !canSeeSensitive;
                              
                              return (
                                <div key={accId} className="rounded-lg border border-slate-100 bg-white p-3 space-y-2.5 shadow-sm">
                                  <div className="flex items-center justify-between">
                                    <Badge variant="secondary" className="bg-slate-100 text-slate-500 border-none font-bold text-[9px]">
                                      {acc.role}
                                    </Badge>
                                    {acc.is_sensitive && <Lock className="h-3 w-3 text-orange-400" />}
                                  </div>

                                  {isRestricted ? (
                                    <div className="flex flex-col items-center justify-center py-2 text-center">
                                      <ShieldAlert className="h-4 w-4 text-slate-300 mb-1" />
                                      <p className="text-[9px] font-bold text-slate-400">僅限高級權限查看</p>
                                    </div>
                                  ) : (
                                    <div className="grid grid-cols-1 gap-2">
                                      <div className="flex items-center justify-between gap-2 px-2 py-1.5 rounded bg-slate-50/50 border border-slate-100 group/item">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                          <User className="h-3 w-3 text-slate-400 shrink-0" />
                                          <span className="text-[11px] font-mono font-bold text-slate-700 truncate">{acc.username}</span>
                                        </div>
                                        <Button 
                                          variant="ghost" 
                                          size="icon" 
                                          className="h-5 w-5 opacity-0 group-hover/item:opacity-100 transition-opacity"
                                          onClick={() => handleCopy(acc.username, `${accId}-u`)}
                                        >
                                          {copiedKey === `${accId}-u` ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                                        </Button>
                                      </div>

                                      <div className="flex items-center justify-between gap-2 px-2 py-1.5 rounded bg-slate-50/50 border border-slate-100 group/item">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                          <Key className="h-3 w-3 text-slate-400 shrink-0" />
                                          <span className="text-[11px] font-mono font-bold text-slate-700 truncate">
                                            {showPasswords[accId] ? acc.password : "••••••••••••"}
                                          </span>
                                        </div>
                                        <div className="flex gap-1 shrink-0">
                                          <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-5 w-5"
                                            onClick={() => togglePassword(accId)}
                                          >
                                            {showPasswords[accId] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                          </Button>
                                          <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-5 w-5 opacity-0 group-hover/item:opacity-100 transition-opacity"
                                            onClick={() => handleCopy(acc.password, `${accId}-p`)}
                                          >
                                            {copiedKey === `${accId}-p` ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </ScrollArea>
                      </div>
                    ) : (
                      <div className="pt-2">
                         <Button variant="outline" className="w-full font-bold group-hover:bg-primary group-hover:text-white transition-colors" asChild>
                           <a href={tool.url} target="_blank" rel="noopener noreferrer">
                             立即訪問系統
                             <ExternalLink className="ml-2 h-4 w-4" />
                           </a>
                         </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {!loading && filteredTools.length === 0 && (
            <div className="py-32 text-center space-y-4">
              <Wrench className="h-12 w-12 text-slate-100 mx-auto" />
              <p className="text-slate-500 font-bold">查無符合結果</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
