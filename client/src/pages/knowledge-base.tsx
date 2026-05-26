import { useState, useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { Search, Info, Globe, ExternalLink, Mail, ChevronRight, BookOpen, ArrowUpDown } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { API_BASE_URL, fetchWithAuth, cn } from "@/lib/utils";

  // --- Interfaces ---
interface FAQItem {
  id: string;
  category: string;
  tags: string[];
  question: string;
  answer: string;
  ops_note?: string;
  answer_en?: string;
  linked_sop?: string;
  linked_template?: string;
  updated_at: string;
  status: "active" | "disabled";
  sort_order?: number;
}

interface SOPItem {
  id: string;
  title: string;
  category: string;
  tags: string[];
  rule: {
    description: string;
    conditions: string[];
    restrictions: string[];
  };
  operation: {
    steps: { step: number; action: string; path?: string }[];
  };
  exceptions: { scenario: string; handling: string }[];
  linked_faq?: string[];
  linked_template?: string[];
  updated_at: string;
  status: "active" | "disabled";
  sort_order?: number;
}

// --- Constants ---
const FAQ_CATEGORIES = ["全部", "開戶", "交易帳戶", "入金", "出金", "交易", "代理", "活動"];

type SortMethod = "default" | "newest";

export default function KnowledgeBasePage() {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [sops, setSops] = useState<SOPItem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("全部");
  const [loading, setLoading] = useState(true);
  const [showEnglish, setShowEnglish] = useState<Record<string, boolean>>({});
  const [sortMethod, setSortMethod] = useState<SortMethod>("default");
  
  // Role based access
  const userRole = sessionStorage.getItem("user_role") || "operator";
  const canSeeOpsNote = userRole === "admin" || userRole === "high-level";

  // URL Params & Search Params
  const params = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const targetId = searchParams.get("id");
  const targetType = searchParams.get("type");

  // SOP Dialog State
  const [activeSop, setActiveSop] = useState<SOPItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Accordion State
  const [expandedFaq, setExpandedFaq] = useState<string>("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [faqRes, sopRes] = await Promise.all([
        fetchWithAuth(`${API_BASE_URL}/api/faq`),
        fetchWithAuth(`${API_BASE_URL}/api/sop`)
      ]);
      const faqData = await faqRes.json();
      const sopData = await sopRes.json();
      
      if (Array.isArray(faqData)) setFaqs(faqData);
      
      if (Array.isArray(sopData)) {
        const activeSops = sopData.filter((s: SOPItem) => s.status !== "disabled");
        setSops(activeSops);

        // 1. Handle direct SOP path linking (from routes)
        if (params.id) {
          const foundSop = activeSops.find((s: SOPItem) => s.id === params.id);
          if (foundSop) {
            setActiveSop(foundSop);
            setIsDialogOpen(true);
          }
        }

        // 2. Handle Search Params linking (from templates/other)
        if (targetId && targetType === "sop") {
          const foundSop = activeSops.find((s: SOPItem) => s.id === targetId);
          if (foundSop) {
            setActiveSop(foundSop);
            setIsDialogOpen(true);
          }
        } else if (targetId && targetType === "faq") {
          setExpandedFaq(targetId);
        }
      }

    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch FAQs & SOPs
  useEffect(() => {
    fetchData();
  }, [params.id, targetId, targetType]);

  // Filtered FAQ list
  const filteredFaqs = faqs.filter(faq => {
    if (faq.status === "disabled") return false;
    
    // If a specific FAQ is targeted via URL, show only that one
    if (targetId && targetType === "faq") {
      return faq.id === targetId;
    }

    const matchesSearch = 
      faq.question.toLowerCase().includes(search.toLowerCase()) ||
      faq.answer.toLowerCase().includes(search.toLowerCase()) ||
      faq.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
    
    const matchesCategory = selectedCategory === "全部" || faq.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (sortMethod === "default") {
      return (a.sort_order || 0) - (b.sort_order || 0);
    } else {
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    }
  });

  const handleOpenSop = (sopId: string) => {
    const sop = sops.find(s => s.id === sopId && s.status !== "disabled");
    if (sop) {
      setActiveSop(sop);
      setIsDialogOpen(true);
    }
  };

  // Render SOP Content (Inside Dialog)
  const renderSopContent = (sop: SOPItem) => (
    <Tabs defaultValue="rules" className="w-full flex flex-col">
      <div className="flex justify-center mb-8">
        <TabsList className="h-11 inline-flex items-center justify-center rounded-lg bg-slate-100 p-1 text-slate-500 w-full max-w-md border border-slate-200/60 shadow-inner">
          <TabsTrigger value="rules" className="flex-1 rounded-md px-6 py-1.5 text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all">規則與條件</TabsTrigger>
          <TabsTrigger value="operation" className="flex-1 rounded-md px-6 py-1.5 text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all">操作步驟</TabsTrigger>
          <TabsTrigger value="exceptions" className="flex-1 rounded-md px-6 py-1.5 text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all">例外處理</TabsTrigger>
        </TabsList>
      </div>
      
      <div className="flex-1 overflow-visible">
        <TabsContent value="rules" className="mt-0 animate-in fade-in duration-300 outline-none space-y-8">
          <div className="rounded-2xl bg-primary/[0.02] p-8 border border-primary/10 shadow-sm relative overflow-hidden">
            <div className="absolute -right-6 -top-6 h-32 w-32 bg-primary/[0.04] rounded-full" />
            <h4 className="text-sm font-black mb-3 flex items-center gap-2 text-primary uppercase tracking-widest">
              <Info className="h-4 w-4" />
              核心目標
            </h4>
            <p className="text-base text-slate-700 leading-relaxed font-semibold relative z-10">
              {sop.rule.description}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-xs font-black flex items-center gap-2 px-1 text-slate-800 uppercase tracking-[0.2em]">
                <div className="h-1 w-3 rounded-full bg-primary" />
                適用條件
              </h4>
              <ul className="space-y-3">
                {sop.rule.conditions.map((cond, i) => (
                  <li key={i} className="text-sm text-slate-600 flex items-start gap-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100/80 shadow-sm">
                    <div className="h-5 w-5 rounded-full bg-white text-primary flex items-center justify-center shrink-0 mt-0.5 border border-slate-100">
                      <ChevronRight className="h-3 w-3" />
                    </div>
                    <span className="leading-relaxed font-medium">{cond}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-xs font-black flex items-center gap-2 px-1 text-red-700 uppercase tracking-[0.2em]">
                <div className="h-1 w-3 rounded-full bg-red-500" />
                操作限制
              </h4>
              <div className="rounded-xl border border-red-100/60 bg-red-50/20 p-5 space-y-3 shadow-sm">
                {sop.rule.restrictions.map((rest, i) => (
                  <div key={i} className="text-sm text-red-800/70 flex items-start gap-3">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-red-400 shrink-0" />
                    <span className="font-semibold leading-relaxed">{rest}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="operation" className="mt-0 animate-in fade-in duration-300 outline-none">
          <div className="bg-slate-50/40 p-8 rounded-[2.5rem] border border-slate-100 shadow-inner">
            <div className="space-y-0">
              {sop.operation.steps.map((step) => (
                <div key={step.step} className="group relative pl-16 pb-12 last:pb-0">
                  {/* Precise Timeline Line */}
                  <div className="absolute left-[19px] top-2 bottom-0 w-[2px] bg-slate-200 group-last:hidden" />
                  
                  {/* Precise Timeline Dot */}
                  <div className="absolute left-0 top-0 h-10 w-10 rounded-full border-4 border-white bg-primary text-white flex items-center justify-center z-10 shadow-md group-hover:scale-110 transition-transform duration-300">
                    <span className="text-sm font-black">{step.step}</span>
                  </div>
                  
                  <div className="space-y-4 pt-1.5">
                    <p className="text-lg font-extrabold text-slate-900 leading-tight group-hover:text-primary transition-colors">
                      {step.action}
                    </p>
                    {step.path && (
                      <div className="rounded-xl bg-white p-4 border border-slate-200/80 font-mono text-sm flex items-center gap-3 shadow-sm group-hover:border-primary/30 transition-all overflow-x-auto no-scrollbar whitespace-nowrap">
                        <div className="flex items-center gap-1 shrink-0 px-2 py-0.5 rounded bg-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                          Path
                        </div>
                        <code className="text-primary font-bold">{step.path}</code>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="exceptions" className="mt-0 animate-in fade-in duration-300 outline-none space-y-6">
          {sop.exceptions.length > 0 ? (
            sop.exceptions.map((exc, i) => (
              <div key={i} className="rounded-2xl border border-orange-100 bg-orange-50/20 p-6 space-y-5 hover:border-orange-200 transition-all shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="h-6 px-2 rounded bg-orange-100 text-orange-700 text-[10px] font-black uppercase flex items-center">Scenario {i + 1}</div>
                  <p className="text-base font-black text-orange-950">{exc.scenario}</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-orange-100/50 shadow-sm flex gap-4">
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <div className="w-1 flex-1 bg-orange-100 rounded-full" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest">建議處理方式</p>
                    <p className="text-sm text-slate-700 leading-relaxed font-semibold">
                      {exc.handling}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-slate-200 rounded-3xl space-y-4">
              <Info className="h-10 w-10 text-slate-100" />
              <p className="text-sm text-slate-400 font-medium italic">目前無已知例外情況</p>
            </div>
          )}
        </TabsContent>
      </div>
    </Tabs>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">知識庫</h2>
            <p className="text-muted-foreground text-sm">查找標準回覆、運營備注與關聯流程。</p>
          </div>
          <BookOpen className="h-10 w-10 text-slate-100" />
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜尋問題、內容或標籤..."
              className="pl-10 h-11 bg-white shadow-sm border-slate-200 focus:border-primary rounded-xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Select value={sortMethod} onValueChange={(v) => setSortMethod(v as SortMethod)}>
              <SelectTrigger className="w-[140px] h-11 rounded-xl bg-white shadow-sm border-slate-200 font-bold text-slate-600">
                <ArrowUpDown className="mr-2 h-4 w-4 text-slate-400" />
                <SelectValue placeholder="排序方式" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default" className="font-bold">預設排序</SelectItem>
                <SelectItem value="newest" className="font-bold">最新更新</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
              {FAQ_CATEGORIES.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  className="whitespace-nowrap rounded-full px-4 h-9 font-bold"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 rounded-2xl border bg-white shadow-sm overflow-hidden">
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">載入資料中...</p>
            </div>
          ) : filteredFaqs.length > 0 ? (
            <Accordion 
              type="single" 
              collapsible 
              className="w-full space-y-4"
              value={expandedFaq}
              onValueChange={setExpandedFaq}
            >
              {filteredFaqs.map((faq) => (
                <AccordionItem
                  key={faq.id}
                  value={faq.id}
                  className="border rounded-xl px-6 bg-background hover:bg-slate-50/40 transition-all"
                >
                  <AccordionTrigger className="hover:no-underline py-6 text-left">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="font-bold text-[10px] px-1.5 h-5 uppercase tracking-wider">
                          {faq.category}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground font-medium">
                          最後更新：{faq.updated_at}
                        </span>
                      </div>
                      <span className="font-bold text-lg leading-snug text-slate-900">{faq.question}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-10 pt-2 space-y-6 !overflow-visible !h-auto">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {faq.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-[9px] font-bold text-slate-400 rounded-lg bg-slate-50/50 border-slate-200 px-2 h-5">
                          #{tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="p-6 rounded-xl bg-slate-50 border border-slate-100 text-base leading-relaxed whitespace-pre-wrap text-slate-700 font-medium">
                      {faq.answer}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                      {faq.ops_note && canSeeOpsNote && (
                        <div className="p-4 rounded-xl bg-orange-50/50 border border-orange-100 flex gap-3 shadow-sm h-fit">
                          <Info className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <p className="text-[10px] font-black text-orange-700 uppercase tracking-widest">運營備注</p>
                            <p className="text-sm text-orange-800/90 leading-relaxed">{faq.ops_note}</p>
                          </div>
                        </div>
                      )}

                      {faq.answer_en && (
                        <div className="space-y-4">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 px-2 text-[10px] font-black text-blue-600 hover:bg-blue-50 gap-1.5"
                            onClick={() => setShowEnglish(prev => ({ ...prev, [faq.id]: !prev[faq.id] }))}
                          >
                            <Globe className="h-3 w-3" />
                            {showEnglish[faq.id] ? "隱藏英文回覆" : "顯示英文回覆"}
                          </Button>
                          
                          {showEnglish[faq.id] && (
                            <div className="p-5 rounded-xl bg-blue-50/30 border border-blue-100 flex gap-4 shadow-sm animate-in slide-in-from-top-2 duration-300">
                              <Globe className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                              <div className="space-y-1.5">
                                <p className="text-[10px] font-black text-blue-700 uppercase tracking-widest">English Reply</p>
                                <p className="text-sm text-blue-800/90 leading-relaxed italic font-medium">{faq.answer_en}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {(faq.linked_sop || faq.linked_template) && (
                      <div className="flex items-center gap-4 pt-6 border-t border-slate-100">
                        {faq.linked_sop && (
                          <Button
                            variant="default"
                            size="sm"
                            className="h-9 px-4 font-bold shadow-md shadow-primary/20"
                            onClick={() => handleOpenSop(faq.linked_sop!)}
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            查看操作 SOP
                          </Button>
                        )}
                        {faq.linked_template && (
                          <Button asChild variant="outline" size="sm" className="h-9 px-4 font-bold border-purple-200 text-purple-700 hover:bg-purple-50">
                            <Link to={`/templates?id=${faq.linked_template}`}>
                              <Mail className="mr-2 h-4 w-4" />
                              使用郵件模板
                            </Link>
                          </Button>
                        )}
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 text-center space-y-4">
              <Search className="h-12 w-12 text-slate-100" />
              <div className="space-y-1">
                <p className="text-slate-500 font-bold">查無符合結果</p>
                <p className="text-xs text-slate-400">請嘗試更換搜尋關鍵字或分類</p>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* SOP Detailed Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-8 rounded-2xl">
          {activeSop && (
            <>
              <DialogHeader className="space-y-4 pr-6">
                <div className="flex items-center gap-3">
                  <Badge className="bg-primary/10 text-primary border-none px-2 h-6 text-[10px] font-bold">
                    SOP: {activeSop.category}
                  </Badge>
                  <span className="text-[10px] font-medium text-slate-400">
                    最後更新：{activeSop.updated_at}
                  </span>
                </div>
                <DialogTitle className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
                  {activeSop.title}
                </DialogTitle>
                <DialogDescription className="text-base text-slate-500 leading-relaxed">
                  請遵循以下標準流程進行操作。如遇到例外情境，請優先參考「例外處理」分頁。
                </DialogDescription>
              </DialogHeader>
              {renderSopContent(activeSop)}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
