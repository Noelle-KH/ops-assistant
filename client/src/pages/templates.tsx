import { useState, useEffect } from "react";
import { Search, Mail, Copy, Check, Info, ExternalLink, X, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Link } from "react-router-dom";
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

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/templates`)
      .then(res => res.json())
      .then(data => {
        setTemplates(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch templates:", err);
        setLoading(false);
      });
  }, []);

  const filteredTemplates = templates.filter(tpl => {
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
                  "px-1.5 py-0.5 rounded-md font-bold text-[0.95em] transition-all mx-0.5",
                  value 
                    ? "bg-primary/10 text-primary border border-primary/20" 
                    : "bg-amber-100 text-amber-700 border border-amber-200 animate-pulse"
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
    navigator.clipboard.writeText(content);
    setCopiedId(variantId);
    toast.success("已複製到剪貼簿");
    setTimeout(() => setCopiedId(null), 2000);
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
                        <button
                          onClick={() => setExpandedTpl(expandedTpl === variant.variant_id ? null : variant.variant_id)}
                          className="w-full text-left p-4 flex items-center justify-between group/btn"
                        >
                          <div className="space-y-1">
                            <p className={cn(
                              "text-sm font-bold transition-colors",
                              expandedTpl === variant.variant_id ? "text-primary" : "text-slate-800"
                            )}>{variant.label}</p>
                            <p className="text-xs text-slate-500 font-medium">{variant.description}</p>
                          </div>
                          <div className={cn(
                            "h-8 w-8 rounded-xl flex items-center justify-center transition-all",
                            expandedTpl === variant.variant_id ? "bg-primary text-white scale-110 shadow-lg shadow-primary/20" : "bg-white text-slate-400 group-hover/btn:bg-slate-100"
                          )}>
                            {expandedTpl === variant.variant_id ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Mail className="h-4 w-4" />
                            )}
                          </div>
                        </button>
                        
                        {expandedTpl === variant.variant_id && (
                          <div className="px-4 pb-4 space-y-5 animate-in slide-in-from-top-2 duration-500">
                            {variant.fields.length > 0 && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                                {variant.fields.map(field => (
                                  <div key={field.key} className="space-y-2">
                                    <div className="flex justify-between items-center px-0.5">
                                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">{field.label}</label>
                                      {fieldValues[field.key] && (
                                        <button 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleFieldChange(field.key, "");
                                          }}
                                          className="text-slate-400 hover:text-red-500 transition-colors"
                                          title="清除"
                                        >
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
                            
                            <div className="relative group/body">
                              <div className="p-5 rounded-xl bg-slate-900 text-slate-100 text-[13px] leading-relaxed whitespace-pre-wrap font-sans font-medium min-h-[120px] shadow-inner selection:bg-primary/30">
                                {renderProcessedBody(variant.body, variant.fields)}
                              </div>
                              <Button
                                size="sm"
                                className={cn(
                                  "absolute top-3 right-3 h-8 px-4 font-bold transition-all rounded-lg",
                                  copiedId === variant.variant_id 
                                    ? "bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-200" 
                                    : "bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                                )}
                                onClick={() => handleCopy(variant.variant_id, getRawProcessedBody(variant.body, variant.fields))}
                              >
                                {copiedId === variant.variant_id ? (
                                  <><Check className="mr-2 h-3.5 w-3.5" /> 已複製</>
                                ) : (
                                  <><Copy className="mr-2 h-3.5 w-3.5" /> 複製全文</>
                                )}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {(tpl.linked_faq || tpl.linked_sop) && (
                    <div className="flex gap-4 pt-2 border-t border-slate-50">
                      {tpl.linked_faq && (
                        <Link to={`/knowledge-base?search=${tpl.linked_faq}`} className="text-[10px] font-bold text-slate-500 flex items-center gap-1.5 hover:text-primary transition-colors">
                          <Info className="h-3 w-3" /> 查看相關 FAQ
                        </Link>
                      )}
                      {tpl.linked_sop && (
                        <Link to={`/knowledge-base?search=${tpl.linked_sop}`} className="text-[10px] font-bold text-slate-500 flex items-center gap-1.5 hover:text-primary transition-colors">
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
    </div>
  );
}
