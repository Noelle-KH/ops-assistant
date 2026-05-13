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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
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
}

const CATEGORIES = ["取款類", "帳戶變更類", "開戶類", "審查類", "其他"];
const API_BASE_URL = "http://localhost:3001";

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTpl, setCurrentTpl] = useState<Partial<EmailTemplate> | null>(null);
  const [activeStep, setActiveStep] = useState<"basic" | "variants">("basic");

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/templates`);
      const data = await res.json();
      setTemplates(data);
    } catch (err) {
      toast.error("無法載入模板資料");
    } finally {
      setLoading(false);
    }
  };

  const initNewTemplate = () => {
    setCurrentTpl({
      title: "",
      category: "其他",
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

    const admin = localStorage.getItem("admin_user") || "Admin";
    let updatedTemplates = [...templates];
    const now = new Date().toISOString().split('T')[0];

    const cleanedTpl = {
      ...currentTpl,
      updated_at: now
    };

    if (cleanedTpl.id) {
      updatedTemplates = updatedTemplates.map(t => t.id === cleanedTpl.id ? cleanedTpl as EmailTemplate : t);
    } else {
      const newTpl = { ...cleanedTpl, id: `tpl_${Date.now()}` } as EmailTemplate;
      updatedTemplates.unshift(newTpl);
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/update/templates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: updatedTemplates, admin })
      });

      if (res.ok) {
        setTemplates(updatedTemplates);
        setIsEditing(false);
        setCurrentTpl(null);
        toast.success("模板儲存成功");
      }
    } catch (err) {
      toast.error("儲存失敗");
    }
  };

  const toggleStatus = async (id: string) => {
    const admin = localStorage.getItem("admin_user") || "Admin";
    const updated = templates.map(t => {
      if (t.id === id) {
        return { ...t, status: t.status === "active" ? "disabled" : "active" as any };
      }
      return t;
    });

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/update/templates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: updated, admin })
      });
      if (res.ok) {
        setTemplates(updated);
        toast.info("狀態已更新");
      }
    } catch (err) {
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
              "p-5 border-slate-100 hover:border-primary/20 transition-all",
              tpl.status === "disabled" && "opacity-60 bg-slate-50/50"
            )}>
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <Badge variant="secondary" className="text-[10px] font-bold uppercase">{tpl.category}</Badge>
                  <h3 className="text-lg font-black text-slate-900">{tpl.title}</h3>
                </div>
                <div className="flex gap-1">
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
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50 text-[10px] font-bold text-slate-400">
                <span>{tpl.variants.length} 個情境版本</span>
                <span>更新於 {tpl.updated_at}</span>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col p-0 rounded-2xl border-none">
          <DialogHeader className="p-6 border-b bg-slate-50/50">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-black flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                  <Mail className="h-5 w-5 text-white" />
                </div>
                {currentTpl?.id ? "編輯郵件模板" : "建立新郵件模板"}
              </DialogTitle>
              <div className="flex items-center bg-white border rounded-lg p-1">
                {[
                  { id: "basic", label: "1. 基礎設定", icon: Settings2 },
                  { id: "variants", label: "2. 內容與版本", icon: Layers },
                ].map((step) => (
                  <button
                    key={step.id}
                    onClick={() => setActiveStep(step.id as any)}
                    className={cn(
                      "px-4 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-2",
                      activeStep === step.id ? "bg-primary text-white shadow-sm" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    <step.icon className="h-3.5 w-3.5" />
                    {step.label}
                  </button>
                ))}
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 p-8">
            {activeStep === "basic" && currentTpl && (
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-300 max-w-2xl mx-auto">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">模板標題</Label>
                    <Input 
                      placeholder="如: 取款進度回覆" 
                      className="h-11 rounded-xl font-bold"
                      value={currentTpl.title}
                      onChange={e => setCurrentTpl({...currentTpl, title: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">分類</Label>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORIES.map(cat => (
                        <button
                          key={cat}
                          onClick={() => setCurrentTpl({...currentTpl, category: cat})}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-xs font-bold border transition-all",
                            currentTpl.category === cat ? "bg-slate-900 text-white border-slate-900 shadow-md" : "bg-white text-slate-500 border-slate-200 hover:border-primary/50"
                          )}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">標籤 (以逗號分隔)</Label>
                  <Input 
                    placeholder="如: 取款, 安撫, 進度"
                    value={currentTpl.tags?.join(", ")}
                    onChange={e => setCurrentTpl({...currentTpl, tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean)})}
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
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                <div className="flex justify-between items-center">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">內容版本 (Variants)</p>
                  <Button size="sm" variant="outline" className="rounded-lg h-8 font-bold" onClick={addVariant}>
                    <Plus className="mr-2 h-3.5 w-3.5" /> 增加新版本
                  </Button>
                </div>

                <div className="space-y-8">
                  {currentTpl.variants?.map((variant, vIdx) => (
                    <div key={variant.variant_id} className="p-6 rounded-2xl border border-slate-100 bg-slate-50/30 space-y-6 relative group">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute top-2 right-2 h-8 w-8 text-slate-300 hover:text-red-500" 
                        onClick={() => removeVariant(vIdx)}
                        disabled={currentTpl.variants!.length <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>

                      <div className="grid grid-cols-2 gap-4">
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
                        <div className="flex justify-between items-center">
                          <Label className="text-[10px] font-black uppercase text-slate-400">郵件內文 (Body)</Label>
                          <span className="text-[9px] text-slate-400 font-bold bg-slate-100 px-1.5 py-0.5 rounded">變數請使用 {"{{KEY}}"} 格式</span>
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
                        <div className="flex justify-between items-center">
                          <Label className="text-[10px] font-black uppercase text-primary">變數欄位定義 (Fields)</Label>
                          <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] hover:text-primary" onClick={() => addField(vIdx)}>+ 增加變數</Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {variant.fields.map((field, fIdx) => (
                            <div key={fIdx} className="bg-white p-3 rounded-xl border border-slate-100 space-y-3 relative group/field">
                              <button 
                                onClick={() => removeField(vIdx, fIdx)}
                                className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-300 hover:text-red-500 shadow-sm opacity-0 group-hover/field:opacity-100 transition-opacity"
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
                          {variant.fields.length === 0 && (
                            <div className="col-span-full py-4 text-center border-2 border-dashed border-slate-100 rounded-xl text-[10px] text-slate-400 font-bold">
                              無變數欄位
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </ScrollArea>

          <DialogFooter className="p-6 border-t bg-slate-50/50 gap-4">
            <div className="flex-1 flex gap-2">
              {activeStep !== "basic" && (
                <Button variant="outline" className="rounded-xl font-bold" onClick={() => setActiveStep("basic")}>
                  <ChevronLeft className="mr-2 h-4 w-4" /> 上一步
                </Button>
              )}
              {activeStep === "basic" && (
                <Button variant="outline" className="rounded-xl font-bold" onClick={() => setActiveStep("variants")}>
                  下一步：編輯內文 <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setIsEditing(false)} className="rounded-xl font-bold text-slate-400">
                取消
              </Button>
              <Button onClick={handleSave} className="rounded-xl font-bold px-10 shadow-lg shadow-primary/20">
                <Save className="mr-2 h-4 w-4" /> 儲存模板
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
