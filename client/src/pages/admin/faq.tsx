import { useState, useEffect } from "react";
import { 
  Search, 
  Plus, 
  Edit2, 
  Eye, 
  EyeOff, 
  Save, 
  AlertCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AssociationSelector } from "@/components/association-selector";
import { cn, API_BASE_URL, fetchWithAuth } from "@/lib/utils";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  status: "active" | "disabled";
  updated_at: string;
  ops_note?: string;
  answer_en?: string;
  linked_sop?: string;
  linked_template?: string;
}

const CATEGORIES = ["開戶", "交易帳戶", "入金", "出金", "交易", "代理", "活動", "其他"];

export default function AdminFaqPage() {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentFaq, setCurrentFaq] = useState<Partial<FAQItem> | null>(null);
  const [tagInput, setTagInput] = useState("");

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/api/faq`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setFaqs(data);
      } else {
        setFaqs([]);
      }
    } catch (_err) {
      toast.error("無法載入 FAQ 資料");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchFaqs();
  }, []);

  const handleSave = async () => {
    if (!currentFaq?.question || !currentFaq?.answer || !currentFaq?.category) {
      toast.error("請填寫必要欄位 (問題、答案、分類)");
      return;
    }

    setIsSaving(true);
    // Process tags: support both English (,) and Chinese (，) commas
    const processedTags = tagInput
      .split(/[，,]/)
      .map(t => t.trim())
      .filter(Boolean);

    const admin = localStorage.getItem("user_name") || "Admin";
    let updatedFaqs = [...faqs];
    const now = new Date().toISOString().split('T')[0];

    if (currentFaq.id) {
      // Update
      updatedFaqs = updatedFaqs.map(f => 
        f.id === currentFaq.id ? { ...f, ...currentFaq, tags: processedTags, updated_at: now } as FAQItem : f
      );
    } else {
      // Create
      const newFaq: FAQItem = {
        ...currentFaq as any,
        id: `faq_${Date.now()}`,
        tags: processedTags,
        status: "active",
        updated_at: now
      };
      updatedFaqs.unshift(newFaq);
    }

    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/api/admin/update/faq`, {
        method: "POST",
        body: JSON.stringify({ data: updatedFaqs, admin })
      });

      if (res.ok) {
        setFaqs(updatedFaqs);
        setIsEditing(false);
        setCurrentFaq(null);
        setTagInput("");
        toast.success(currentFaq.id ? "FAQ 已更新" : "FAQ 已建立");
      } else {
        throw new Error();
      }
    } catch (err) {
      toast.error("儲存失敗，請檢查後端連線");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleStatus = async (id: string) => {
    const admin = localStorage.getItem("user_name") || "Admin";
    const updatedFaqs = faqs.map(f => {
      if (f.id === id) {
        return { ...f, status: f.status === "active" ? "disabled" : "active" as "active" | "disabled" };
      }
      return f;
    });

    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/api/admin/update/faq`, {
        method: "POST",
        body: JSON.stringify({ data: updatedFaqs, admin })
      });

      if (res.ok) {
        setFaqs(updatedFaqs);
        toast.info("狀態已變更");
      }
    } catch (err) {
      toast.error("操作失敗");
    }
  };

  const filteredFaqs = faqs.filter(f => 
    f.question.toLowerCase().includes(search.toLowerCase()) ||
    f.category.toLowerCase().includes(search.toLowerCase()) ||
    f.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder="搜尋 FAQ 內容、分類或標籤..."
            className="pl-10 h-10 rounded-xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button 
          onClick={() => {
            setCurrentFaq({ category: "開戶", tags: [] });
            setTagInput("");
            setIsEditing(true);
          }}
          className="rounded-xl font-bold shadow-lg shadow-primary/20"
        >
          <Plus className="mr-2 h-4 w-4" /> 新增 FAQ 項目
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-16rem)] rounded-2xl border bg-white shadow-sm">
        <div className="p-4 space-y-3">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 bg-slate-50 animate-pulse rounded-xl" />
            ))
          ) : filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq) => (
              <Card key={faq.id} className={cn(
                "p-4 border-slate-100 hover:border-primary/20 transition-all group",
                faq.status === "disabled" && "opacity-60 bg-slate-50/50"
              )}>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-wider">
                        {faq.category}
                      </Badge>
                      {faq.status === "disabled" && (
                        <Badge variant="outline" className="text-[10px] font-bold text-slate-400 border-slate-200">
                          已停用
                        </Badge>
                      )}
                      <span className="text-[10px] text-slate-400 font-medium">ID: {faq.id}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 leading-tight">{faq.question}</h3>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {faq.tags.map(tag => (
                        <span key={tag} className="text-[10px] text-slate-400">#{tag}</span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 shrink-0">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-slate-400 hover:text-primary"
                      onClick={() => {
                        setCurrentFaq(faq);
                        setTagInput(faq.tags.join(", "));
                        setIsEditing(true);
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className={cn(
                        "h-8 w-8 transition-colors",
                        faq.status === "active" ? "text-slate-400 hover:text-amber-500" : "text-amber-500 hover:text-emerald-500"
                      )}
                      onClick={() => toggleStatus(faq.id)}
                      title={faq.status === "active" ? "停用" : "啟用"}
                    >
                      {faq.status === "active" ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="py-20 text-center space-y-3">
              <AlertCircle className="h-10 w-10 text-slate-200 mx-auto" />
              <p className="text-slate-400 font-medium">沒有找到相應的 FAQ</p>
            </div>
          )}
        </div>
      </ScrollArea>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">
              {currentFaq?.id ? "編輯 FAQ 項目" : "新增 FAQ 項目"}
            </DialogTitle>
            <DialogDescription>
              請填寫 FAQ 的詳細資訊，包含問題、分類及標準回答。
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">分類</Label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCurrentFaq(prev => ({ ...prev!, category: cat }))}
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold border transition-all",
                        currentFaq?.category === cat 
                          ? "bg-primary text-white border-primary shadow-sm shadow-primary/20" 
                          : "bg-white text-slate-500 border-slate-200 hover:border-primary/50"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">標籤 (以逗號分隔)</Label>
                <Input 
                  placeholder="如: 開戶, 年齡, 審核"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">問題標題 (Question)</Label>
              <Input 
                placeholder="輸入問題描述..."
                value={currentFaq?.question || ""}
                onChange={(e) => setCurrentFaq(prev => ({ ...prev!, question: e.target.value }))}
                className="rounded-xl font-bold"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">標準回答 (Answer)</Label>
              <Textarea 
                placeholder="輸入運營標準回覆內容..."
                className="min-h-[120px] rounded-xl leading-relaxed"
                value={currentFaq?.answer || ""}
                onChange={(e) => setCurrentFaq(prev => ({ ...prev!, answer: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">運營備註 (Ops Note)</Label>
                <Textarea 
                  placeholder="內部注意事項..."
                  className="min-h-[80px] rounded-xl text-xs"
                  value={currentFaq?.ops_note || ""}
                  onChange={(e) => setCurrentFaq(prev => ({ ...prev!, ops_note: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">英文回答 (English Reply)</Label>
                <Textarea 
                  placeholder="English version..."
                  className="min-h-[80px] rounded-xl text-xs italic font-serif"
                  value={currentFaq?.answer_en || ""}
                  onChange={(e) => setCurrentFaq(prev => ({ ...prev!, answer_en: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AssociationSelector 
                type="sop"
                label="關聯 SOP"
                maxSelections={1}
                selectedIds={currentFaq?.linked_sop ? [currentFaq.linked_sop] : []}
                onChange={(ids) => setCurrentFaq(prev => ({ ...prev!, linked_sop: ids[0] || "" }))}
              />
              <AssociationSelector 
                type="template"
                label="關聯郵件模板"
                maxSelections={1}
                selectedIds={currentFaq?.linked_template ? [currentFaq.linked_template] : []}
                onChange={(ids) => setCurrentFaq(prev => ({ ...prev!, linked_template: ids[0] || "" }))}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsEditing(false)} className="rounded-xl font-bold">
              取消
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="rounded-xl font-bold px-8">
              <Save className="mr-2 h-4 w-4" /> {isSaving ? "處理中..." : "儲存變更"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
