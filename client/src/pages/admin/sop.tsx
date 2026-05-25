import { useState, useEffect } from "react";
import { 
  Search, 
  Plus, 
  Edit2, 
  Eye, 
  EyeOff, 
  Save, 
  ChevronRight,
  ChevronLeft,
  Trash2,
  FileText,
  ListOrdered,
  Zap
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
import { cn, API_BASE_URL, fetchWithAuth } from "@/lib/utils";
import { AssociationSelector } from "@/components/association-selector";

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

export default function AdminSopPage() {
  const [sops, setSops] = useState<SOPItem[]>([]);
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSop, setCurrentSop] = useState<Partial<SOPItem> | null>(null);
  const [activeStep, setActiveStep] = useState<"basic" | "steps" | "exceptions">("basic");
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  // Filter categories for SOP display
  const sopCategories = allCategories.filter(c => c.type === "sop");
  const displayCategories = sopCategories.length > 0 ? sopCategories.map(c => c.name) : ["一般"];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sopRes, catRes] = await Promise.all([
        fetchWithAuth(`${API_BASE_URL}/api/sop`),
        fetchWithAuth(`${API_BASE_URL}/api/categories`)
      ]);
      
      const sopData = await sopRes.json();
      const catData = await catRes.json();
      
      if (Array.isArray(sopData)) setSops(sopData);
      if (Array.isArray(catData)) setAllCategories(catData);
    } catch (_err) {
      toast.error("無法載入資料");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  const initNewSop = () => {
    setCurrentSop({
      title: "",
      category: displayCategories[0] || "帳戶管理",
      tags: [],
      rule: { description: "", conditions: [""], restrictions: [""] },
      operation: { steps: [{ step: 1, action: "", path: "" }] },
      exceptions: [{ scenario: "", handling: "" }],
      linked_faq: [],
      linked_template: [],
      status: "active"
    });
    setActiveStep("basic");
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!currentSop?.title || !currentSop?.category) {
      toast.error("請填寫標題與分類");
      return;
    }

    setIsSaving(true);
    const admin = localStorage.getItem("user_name") || "Admin";
    const now = new Date().toISOString().split('T')[0];

    // 1. Handle Categories Update if new one added
    let updatedCategories = [...allCategories];
    const categoryExists = allCategories.some(c => c.name === currentSop.category && c.type === "sop");
    
    if (!categoryExists) {
      const newCat = {
        id: `cat_sop_${Date.now()}`,
        name: currentSop.category,
        type: "sop",
        sort_order: 0
      };
      updatedCategories.push(newCat);
      
      try {
        await fetchWithAuth(`${API_BASE_URL}/api/admin/update/categories`, {
          method: "POST",
          body: JSON.stringify({ data: updatedCategories, admin })
        });
        setAllCategories(updatedCategories);
      } catch (err) {
        console.error("Failed to save new category:", err);
      }
    }

    // 2. Clean up empty steps/conditions/exceptions
    const cleanedSop = {
      ...currentSop,
      rule: {
        ...currentSop.rule!,
        conditions: currentSop.rule!.conditions.filter(c => c.trim()),
        restrictions: currentSop.rule!.restrictions.filter(r => r.trim()),
      },
      operation: {
        steps: currentSop.operation!.steps
          .filter(s => s.action.trim())
          .map((s, i) => ({ ...s, step: i + 1 }))
      },
      exceptions: currentSop.exceptions!.filter(e => e.scenario.trim() || e.handling.trim()),
      updated_at: now
    };

    let updatedSops = [...sops];
    if (cleanedSop.id) {
      updatedSops = updatedSops.map(s => s.id === cleanedSop.id ? cleanedSop as SOPItem : s);
    } else {
      const newSop = { ...cleanedSop, id: `sop_${Date.now()}` } as SOPItem;
      updatedSops.unshift(newSop);
    }

    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/api/admin/update/sop`, {
        method: "POST",
        body: JSON.stringify({ data: updatedSops, admin })
      });

      if (res.ok) {
        setSops(updatedSops);
        setIsEditing(false);
        setCurrentSop(null);
        setIsAddingNewCategory(false);
        setNewCategoryName("");
        toast.success("SOP 儲存成功");
      }
    } catch (err) {
      toast.error("儲存失敗");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleStatus = async (id: string) => {
    const admin = localStorage.getItem("user_name") || "Admin";
    const updatedSops = sops.map(s => {
      if (s.id === id) {
        return { ...s, status: s.status === "active" ? "disabled" : "active" as any };
      }
      return s;
    });

    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/api/admin/update/sop`, {
        method: "POST",
        body: JSON.stringify({ data: updatedSops, admin })
      });
      if (res.ok) {
        setSops(updatedSops);
        toast.info("狀態已更新");
      }
    } catch (err) {
      toast.error("操作失敗");
    }
  };

  const addArrayItem = (path: "conditions" | "restrictions" | "steps" | "exceptions") => {
    const updated = { ...currentSop! };
    if (path === "conditions") updated.rule!.conditions.push("");
    if (path === "restrictions") updated.rule!.restrictions.push("");
    if (path === "steps") updated.operation!.steps.push({ step: updated.operation!.steps.length + 1, action: "", path: "" });
    if (path === "exceptions") updated.exceptions!.push({ scenario: "", handling: "" });
    setCurrentSop(updated);
  };

  const removeArrayItem = (path: "conditions" | "restrictions" | "steps" | "exceptions", index: number) => {
    const updated = { ...currentSop! };
    if (path === "conditions") updated.rule!.conditions.splice(index, 1);
    if (path === "restrictions") updated.rule!.restrictions.splice(index, 1);
    if (path === "steps") updated.operation!.steps.splice(index, 1);
    if (path === "exceptions") updated.exceptions!.splice(index, 1);
    setCurrentSop(updated);
  };

  const filteredSops = sops.filter(s => 
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="搜尋 SOP 標題或分類..."
            className="pl-10 h-11 rounded-xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button onClick={initNewSop} className="rounded-xl h-11 font-bold shadow-lg shadow-primary/20">
          <Plus className="mr-2 h-4 w-4" /> 建立新 SOP
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-16rem)] rounded-2xl border bg-white shadow-sm">
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-40 bg-slate-50 animate-pulse rounded-2xl" />
            ))
          ) : filteredSops.map((sop) => (
            <Card key={sop.id} className={cn(
              "p-5 border-slate-100 hover:border-primary/20 transition-all h-48 flex flex-col",
              sop.status === "disabled" && "opacity-60 bg-slate-50/50"
            )}>
              <div className="flex justify-between items-start mb-2 shrink-0">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px] font-bold uppercase shrink-0">{sop.category}</Badge>
                    <code className="text-[9px] font-mono bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200 truncate">ID: {sop.id}</code>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-primary" onClick={() => {
                    setCurrentSop(sop);
                    setActiveStep("basic");
                    setIsEditing(true);
                  }}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-amber-500" onClick={() => toggleStatus(sop.id)}>
                    {sop.status === "active" ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <ScrollArea className="flex-1 pr-4 mb-2">
                <h3 className="text-lg font-black text-slate-900 leading-tight">{sop.title}</h3>
                <p className="text-xs text-slate-500 mt-2 line-clamp-2">{sop.rule.description}</p>
              </ScrollArea>

              <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-50 text-[10px] font-bold text-slate-400 shrink-0">
                <span>{sop.operation.steps.length} 個步驟</span>
                <span>更新於 {sop.updated_at}</span>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-4xl h-[90vh] overflow-hidden flex flex-col p-0 rounded-2xl border-none">
          <DialogHeader className="p-6 border-b bg-slate-50/50 shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-black flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                {currentSop?.id ? "編輯 SOP 流程" : "建立新 SOP 流程"}
              </DialogTitle>
              <DialogDescription className="sr-only">
                SOP 編輯表單，包含規則條件、操作步驟與例外處理。
              </DialogDescription>
              <div className="flex flex-wrap items-center bg-white border rounded-lg p-1 gap-1">
                {[
                  { id: "basic", label: "1. 規則", icon: FileText },
                  { id: "steps", label: "2. 步驟", icon: ListOrdered },
                  { id: "exceptions", label: "3. 例外", icon: Zap },
                ].map((step) => (
                  <button
                    key={step.id}
                    onClick={() => setActiveStep(step.id as any)}
                    className={cn(
                      "px-2 md:px-4 py-1.5 text-[10px] md:text-xs font-bold rounded-md transition-all flex items-center gap-1 md:gap-2",
                      activeStep === step.id ? "bg-primary text-white shadow-sm" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    <step.icon className="h-3 md:h-3.5 w-3 md:w-3.5" />
                    <span className="hidden sm:inline">{step.label}</span>
                    <span className="sm:hidden">{step.label.split(". ")[1]}</span>
                  </button>
                ))}
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="p-4 md:p-8">
              {activeStep === "basic" && currentSop && (
                <div className="space-y-6 md:space-y-8 animate-in slide-in-from-right-4 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">SOP 標題</Label>
                      <Input 
                        placeholder="如: 負餘額保護修復流程" 
                        className="h-11 rounded-xl font-bold"
                        value={currentSop.title}
                        onChange={e => setCurrentSop({...currentSop, title: e.target.value})}
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex justify-between">
                        分類
                        {isAddingNewCategory ? (
                          <button onClick={() => setIsAddingNewCategory(false)} className="text-primary hover:underline font-bold">選擇現有</button>
                        ) : (
                          <button onClick={() => {
                            setIsAddingNewCategory(true);
                            setNewCategoryName("");
                          }} className="text-primary hover:underline font-bold">+ 新增分類</button>
                        )}
                      </Label>
                      
                      {isAddingNewCategory ? (
                        <Input 
                          placeholder="輸入新分類名稱..."
                          value={newCategoryName}
                          onChange={(e) => {
                            setNewCategoryName(e.target.value);
                            setCurrentSop(prev => ({ ...prev!, category: e.target.value }));
                          }}
                          className="h-11 rounded-xl border-primary/30 focus:border-primary font-bold"
                          autoFocus
                        />
                      ) : (
                        <div className="flex flex-wrap gap-2 p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                          {displayCategories.map(cat => (
                            <button
                              key={cat}
                              onClick={() => setCurrentSop({...currentSop!, category: cat})}
                              className={cn(
                                "px-3 py-1.5 rounded-lg text-xs font-bold border transition-all",
                                currentSop?.category === cat ? "bg-slate-900 text-white border-slate-900 shadow-md" : "bg-white text-slate-500 border-slate-200 hover:border-primary/50"
                              )}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">核心目標描述</Label>
                    <Textarea 
                      placeholder="簡述此流程的目的與核心原則..."
                      className="min-h-[100px] rounded-xl text-sm leading-relaxed"
                      value={currentSop.rule?.description}
                      onChange={e => setCurrentSop({...currentSop, rule: {...currentSop.rule!, description: e.target.value}})}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase text-primary tracking-widest flex justify-between items-center">
                        適用條件
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] hover:text-primary" onClick={() => addArrayItem("conditions")}>+ 新增</Button>
                      </Label>
                      <div className="space-y-2">
                        {currentSop.rule?.conditions.map((cond, i) => (
                          <div key={i} className="flex gap-2">
                            <Input 
                              value={cond} 
                              onChange={e => {
                                const updated = [...currentSop.rule!.conditions];
                                updated[i] = e.target.value;
                                setCurrentSop({...currentSop, rule: {...currentSop.rule!, conditions: updated}});
                              }}
                              className="h-10 rounded-lg text-sm"
                              placeholder="輸入條件..."
                            />
                            <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-300 hover:text-red-500 shrink-0" onClick={() => removeArrayItem("conditions", i)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase text-red-500 tracking-widest flex justify-between items-center">
                        操作限制
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] hover:text-red-500" onClick={() => addArrayItem("restrictions")}>+ 新增</Button>
                      </Label>
                      <div className="space-y-2">
                        {currentSop.rule?.restrictions.map((rest, i) => (
                          <div key={i} className="flex gap-2">
                            <Input 
                              value={rest} 
                              onChange={e => {
                                const updated = [...currentSop.rule!.restrictions];
                                updated[i] = e.target.value;
                                setCurrentSop({...currentSop, rule: {...currentSop.rule!, restrictions: updated}});
                              }}
                              className="h-10 rounded-lg text-sm"
                              placeholder="輸入限制..."
                            />
                            <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-300 hover:text-red-500 shrink-0" onClick={() => removeArrayItem("restrictions", i)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeStep === "steps" && currentSop && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 px-1 md:px-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">OA 標準操作路徑與步驟</p>
                    <Button size="sm" variant="outline" className="rounded-lg h-8 font-bold w-full sm:w-auto" onClick={() => addArrayItem("steps")}>
                      <Plus className="mr-2 h-3.5 w-3.5" /> 增加步驟
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {currentSop.operation?.steps.map((step, i) => (
                      <div key={i} className="group relative p-4 md:p-6 pl-10 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all">
                        <div className="absolute -left-3 top-6 h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-xs shadow-lg z-10">
                          {i + 1}
                        </div>
                        <div className="space-y-4">
                          <div className="flex gap-2 md:gap-4">
                            <div className="flex-1 space-y-2">
                              <Label className="text-[10px] font-black uppercase text-slate-400">操作動作</Label>
                              <Input 
                                value={step.action} 
                                onChange={e => {
                                  const updated = [...currentSop.operation!.steps];
                                  updated[i].action = e.target.value;
                                  setCurrentSop({...currentSop, operation: {steps: updated}});
                                }}
                                className="h-11 rounded-xl border-none bg-white shadow-sm font-bold text-slate-800"
                                placeholder="描述此步驟需要執行的動作..."
                              />
                            </div>
                            <Button variant="ghost" size="icon" className="mt-6 text-slate-300 hover:text-red-500 shrink-0" onClick={() => removeArrayItem("steps", i)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-slate-400">系統路徑 (可選)</Label>
                            <div className="relative">
                              <div className="absolute left-3 top-2.5 px-2 py-0.5 rounded bg-slate-100 text-[9px] font-black text-slate-500 uppercase">Path</div>
                              <Input 
                                value={step.path || ""} 
                                onChange={e => {
                                  const updated = [...currentSop.operation!.steps];
                                  updated[i].path = e.target.value;
                                  setCurrentSop({...currentSop, operation: {steps: updated}});
                                }}
                                className="h-10 pl-14 rounded-xl border-none bg-slate-100 font-mono text-xs text-primary font-bold"
                                placeholder="如: OA > 資料管理 > 用戶帳號管理"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeStep === "exceptions" && currentSop && (
                <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">例外情況與處理方式</p>
                      <Button size="sm" variant="outline" className="rounded-lg h-8 font-bold w-full sm:w-auto" onClick={() => addArrayItem("exceptions")}>
                        <Plus className="mr-2 h-3.5 w-3.5" /> 增加情境
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {currentSop.exceptions?.map((exc, i) => (
                        <div key={i} className="p-4 md:p-6 rounded-2xl border border-orange-100 bg-orange-50/20 space-y-4 relative group">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="absolute top-2 right-2 h-8 w-8 text-orange-200 hover:text-red-500 shrink-0" 
                            onClick={() => removeArrayItem("exceptions", i)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black text-orange-600 uppercase">例外情境描述 (Scenario)</Label>
                            <Input 
                              value={exc.scenario}
                              onChange={e => {
                                const updated = [...currentSop.exceptions!];
                                updated[i].scenario = e.target.value;
                                setCurrentSop({...currentSop, exceptions: updated});
                              }}
                              className="bg-white border-orange-100 rounded-xl font-bold"
                              placeholder="如: 客戶當前仍有開倉部位時..."
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black text-orange-600 uppercase">建議處理方式 (Handling)</Label>
                            <Textarea 
                              value={exc.handling}
                              onChange={e => {
                                const updated = [...currentSop.exceptions!];
                                updated[i].handling = e.target.value;
                                setCurrentSop({...currentSop, exceptions: updated});
                              }}
                              className="bg-white border-orange-100 rounded-xl text-sm min-h-[80px]"
                              placeholder="描述應對方式 or 轉介對象..."
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-8 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <AssociationSelector 
                      type="faq"
                      label="關聯 FAQ"
                      selectedIds={currentSop.linked_faq || []}
                      onChange={(ids) => setCurrentSop({...currentSop, linked_faq: ids})}
                    />
                    <AssociationSelector 
                      type="template"
                      label="關聯郵件模板"
                      selectedIds={currentSop.linked_template || []}
                      onChange={(ids) => setCurrentSop({...currentSop, linked_template: ids})}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="p-4 md:p-6 border-t bg-slate-50/50 gap-2 md:gap-4 shrink-0 flex-col sm:flex-row">
            <div className="flex-1 flex gap-2 w-full">
              {activeStep !== "basic" && (
                <Button variant="outline" className="flex-1 sm:flex-none rounded-xl font-bold" onClick={() => setActiveStep(activeStep === "exceptions" ? "steps" : "basic")}>
                  <ChevronLeft className="mr-2 h-4 w-4" /> 上一步
                </Button>
              )}
              {activeStep !== "exceptions" && (
                <Button variant="outline" className="flex-1 sm:flex-none rounded-xl font-bold" onClick={() => setActiveStep(activeStep === "basic" ? "steps" : "exceptions")}>
                  下一步 <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="ghost" onClick={() => setIsEditing(false)} className="flex-1 sm:flex-none rounded-xl font-bold text-slate-400">
                取消
              </Button>
              <Button onClick={handleSave} disabled={isSaving} className="flex-1 sm:flex-none rounded-xl font-bold px-4 md:px-10 shadow-lg shadow-primary/20">
                <Save className="mr-2 h-4 w-4" /> {isSaving ? "中..." : "儲存 SOP"}
              </Button>
            </div>
          </DialogFooter>

        </DialogContent>
      </Dialog>
    </div>
  );
}
