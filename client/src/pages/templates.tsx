import { useState, useEffect } from "react";
import { Search, Mail, Copy, Check, Info, ExternalLink, X, RotateCcw, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Link, useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";

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

const CATEGORIES = ["全部", "取款類", "帳戶變更類", "開戶類", "審查類", "其他"];
const API_BASE_URL = "http://localhost:3001";

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("全部");
  const [loading, setLoading] = useState(true);
  const [expandedTpl, setExpandedTpl] = useState<string | null>(null);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  
  // Warning Dialog State
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const [pendingCopy, setPendingCopy] = useState<{ id: string, content: string } | null>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/templates`)
      .then(res => res.json())
      .then(data => {
        setTemplates(data);
        setLoading(false);
        
        // Handle direct linking via ID
        const targetId = searchParams.get("id");
        if (targetId) {
          const target = data.find((t: EmailTemplate) => t.id === targetId);
          if (target && target.variants.length > 0) {
            setExpandedTpl(target.variants[0].variant_id);
          }
        }
      })
      .catch(err => {
        console.error("Failed to fetch templates:", err);
        setLoading(false);
      });
  }, [searchParams]);

  const filteredTemplates = templates.filter(tpl => {
    if (tpl.status === "disabled") return false;
    
    // If an ID is provided in URL, show only that template
    const targetId = searchParams.get("id");
    if (targetId) return tpl.id === targetId;

    const matchesSearch = 
      tpl.title.toLowerCase().includes(search.toLowerCase()) ||
      tpl.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = selectedCategory === "全部" || tpl.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleFieldChange = (key: string, value: string) => {
    setFieldValues(prev => ({ ...prev, [key]: value }));
  };

  const clearAllFields = () => {
    setFieldValues({});
    toast.info("已清空所有變數內容");
  };

  const renderProcessedBody = (body: string, fields: TemplateField[]) => {
    let parts: (string | JSX.Element)[] = [body];
    
    fields.forEach(field => {
      const newParts: (string | JSX.Element)[] = [];
      const placeholder = `{{${field.key}}}`;
      const value = fieldValues[field.key];

      parts.forEach(part => {
        if (typeof part !== 'string') {
          newParts.push(part);
          return;
        }

        const subParts = part.split(placeholder);
        subParts.forEach((subPart, index) => {
          if (subPart) newParts.push(subPart);
          if (index < subParts.length - 1) {
            newParts.push(
              <span 
                key={`${field.key}-${index}`} 
                className={cn(
                  "px-2 py-0.5 rounded-lg font-black text-[1.05em] transition-all mx-0.5 shadow-sm",
                  value 
                    ? "bg-primary text-white border-2 border-primary/20 scale-105" 
                    : "bg-amber-100 text-amber-700 border-2 border-amber-300 animate-pulse"
                )}
              >
                {value || placeholder}
              </span>
            );
          }
        });
      });
      parts = newParts;
    });

    return parts;
  };

  const getRawProcessedBody = (body: string, fields: TemplateField[]) => {
    let result = body;
    fields.forEach(field => {
      const value = fieldValues[field.key] || `{{${field.key}}}`;
      result = result.replace(new RegExp(`{{${field.key}}}`, 'g'), value);
    });
    return result;
  };

  const handleCopy = (variantId: string, content: string) => {
    if (content.includes("{{") && content.includes("}}")) {
      setPendingCopy({ id: variantId, content });
      setIsWarningOpen(true);
      return;
    }
    performCopy(variantId, content);
  };

  const performCopy = (variantId: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(variantId);
    toast.success("已複製到剪貼簿");
    setTimeout(() => setCopiedId(null), 2000);
    setIsWarningOpen(false);
    setPendingCopy(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 mb-2">郵件模板庫</h2>
          <div className="flex items-center gap-2">
            <p className="text-muted-foreground">多情境回覆版本，支援即時變數填寫與一鍵複製。</p>
            {Object.keys(fieldValues).length > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearAllFields}
                className="h-7 text-[10px] font-bold border-dashed border-slate-300 hover:border-red-500 hover:text-red-500 transition-colors bg-white/50"
              >
                <RotateCcw className="h-3 w-3 mr-1" /> 清空全部變數
              </Button>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              size="sm"
              className="rounded-full px-4 h-9 font-bold"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </section>

      <div className="relative">
        <Search className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
        <Input
          placeholder="搜尋模板標題、標籤或關鍵字..."
          className="pl-11 h-12 bg-white shadow-sm border-slate-200 focus:ring-primary rounded-xl"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <ScrollArea className="h-[calc(100vh-20rem)] rounded-2xl border bg-slate-50/30 p-1">
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="h-40 animate-pulse bg-slate-100 border-none shadow-none" />
            ))
          ) : filteredTemplates.length > 0 ? (
            filteredTemplates.map((tpl) => (
              <Card key={tpl.id} className="group overflow-hidden border-slate-200 hover:shadow-xl transition-all duration-500 bg-white">
                <CardHeader className="pb-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="font-bold text-[10px] uppercase tracking-wider h-5 bg-slate-100 text-slate-600 border-none">
                      {tpl.category}
                    </Badge>
                    <span className="text-[10px] font-medium text-slate-400">更新於 {tpl.updated_at}</span>
                  </div>
                  <CardTitle className="text-xl font-black text-slate-900 leading-tight">{tpl.title}</CardTitle>
                  <div className="flex flex-wrap gap-2">
                    {tpl.tags.map(tag => (
                      <span key={tag} className="text-[10px] text-slate-400 font-bold bg-slate-50 px-2 py-0.5 rounded">#{tag}</span>
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {tpl.variants.map((variant) => (
                      <div key={variant.variant_id} className={cn(
                        "border rounded-2xl overflow-hidden transition-all duration-300",
                        expandedTpl === variant.variant_id ? "border-primary/30 ring-4 ring-primary/5 bg-white" : "border-slate-100 bg-slate-50/50 hover:border-slate-200"
                      )}>
                        <div className="w-full text-left p-4 flex items-center justify-between group/btn relative">
                          <button
                            onClick={() => setExpandedTpl(expandedTpl === variant.variant_id ? null : variant.variant_id)}
                            className="absolute inset-0 z-0"
                          />
                          <div className="space-y-1 relative z-10 pointer-events-none">
                            <p className={cn(
                              "text-sm font-bold transition-colors",
                              expandedTpl === variant.variant_id ? "text-primary" : "text-slate-800"
                            )}>{variant.label}</p>
                            <p className="text-xs text-slate-500 font-medium">{variant.description}</p>
                          </div>
                          <div className="flex items-center gap-2 relative z-10">
                            {expandedTpl === variant.variant_id && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className={cn(
                                  "h-8 px-3 font-bold transition-all rounded-lg text-[10px] gap-1.5",
                                  copiedId === variant.variant_id 
                                    ? "text-emerald-600 bg-emerald-50" 
                                    : "text-primary hover:bg-primary/10"
                                )}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopy(variant.variant_id, getRawProcessedBody(variant.body, variant.fields));
                                }}
                              >
                                {copiedId === variant.variant_id ? (
                                  <><Check className="h-3 w-3" /> 已複製</>
                                ) : (
                                  <><Copy className="h-3 w-3" /> 複製全文</>
                                )}
                              </Button>
                            )}
                            <div className={cn(
                              "h-8 w-8 rounded-xl flex items-center justify-center transition-all",
                              expandedTpl === variant.variant_id ? "bg-primary text-white scale-110 shadow-lg shadow-primary/20" : "bg-white text-slate-400 group-hover/btn:bg-slate-100"
                            )}>
                              {expandedTpl === variant.variant_id ? <Check className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                            </div>
                          </div>
                        </div>
                        
                        {expandedTpl === variant.variant_id && (
                          <div className="px-4 pb-4 space-y-5 animate-in slide-in-from-top-2 duration-500">
                            <div className="h-px bg-slate-100 mx-2" />
                            {variant.fields.length > 0 && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                                {variant.fields.map(field => (
                                  <div key={field.key} className="space-y-2">
                                    <div className="flex justify-between items-center px-0.5">
                                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">{field.label}</label>
                                      {fieldValues[field.key] && (
                                        <button onClick={() => handleFieldChange(field.key, "")} className="text-slate-400 hover:text-red-500 transition-colors">
                                          <X className="h-3 w-3" />
                                        </button>
                                      )}
                                    </div>
                                    <Input
                                      placeholder={field.placeholder}
                                      className="h-9 text-xs bg-white border-slate-200 focus:border-primary focus:ring-primary rounded-lg shadow-sm"
                                      value={fieldValues[field.key] || ""}
                                      onChange={(e) => handleFieldChange(field.key, e.target.value)}
                                    />
                                  </div>
                                ))}
                              </div>
                            )}
                            <div className="p-5 rounded-xl bg-slate-900 text-slate-100 text-[13px] leading-relaxed whitespace-pre-wrap font-sans font-medium min-h-[120px] shadow-inner selection:bg-primary/30">
                              {renderProcessedBody(variant.body, variant.fields)}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {(tpl.linked_faq || tpl.linked_sop) && (
                    <div className="flex gap-4 pt-2 border-t border-slate-50">
                      {tpl.linked_faq && (
                        <Link to={`/knowledge-base?id=${tpl.linked_faq}&type=faq`} className="text-[10px] font-bold text-slate-500 flex items-center gap-1.5 hover:text-primary transition-colors">
                          <Info className="h-3 w-3" /> 查看相關 FAQ
                        </Link>
                      )}
                      {tpl.linked_sop && (
                        <Link to={`/knowledge-base?id=${tpl.linked_sop}&type=sop`} className="text-[10px] font-bold text-slate-500 flex items-center gap-1.5 hover:text-primary transition-colors">
                          <ExternalLink className="h-3 w-3" /> 查看相關 SOP
                        </Link>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full py-24 text-center space-y-4">
              <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                <Mail className="h-8 w-8 text-slate-300" />
              </div>
              <p className="text-slate-400 font-bold">查無符合結果，請更換關鍵字再試一次</p>
            </div>
          )}
        </div>
      </ScrollArea>

      <Dialog open={isWarningOpen} onOpenChange={setIsWarningOpen}>
        <DialogContent className="max-w-md p-8 rounded-3xl border-none shadow-2xl">
          <DialogHeader className="space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto border border-amber-100">
              <AlertTriangle className="h-6 w-6 text-amber-500" />
            </div>
            <DialogTitle className="text-2xl font-black text-slate-900 text-center">仍有未填寫欄位</DialogTitle>
            <DialogDescription className="text-center text-slate-500 font-medium leading-relaxed">
              檢測到模板中仍包含 <code className="text-amber-600 bg-amber-50 px-1 rounded">{"{{...}}"}</code> 變數佔位符，確定要直接複製嗎？
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-3 mt-6">
            <Button variant="outline" className="flex-1 rounded-xl h-11 font-bold border-slate-200" onClick={() => setIsWarningOpen(false)}>返回填寫</Button>
            <Button className="flex-1 rounded-xl h-11 font-bold bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-100" onClick={() => pendingCopy && performCopy(pendingCopy.id, pendingCopy.content)}>確定複製</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
