import { useState, useEffect } from "react";
import { 
  Search, 
  Plus, 
  Edit2, 
  Eye, 
  EyeOff, 
  Save, 
  X, 
  Trash2,
  Mail,
  Layers,
  Settings2,
  ChevronRight,
  ChevronLeft
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

interface TemplateField {
  key: string;
  label: string;
  placeholder: string;
}

interface TemplateVariant {
  variant_id: string;
  label: string;
  description: string;
  body: string;
  fields: TemplateField[];
}

interface EmailTemplate {
  id: string;
  category: string;
  tags: string[];
  title: string;
  variants: TemplateVariant[];
  linked_faq?: string;
  linked_sop?: string;
  updated_at: string;
  status: "active" | "disabled";
  sort_order?: number;
}

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTpl, setCurrentTpl] = useState<Partial<EmailTemplate> | null>(null);
  const [activeStep, setActiveStep] = useState<"basic" | "variants">("basic");
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  // Filter categories for Template display
  const templateCategories = allCategories.filter(c => c.type === "template");
  const displayCategories = templateCategories.length > 0 ? templateCategories.map(c => c.name) : ["一般"];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tplRes, catRes] = await Promise.all([
        fetchWithAuth(`${API_BASE_URL}/api/templates`),
        fetchWithAuth(`${API_BASE_URL}/api/categories`)
      ]);
      
      const tplData = await tplRes.json();
      const catData = await catRes.json();
      
      if (Array.isArray(tplData)) setTemplates(tplData);
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

  const initNewTemplate = () => {
    setCurrentTpl({
      title: "",
      category: displayCategories[0] || "其他",
      tags: [],
      variants: [{
        variant_id: `var_${Date.now()}`,
        label: "標準版本",
        description: "",
        body: "",
        fields: []
      }],
      status: "active"
    });
    setActiveStep("basic");
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!currentTpl?.title || !currentTpl?.category) {
      toast.error("請填寫標題與分類");
      return;
    }

    setIsSaving(true);
    const admin = localStorage.getItem("user_name") || "Admin";
    const now = new Date().toISOString().split('T')[0];

    // 1. Handle Categories Update if new one added
    let updatedCategories = [...allCategories];
    const categoryExists = allCategories.some(c => c.name === currentTpl.category && c.type === "template");
    
    if (!categoryExists) {
      const newCat = {
        id: `cat_tpl_${Date.now()}`,
        name: currentTpl.category,
        type: "template",
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

    const cleanedTpl = {
      ...currentTpl,
      updated_at: now
    };

    let updatedTemplates = [...templates];
    if (cleanedTpl.id) {
      updatedTemplates = updatedTemplates.map(t => t.id === cleanedTpl.id ? cleanedTpl as EmailTemplate : t);
    } else {
      const newTpl = { ...cleanedTpl, id: `tpl_${Date.now()}` } as EmailTemplate;
      updatedTemplates.unshift(newTpl);
    }

    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/api/admin/update/templates`, {
        method: "POST",
        body: JSON.stringify({ data: updatedTemplates, admin })
      });

      if (res.ok) {
        setTemplates(updatedTemplates);
        setIsEditing(false);
        setCurrentTpl(null);
        setIsAddingNewCategory(false);
        setNewCategoryName("");
        toast.success("模板儲存成功");
      }
    } catch {
      toast.error("儲存失敗");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleStatus = async (id: string) => {
    const admin = localStorage.getItem("user_name") || "Admin";
    const updated = templates.map(t => {
      if (t.id === id) {
        return { ...t, status: (t.status === "active" ? "disabled" : "active") as "active" | "disabled" };
      }
      return t;
    });

    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/api/admin/update/templates`, {
        method: "POST",
        body: JSON.stringify({ data: updated, admin })
      });
      if (res.ok) {
        setTemplates(updated);
        toast.info("狀態已更新");
      }
    } catch {
      toast.error("操作失敗");
    }
  };

  const addVariant = () => {
    const updated = { ...currentTpl! };
    updated.variants!.push({
      variant_id: `var_${Date.now()}`,
      label: `新版本 ${updated.variants!.length + 1}`,
      description: "",
      body: "",
      fields: []
    });
    setCurrentTpl(updated);
  };

  const removeVariant = (index: number) => {
    const updated = { ...currentTpl! };
    updated.variants!.splice(index, 1);
    setCurrentTpl(updated);
  };

  const addField = (variantIndex: number) => {
    const updated = { ...currentTpl! };
    updated.variants![variantIndex].fields.push({ key: "", label: "", placeholder: "" });
    setCurrentTpl(updated);
  };

  const removeField = (variantIndex: number, fieldIndex: number) => {
    const updated = { ...currentTpl! };
    updated.variants![variantIndex].fields.splice(fieldIndex, 1);
    setCurrentTpl(updated);
  };

  const filteredTemplates = templates.filter(t => 
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="搜尋模板標題或分類..."
            className="pl-10 h-11 rounded-xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button onClick={initNewTemplate} className="rounded-xl h-11 font-bold shadow-lg shadow-primary/20">
          <Plus className="mr-2 h-4 w-4" /> 建立新郵件模板
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-16rem)] rounded-2xl border bg-white shadow-sm">
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-slate-50 animate-pulse rounded-2xl" />
            ))
          ) : filteredTemplates.map((tpl) => (
            <Card key={tpl.id} className={cn(
              "p-5 border-slate-100 hover:border-primary/20 transition-all h-40 flex flex-col",
              tpl.status === "disabled" && "opacity-60 bg-slate-50/50"
            )}>
              <div className="flex justify-between items-start mb-2 shrink-0">
                <div className="space-y-1 min-w-0">
                  <Badge variant="secondary" className="text-[10px] font-bold uppercase shrink-0">{tpl.category}</Badge>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-primary" onClick={() => {
                    setCurrentTpl(tpl);
                    setActiveStep("basic");
                    setIsEditing(true);
                  }}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-amber-500" onClick={() => toggleStatus(tpl.id)}>
                    {tpl.status === "active" ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <Label className="text-[9px] font-black text-slate-400 uppercase">排序</Label>
                <Input 
                  type="number"
                  className="h-6 w-12 text-[10px] px-1 text-center font-bold"
                  value={tpl.sort_order || 0}
                  onChange={async (e) => {
                    const val = parseInt(e.target.value) || 0;
                    const updatedTpls = templates.map(t => t.id === tpl.id ? { ...t, sort_order: val } : t);
                    setTemplates(updatedTpls);
                    
                    const admin = localStorage.getItem("user_name") || "Admin";
                    try {
                      await fetchWithAuth(`${API_BASE_URL}/api/admin/update/templates`, {
                        method: "POST",
                        body: JSON.stringify({ data: updatedTpls, admin })
                      });
                    } catch (err) {
                      console.error("Failed to save sort order:", err);
                    }
                  }}
                />
              </div>
              
              <ScrollArea className="flex-1 pr-4 mb-2">
                <h3 className="text-lg font-black text-slate-900 leading-tight">{tpl.title}</h3>
                <div className="flex flex-wrap gap-1 mt-2">
                  {tpl.tags.map(tag => (
                    <span key={tag} className="text-[10px] text-slate-400">#{tag}</span>
                  ))}
                </div>
              </ScrollArea>

              <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-50 text-[10px] font-bold text-slate-400 shrink-0">
                <span>{tpl.variants.length} 個情境版本</span>
                <span>更新於 {tpl.updated_at}</span>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-5xl h-[90vh] overflow-hidden flex flex-col p-0 rounded-2xl border-none">
          <DialogHeader className="p-6 border-b bg-slate-50/50 shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-black flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                  <Mail className="h-5 w-5 text-white" />
                </div>
                {currentTpl?.id ? "編輯郵件模板" : "建立新郵件模板"}
              </DialogTitle>
              <DialogDescription className="sr-only">
                郵件模板編輯器，支援多版本內容與變數定義。
              </DialogDescription>
              <div className="flex flex-wrap items-center bg-white border rounded-lg p-1 gap-1">
                {[
                  { id: "basic", label: "1. 基礎", icon: Settings2 },
                  { id: "variants", label: "2. 內容", icon: Layers },
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
              {activeStep === "basic" && currentTpl && (
                <div className="space-y-6 md:space-y-8 animate-in slide-in-from-right-4 duration-300 max-w-2xl mx-auto">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    <div className="space-y-2 col-span-1">
                      <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">模板標題</Label>
                      <Input 
                        placeholder="如: 取款進度回覆" 
                        className="h-11 rounded-xl font-bold"
                        value={currentTpl.title}
                        onChange={e => setCurrentTpl({...currentTpl, title: e.target.value})}
                      />
                    </div>
                    <div className="space-y-3 col-span-1">
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
                            setCurrentTpl(prev => ({ ...prev!, category: e.target.value }));
                          }}
                          className="h-11 rounded-xl border-primary/30 focus:border-primary font-bold"
                          autoFocus
                        />
                      ) : (
                        <div className="flex flex-wrap gap-2 p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                          {displayCategories.map(cat => (
                            <button
                              key={cat}
                              onClick={() => setCurrentTpl({...currentTpl!, category: cat})}
                              className={cn(
                                "px-3 py-1.5 rounded-lg text-xs font-bold border transition-all",
                                currentTpl?.category === cat ? "bg-slate-900 text-white border-slate-900 shadow-md" : "bg-white text-slate-500 border-slate-200 hover:border-primary/50"
                              )}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2 col-span-1">
                      <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">排序權重 (小越前)</Label>
                      <Input 
                        type="number"
                        placeholder="0"
                        className="h-11 rounded-xl font-bold"
                        value={currentTpl.sort_order || 0}
                        onChange={e => setCurrentTpl({...currentTpl, sort_order: parseInt(e.target.value) || 0})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">標籤 (以逗號或空白分隔)</Label>
                    <Input 
                      placeholder="如: 取款, 安撫, 進度"
                      value={currentTpl.tags?.join(", ")}
                      onChange={e => {
                        const val = e.target.value;
                        const tags = val.split(/[,\s，]+/).map(t => t.trim()).filter(Boolean);
                        setCurrentTpl({...currentTpl, tags});
                      }}
                      className="rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <AssociationSelector 
                      type="faq"
                      label="關聯 FAQ"
                      maxSelections={1}
                      selectedIds={currentTpl.linked_faq ? [currentTpl.linked_faq] : []}
                      onChange={(ids) => setCurrentTpl({...currentTpl, linked_faq: ids[0] || ""})}
                    />
                    <AssociationSelector 
                      type="sop"
                      label="關聯 SOP"
                      maxSelections={1}
                      selectedIds={currentTpl.linked_sop ? [currentTpl.linked_sop] : []}
                      onChange={(ids) => setCurrentTpl({...currentTpl, linked_sop: ids[0] || ""})}
                    />
                  </div>
                </div>
              )}

              {activeStep === "variants" && currentTpl && (
                <div className="space-y-6 md:space-y-8 animate-in slide-in-from-right-4 duration-300">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">內容版本 (Variants)</p>
                    <Button size="sm" variant="outline" className="rounded-lg h-8 font-bold w-full sm:w-auto" onClick={addVariant}>
                      <Plus className="mr-2 h-3.5 w-3.5" /> 增加新版本
                    </Button>
                  </div>

                  <div className="space-y-6 md:space-y-8">
                    {currentTpl.variants?.map((variant, vIdx) => (
                      <div key={variant.variant_id} className="p-4 md:p-6 rounded-2xl border border-slate-100 bg-slate-50/30 space-y-6 relative group">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="absolute top-2 right-2 h-8 w-8 text-slate-300 hover:text-red-500 shrink-0" 
                          onClick={() => removeVariant(vIdx)}
                          disabled={currentTpl.variants!.length <= 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-slate-400">版本標籤 (Label)</Label>
                            <Input 
                              value={variant.label}
                              onChange={e => {
                                const updated = [...currentTpl.variants!];
                                updated[vIdx].label = e.target.value;
                                setCurrentTpl({...currentTpl, variants: updated});
                              }}
                              className="bg-white rounded-xl font-bold"
                              placeholder="如: 標準型, 告知型..."
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-slate-400">適用情境描述</Label>
                            <Input 
                              value={variant.description}
                              onChange={e => {
                                const updated = [...currentTpl.variants!];
                                updated[vIdx].description = e.target.value;
                                setCurrentTpl({...currentTpl, variants: updated});
                              }}
                              className="bg-white rounded-xl"
                              placeholder="描述此版本適用於什麼樣的客戶或情境..."
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center flex-wrap gap-2">
                            <Label className="text-[10px] font-black uppercase text-slate-400">郵件內文 (Body)</Label>
                            <span className="text-[9px] text-slate-400 font-bold bg-slate-100 px-1.5 py-0.5 rounded shrink-0">變數請使用 {"{{KEY}}"} 格式</span>
                          </div>
                          <Textarea 
                            value={variant.body}
                            onChange={e => {
                              const updated = [...currentTpl.variants!];
                              updated[vIdx].body = e.target.value;
                              setCurrentTpl({...currentTpl, variants: updated});
                            }}
                            className="bg-white rounded-xl text-sm min-h-[150px] leading-relaxed"
                            placeholder="您好！關於您的帳戶 {{ACCOUNT}}..."
                          />
                        </div>

                        <div className="space-y-4 pt-4 border-t border-slate-100">
                          <div className="flex justify-between items-center flex-wrap gap-2">
                            <Label className="text-[10px] font-black uppercase text-primary">變數欄位定義 (Fields)</Label>
                            <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] hover:text-primary" onClick={() => addField(vIdx)}>+ 增加變數</Button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {variant.fields.map((field, fIdx) => (
                              <div key={fIdx} className="bg-white p-3 rounded-xl border border-slate-100 space-y-3 relative group/field">
                                <button 
                                  onClick={() => removeField(vIdx, fIdx)}
                                  className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-300 hover:text-red-500 shadow-sm transition-opacity"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                                <div className="space-y-1">
                                  <Label className="text-[9px] font-black uppercase text-slate-400">Key (需與 Body 內對應)</Label>
                                  <Input 
                                    value={field.key}
                                    onChange={e => {
                                      const updated = [...currentTpl.variants!];
                                      updated[vIdx].fields[fIdx].key = e.target.value;
                                      setCurrentTpl({...currentTpl, variants: updated});
                                    }}
                                    className="h-8 text-[11px] rounded-lg bg-slate-50/50 border-none font-mono"
                                    placeholder="如: ACCOUNT"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-[9px] font-black uppercase text-slate-400">顯示標籤 (Label)</Label>
                                  <Input 
                                    value={field.label}
                                    onChange={e => {
                                      const updated = [...currentTpl.variants!];
                                      updated[vIdx].fields[fIdx].label = e.target.value;
                                      setCurrentTpl({...currentTpl, variants: updated});
                                    }}
                                    className="h-8 text-[11px] rounded-lg border-slate-100"
                                    placeholder="如: MT4 帳號"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="p-4 md:p-6 border-t bg-slate-50/50 gap-2 md:gap-4 shrink-0 flex-col sm:flex-row">
            <div className="flex-1 flex gap-2 w-full">
              {activeStep !== "basic" && (
                <Button variant="outline" className="flex-1 sm:flex-none rounded-xl font-bold" onClick={() => setActiveStep("basic")}>
                  <ChevronLeft className="mr-2 h-4 w-4" /> 上一步
                </Button>
              )}
              {activeStep === "basic" && (
                <Button variant="outline" className="flex-1 sm:flex-none rounded-xl font-bold" onClick={() => setActiveStep("variants")}>
                  下一步：編輯內文 <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="ghost" onClick={() => setIsEditing(false)} className="flex-1 sm:flex-none rounded-xl font-bold text-slate-400">
                取消
              </Button>
              <Button onClick={handleSave} disabled={isSaving} className="flex-1 sm:flex-none rounded-xl font-bold px-4 md:px-10 shadow-lg shadow-primary/20">
                <Save className="mr-2 h-4 w-4" /> {isSaving ? "中..." : "儲存模板"}
              </Button>
            </div>
          </DialogFooter>

        </DialogContent>
      </Dialog>
    </div>
  );
}
