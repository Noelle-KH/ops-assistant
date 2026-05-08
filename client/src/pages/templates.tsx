import { useState, useEffect } from "react";
import { Search, Mail, Copy, Check, Info, ExternalLink } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Link } from "react-router-dom";

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

  const getProcessedBody = (body: string, fields: TemplateField[]) => {
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
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 mb-2">郵件模板庫</h2>
          <p className="text-muted-foreground">多情境回覆版本，支援即時變數填寫與一鍵複製。</p>
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
        <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="搜尋模板標題、標籤或關鍵字..."
          className="pl-11 h-12 bg-white shadow-sm border-slate-200 focus:ring-primary"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <ScrollArea className="h-[calc(100vh-20rem)] rounded-2xl border bg-white/50 p-1">
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="h-40 animate-pulse bg-slate-100" />
            ))
          ) : filteredTemplates.length > 0 ? (
            filteredTemplates.map((tpl) => (
              <Card key={tpl.id} className="group overflow-hidden border-slate-200 hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="font-bold text-[10px] uppercase tracking-wider h-5">
                      {tpl.category}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">更新於 {tpl.updated_at}</span>
                  </div>
                  <CardTitle className="text-xl font-black text-slate-900">{tpl.title}</CardTitle>
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {tpl.tags.map(tag => (
                      <span key={tag} className="text-[10px] text-slate-400 font-medium">#{tag}</span>
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {tpl.variants.map((variant) => (
                      <div key={variant.variant_id} className="border rounded-xl overflow-hidden bg-white shadow-sm">
                        <button
                          onClick={() => setExpandedTpl(expandedTpl === variant.variant_id ? null : variant.variant_id)}
                          className="w-full text-left p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                        >
                          <div>
                            <p className="text-sm font-bold text-slate-800">{variant.label}</p>
                            <p className="text-xs text-muted-foreground">{variant.description}</p>
                          </div>
                          {expandedTpl === variant.variant_id ? (
                            <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center">
                              <Check className="h-3 w-3 text-slate-400" />
                            </div>
                          ) : (
                            <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center">
                              <Mail className="h-3 w-3 text-slate-400" />
                            </div>
                          )}
                        </button>
                        
                        {expandedTpl === variant.variant_id && (
                          <div className="p-4 border-t bg-slate-50/50 space-y-4 animate-in slide-in-from-top-2 duration-300">
                            {variant.fields.length > 0 && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {variant.fields.map(field => (
                                  <div key={field.key} className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-500 uppercase">{field.label}</label>
                                    <Input
                                      size={1}
                                      placeholder={field.placeholder}
                                      className="h-8 text-xs bg-white"
                                      value={fieldValues[field.key] || ""}
                                      onChange={(e) => handleFieldChange(field.key, e.target.value)}
                                    />
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            <div className="relative group/body">
                              <pre className="p-4 rounded-lg bg-white border border-slate-200 text-sm leading-relaxed text-slate-700 whitespace-pre-wrap font-sans font-medium min-h-[100px]">
                                {getProcessedBody(variant.body, variant.fields)}
                              </pre>
                              <Button
                                size="sm"
                                className={cn(
                                  "absolute top-2 right-2 h-8 px-3 font-bold transition-all",
                                  copiedId === variant.variant_id ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200" : "shadow-md shadow-primary/20"
                                )}
                                onClick={() => handleCopy(variant.variant_id, getProcessedBody(variant.body, variant.fields))}
                              >
                                {copiedId === variant.variant_id ? (
                                  <><Check className="mr-1.5 h-3.5 w-3.5" /> 已複製</>
                                ) : (
                                  <><Copy className="mr-1.5 h-3.5 w-3.5" /> 複製全文</>
                                )}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {(tpl.linked_faq || tpl.linked_sop) && (
                    <div className="flex gap-4 pt-2">
                      {tpl.linked_faq && (
                        <Link to={`/knowledge-base/faq/${tpl.linked_faq}`} className="text-[10px] font-bold text-primary flex items-center gap-1 hover:underline">
                          <Info className="h-3 w-3" /> 查看相關 FAQ
                        </Link>
                      )}
                      {tpl.linked_sop && (
                        <Link to={`/knowledge-base/sop/${tpl.linked_sop}`} className="text-[10px] font-bold text-primary flex items-center gap-1 hover:underline">
                          <ExternalLink className="h-3 w-3" /> 查看相關 SOP
                        </Link>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full py-20 text-center space-y-4">
              <Mail className="h-12 w-12 text-slate-100 mx-auto" />
              <p className="text-slate-500 font-bold">查無符合結果</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
