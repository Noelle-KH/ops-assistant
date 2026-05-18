import { useState, useEffect, useCallback } from "react";
import { Search, FileText, Mail, BookOpen, ArrowRight, Loader2, AlertCircle, RefreshCw, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { cn, API_BASE_URL } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SearchResult {
  id: string;
  title: string;
  type: "FAQ" | "SOP" | "Template";
  category: string;
  path: string;
  snippet?: string;
}

export function GlobalSearch({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [data, setData] = useState<{ faqs: any[], sops: any[], templates: any[] }>({ 
    faqs: [], 
    sops: [], 
    templates: [] 
  });
  
  const navigate = useNavigate();

  // 當視窗關閉時清除搜尋內容
  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
    }
  }, [open]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 嘗試獲取所有數據，使用 Promise.allSettled 以免單個失敗導致全部失敗
      const results = await Promise.allSettled([
        fetch(`${API_BASE_URL}/api/faq`).then(res => res.json()),
        fetch(`${API_BASE_URL}/api/sop`).then(res => res.json()),
        fetch(`${API_BASE_URL}/api/templates`).then(res => res.json())
      ]);
      
      const faqs = results[0].status === 'fulfilled' ? results[0].value : [];
      const sops = results[1].status === 'fulfilled' ? results[1].value : [];
      const templates = results[2].status === 'fulfilled' ? results[2].value : [];

      if (results.every(r => r.status === 'rejected')) {
        throw new Error("無法連接到伺服器，請檢查網路連線。");
      }

      setData({ faqs, sops, templates });
      setDataLoaded(true);
    } catch (err: any) {
      console.error("Failed to fetch search data:", err);
      setError(err.message || "載入搜尋資料失敗");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open && !dataLoaded && !loading) {
      fetchData();
    }
  }, [open, dataLoaded, loading, fetchData]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const q = query.trim().toLowerCase();
    if (!q) {
      setResults([]);
      return;
    }

    const searchResults: SearchResult[] = [];

    // Search FAQs
    if (Array.isArray(data.faqs)) {
      data.faqs.forEach(f => {
        const question = (f.question || "").toLowerCase();
        const answer = (f.answer || "").toLowerCase();
        const category = (f.category || "").toLowerCase();
        const opsNote = (f.ops_note || "").toLowerCase();
        
        // 更強大的標籤搜尋：支援陣列與字串格式
        let tagsStr = "";
        if (Array.isArray(f.tags)) {
          tagsStr = f.tags.join(" ").toLowerCase();
        } else if (typeof f.tags === "string") {
          tagsStr = f.tags.toLowerCase();
        }
        
        if (
          question.includes(q) || 
          answer.includes(q) || 
          tagsStr.includes(q) || 
          opsNote.includes(q) ||
          category.includes(q)
        ) {
          searchResults.push({
            id: f.id,
            title: f.question,
            type: "FAQ",
            category: f.category || "未分類",
            path: `/knowledge-base?id=${f.id}&type=faq`,
            snippet: (f.answer || "").substring(0, 60) + ((f.answer || "").length > 60 ? "..." : "")
          });
        }
      });
    }

    // Search SOPs
    if (Array.isArray(data.sops)) {
      data.sops.forEach(s => {
        const title = (s.title || "").toLowerCase();
        const category = (s.category || "").toLowerCase();
        const description = (s.rule?.description || "").toLowerCase();
        
        let tagsStr = "";
        if (Array.isArray(s.tags)) {
          tagsStr = s.tags.join(" ").toLowerCase();
        } else if (typeof s.tags === "string") {
          tagsStr = s.tags.toLowerCase();
        }
        
        if (title.includes(q) || description.includes(q) || tagsStr.includes(q) || category.includes(q)) {
          searchResults.push({
            id: s.id,
            title: s.title,
            type: "SOP",
            category: s.category || "未分類",
            path: `/knowledge-base?id=${s.id}&type=sop`,
            snippet: (s.rule?.description || "").substring(0, 60) + ((s.rule?.description || "").length > 60 ? "..." : "")
          });
        }
      });
    }

    // Search Templates
    if (Array.isArray(data.templates)) {
      data.templates.forEach(t => {
        const title = (t.title || "").toLowerCase();
        const tags = Array.isArray(t.tags) ? t.tags.join(" ").toLowerCase() : "";
        const variantsContent = Array.isArray(t.variants) 
          ? t.variants.map((v: any) => `${v.label} ${v.body}`).join(" ").toLowerCase()
          : "";
        
        if (title.includes(q) || variantsContent.includes(q) || tags.includes(q)) {
          searchResults.push({
            id: t.id,
            title: t.title,
            type: "Template",
            category: t.category || "未分類",
            path: `/templates?id=${t.id}`,
            snippet: t.variants?.[0]?.body?.substring(0, 60) + (t.variants?.[0]?.body?.length > 60 ? "..." : "")
          });
        }
      });
    }

    setResults(searchResults.slice(0, 10)); // Limit to 10 results
  }, [query, data]);

  const handleSelect = (path: string) => {
    navigate(path);
    onOpenChange(false);
    setQuery("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden border-none shadow-2xl rounded-2xl bg-white/95 backdrop-blur-xl">
        <DialogHeader className="p-4 border-b bg-slate-50/50">
          <DialogTitle className="sr-only">全域搜尋</DialogTitle>
          <div className="relative">
            <Search className={cn(
              "absolute left-3 top-3 h-5 w-5 transition-colors",
              loading ? "text-primary animate-pulse" : "text-slate-400"
            )} />
            <Input
              placeholder="搜尋跨模組內容 (FAQ, SOP, 郵件模板)..."
              className="pl-11 h-11 bg-white border-slate-200 focus:ring-primary rounded-xl text-base shadow-sm"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            {loading && (
              <div className="absolute right-3 top-3 flex items-center gap-2">
                <Loader2 className="h-5 w-5 text-primary animate-spin" />
              </div>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="p-2">
            {error ? (
              <div className="py-12 text-center space-y-4">
                <div className="h-12 w-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-900">{error}</p>
                  <p className="text-xs text-slate-500">請確認後端伺服器已啟動並可從此網址存取</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchData}
                  className="gap-2 font-bold rounded-lg"
                >
                  <RefreshCw className="h-4 w-4" />
                  重試
                </Button>
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-1">
                {results.map((result) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleSelect(result.path)}
                    className="w-full text-left p-3 rounded-xl hover:bg-slate-100/80 transition-all flex items-center justify-between group active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "h-12 w-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-white",
                        result.type === "FAQ" && "bg-blue-50 text-blue-500",
                        result.type === "SOP" && "bg-emerald-50 text-emerald-500",
                        result.type === "Template" && "bg-purple-50 text-purple-500",
                      )}>
                        {result.type === "FAQ" && <BookOpen className="h-6 w-6" />}
                        {result.type === "SOP" && <FileText className="h-6 w-6" />}
                        {result.type === "Template" && <Mail className="h-6 w-6" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className={cn(
                            "text-[9px] font-black uppercase tracking-tighter px-1.5 h-4.5 border-none",
                            result.type === "FAQ" && "bg-blue-100 text-blue-600",
                            result.type === "SOP" && "bg-emerald-100 text-emerald-600",
                            result.type === "Template" && "bg-purple-100 text-purple-600",
                          )}>
                            {result.type}
                          </Badge>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{result.category}</span>
                        </div>
                        <p className="text-sm font-black text-slate-900 truncate mb-0.5">{result.title}</p>
                        {result.snippet && (
                          <p className="text-[11px] text-slate-500 truncate font-medium">{result.snippet}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300 group-hover:text-primary transition-colors">
                      <span className="text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">查看詳情</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-all" />
                    </div>
                  </button>
                ))}
              </div>
            ) : query.trim() ? (
              <div className="py-20 text-center space-y-3">
                <div className="h-16 w-16 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto">
                  <Search className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-slate-500 font-bold">查無符合結果</p>
                  <p className="text-xs text-slate-400">請嘗試更換關鍵字，例如「入金」、「出金」或「SOP」</p>
                </div>
              </div>
            ) : (
              <div className="py-12 px-8">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">熱門搜尋建議</p>
                <div className="flex flex-wrap gap-2.5">
                  {["入金", "出金", "SOP", "開戶", "爆倉", "MT4", "MT5", "點差"].map(tag => (
                    <button
                      key={tag}
                      onClick={() => setQuery(tag)}
                      className="px-4 py-2 rounded-xl bg-white text-xs font-bold text-slate-600 hover:bg-primary hover:text-white transition-all border border-slate-100 shadow-sm hover:shadow-md hover:shadow-primary/20 active:scale-95"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                
                <div className="mt-12 p-4 rounded-2xl bg-primary/[0.03] border border-primary/10 flex items-start gap-3">
                  <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-[11px] font-black text-primary uppercase">搜尋技巧</p>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                      您可以直接搜尋問題關鍵字、流程名稱或是標籤內容。系統將同時檢索知識庫與郵件模板。
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="p-4 border-t bg-slate-50/50 flex justify-between items-center text-[10px] text-slate-400 font-bold">
          <div className="flex gap-4">
            <span className="flex items-center gap-1.5"><kbd className="bg-white border border-slate-200 rounded px-1.5 py-0.5 shadow-sm">Esc</kbd> 關閉</span>
            <span className="flex items-center gap-1.5"><kbd className="bg-white border border-slate-200 rounded px-1.5 py-0.5 shadow-sm">Enter</kbd> 選擇</span>
            <span className="flex items-center gap-1.5"><kbd className="bg-white border border-slate-200 rounded px-1.5 py-0.5 shadow-sm">Ctrl+K</kbd> 呼叫</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>領航站 全域搜尋 v1.2</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
