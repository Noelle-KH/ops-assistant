import { useState, useEffect } from "react";
import { Search, FileText, Mail, BookOpen, ArrowRight, Loader2 } from "lucide-react";
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
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  title: string;
  type: "FAQ" | "SOP" | "Template";
  category: string;
  path: string;
}

const API_BASE_URL = "http://localhost:3001";

export function GlobalSearch({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{ faqs: any[], sops: any[], templates: any[] }>({ faqs: [], sops: [], templates: [] });
  const navigate = useNavigate();

  useEffect(() => {
    if (open && data.faqs.length === 0) {
      fetchData();
    }
  }, [open]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [faqRes, sopRes, tplRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/faq`),
        fetch(`${API_BASE_URL}/api/sop`),
        fetch(`${API_BASE_URL}/api/templates`)
      ]);
      
      const [faqs, sops, templates] = await Promise.all([
        faqRes.json(),
        sopRes.json(),
        tplRes.json()
      ]);

      setData({ faqs, sops, templates });
    } catch (err) {
      console.error("Failed to fetch search data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const q = query.toLowerCase();
    const searchResults: SearchResult[] = [];

    // Search FAQs
    data.faqs.forEach(f => {
      const content = `${f.question} ${f.answer} ${f.ops_note || ""} ${f.tags.join(" ")}`.toLowerCase();
      if (content.includes(q)) {
        searchResults.push({
          id: f.id,
          title: f.question,
          type: "FAQ",
          category: f.category,
          path: `/knowledge-base?id=${f.id}&type=faq`
        });
      }
    });

    // Search SOPs
    data.sops.forEach(s => {
      const content = `${s.title} ${s.rule?.description || ""} ${s.tags.join(" ")}`.toLowerCase();
      if (content.includes(q)) {
        searchResults.push({
          id: s.id,
          title: s.title,
          type: "SOP",
          category: s.category,
          path: `/knowledge-base?id=${s.id}&type=sop`
        });
      }
    });

    // Search Templates
    data.templates.forEach(t => {
      const variantsContent = t.variants.map((v: any) => `${v.label} ${v.body}`).join(" ");
      const content = `${t.title} ${variantsContent} ${t.tags.join(" ")}`.toLowerCase();
      if (content.includes(q)) {
        searchResults.push({
          id: t.id,
          title: t.title,
          type: "Template",
          category: t.category,
          path: `/templates?id=${t.id}`
        });
      }
    });

    setResults(searchResults.slice(0, 10)); // Limit to 10 results
  }, [query, data]);

  const handleSelect = (path: string) => {
    navigate(path);
    onOpenChange(false);
    setQuery("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
        <DialogHeader className="p-4 border-b bg-slate-50/50">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <Input
              placeholder="搜尋跨模組內容 (FAQ, SOP, 郵件模板)..."
              className="pl-11 h-11 bg-white border-slate-200 focus:ring-primary rounded-xl text-base"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            {loading && (
              <Loader2 className="absolute right-3 top-3 h-5 w-5 text-slate-300 animate-spin" />
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="p-2">
            {results.length > 0 ? (
              <div className="space-y-1">
                {results.map((result) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleSelect(result.path)}
                    className="w-full text-left p-3 rounded-xl hover:bg-slate-100 transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "h-10 w-10 rounded-lg flex items-center justify-center shrink-0",
                        result.type === "FAQ" && "bg-blue-50 text-blue-500",
                        result.type === "SOP" && "bg-emerald-50 text-emerald-500",
                        result.type === "Template" && "bg-purple-50 text-purple-500",
                      )}>
                        {result.type === "FAQ" && <BookOpen className="h-5 w-5" />}
                        {result.type === "SOP" && <FileText className="h-5 w-5" />}
                        {result.type === "Template" && <Mail className="h-5 w-5" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <Badge variant="outline" className="text-[9px] font-black uppercase tracking-tighter px-1 h-4 border-slate-200 text-slate-400">
                            {result.type}
                          </Badge>
                          <span className="text-[10px] font-bold text-slate-400">{result.category}</span>
                        </div>
                        <p className="text-sm font-bold text-slate-900 truncate">{result.title}</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            ) : query.trim() ? (
              <div className="py-20 text-center space-y-3">
                <Search className="h-10 w-10 text-slate-100 mx-auto" />
                <p className="text-sm text-slate-400 font-medium">查無符合結果，請嘗試其他關鍵字</p>
              </div>
            ) : (
              <div className="py-12 px-6 space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">常見搜尋建議</p>
                <div className="flex flex-wrap gap-2">
                  {["入金", "出金", "SOP", "開戶", "爆倉"].map(tag => (
                    <button
                      key={tag}
                      onClick={() => setQuery(tag)}
                      className="px-3 py-1.5 rounded-lg bg-slate-50 text-xs font-bold text-slate-600 hover:bg-primary/10 hover:text-primary transition-colors border border-slate-100"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="p-4 border-t bg-slate-50/50 flex justify-between items-center text-[10px] text-slate-400 font-bold">
          <div className="flex gap-4">
            <span className="flex items-center gap-1"><kbd className="bg-white border rounded px-1">Esc</kbd> 關閉</span>
            <span className="flex items-center gap-1"><kbd className="bg-white border rounded px-1">Enter</kbd> 選擇</span>
          </div>
          <span>領航站 全域搜尋 v1.0</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
