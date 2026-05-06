import { useState, useEffect, ReactNode } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { Search, Info, Globe, ExternalLink, Mail, ChevronRight, FileText, List } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

// --- Interfaces ---
interface FAQItem {
  id: string;
  category: string;
  tags: string[];
  question: string;
  answer: string;
  ops_note?: string;
  answer_en?: string;
  linked_sop?: string; // Links to SOPs
  linked_template?: string;
  updated_at: string;
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
  linked_faq?: string[]; // Links to FAQs
  linked_template?: string[];
  updated_at: string;
}

// --- Constants ---
const FAQ_CATEGORIES = ["全部", "開戶", "交易帳戶", "入金", "出金", "交易", "代理", "活動"];
const SOP_CATEGORIES = ["全部", "帳戶管理", "風險管理", "出金", "入金", "交易", "開戶", "其他"];
const API_BASE_URL = "http://localhost:3001"; // Assuming common base URL

export default function KnowledgeBasePage() {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [sops, setSops] = useState<SOPItem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("全部");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("faqs"); // 'faqs' or 'sops'
  const [selectedItem, setSelectedItem] = useState<FAQItem | SOPItem | null>(null);
  const navigate = useNavigate();
  const params = useParams<{ id: string }>(); // To potentially handle deep linking via URL params

  // Fetch FAQs
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/faq`)
      .then(res => res.json())
      .then(data => {
        setFaqs(data);
        // Pre-select first FAQ if available and on FAQ tab and no specific ID in URL
        if (data.length > 0 && activeTab === 'faqs' && !params.id) {
             setSelectedItem(data[0]);
        } else if (params.id && data.find((item: FAQItem) => item.id === params.id)) {
             setSelectedItem(data.find((item: FAQItem) => item.id === params.id));
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch FAQs:", err);
        setLoading(false);
      });
  }, [activeTab, params.id]); // Re-fetch or re-process if tab changes or ID in URL changes

  // Fetch SOPs
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/sop`)
      .then(res => res.json())
      .then(data => {
        setSops(data);
        // Pre-select first SOP if available and on SOP tab and no specific ID in URL
        if (data.length > 0 && activeTab === 'sops' && !params.id) {
             setSelectedItem(data[0]);
        } else if (params.id && data.find((item: SOPItem) => item.id === params.id)) {
             setSelectedItem(data.find((item: SOPItem) => item.id === params.id));
        }
      })
      .catch(err => {
        console.error("Failed to fetch SOPs:", err);
      });
  }, [activeTab, params.id]); // Re-fetch or re-process if tab changes or ID in URL changes

  // Filtered lists
  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = 
      faq.question.toLowerCase().includes(search.toLowerCase()) ||
      faq.answer.toLowerCase().includes(search.toLowerCase()) ||
      faq.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
    
    const matchesCategory = selectedCategory === "全部" || faq.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const filteredSOPs = sops.filter(sop => {
    const matchesSearch = 
      sop.title.toLowerCase().includes(search.toLowerCase()) ||
      sop.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase())) ||
      sop.rule.description.toLowerCase().includes(search.toLowerCase()) ||
      sop.operation.steps.some(step => step.action.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory = selectedCategory === "全部" || sop.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Handle category selection change
  const currentCategories = activeTab === "faqs" ? FAQ_CATEGORIES : SOP_CATEGORIES;
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
  };

  // Function to render SOP link from FAQ item
  const renderSopLinkFromFaq = (sopId?: string) => {
    if (!sopId) return null;
    return (
      <Button asChild variant="link" size="sm" className="px-0 h-auto text-xs">
        <Link to={`/knowledge-base/sop/${sopId}`}>
          <ExternalLink className="mr-1.5 h-3 w-3" />
          查看相關 SOP
        </Link>
      </Button>
    );
  };

  // Function to render FAQ link from SOP item
  const renderFaqLinkFromSop = (faqIds?: string[]) => {
    if (!faqIds || faqIds.length === 0) return null;
    // For simplicity, link to the first associated FAQ
    const faqId = faqIds[0]; 
    return (
      <Button asChild variant="link" size="sm" className="px-0 h-auto text-xs">
        <Link to={`/knowledge-base/faq/${faqId}`}>
          <Info className="mr-1.5 h-3 w-3" />
          查看相關 FAQ
        </Link>
      </Button>
    );
  };

  // Render SOP detail view
  const renderSopDetail = (sop: SOPItem) => {
    return (
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="font-normal">
                {sop.category}
              </Badge>
              <span className="text-sm text-muted-foreground">
                更新於 {sop.updated_at}
              </span>
            </div>
            <span className="font-bold text-lg">{sop.title}</span>
          </div>
          <CardDescription>
            {sop.rule.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="rules" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="rules">規則</TabsTrigger>
              <TabsTrigger value="operation">OA 操作步驟</TabsTrigger>
              <TabsTrigger value="exceptions">例外情況</TabsTrigger>
            </TabsList>
            <TabsContent value="rules" className="space-y-4">
              <h3 className="font-semibold">說明</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{sop.rule.description}</p>
              <h3 className="font-semibold">適用條件</h3>
              <ul className="list-disc list-inside text-sm text-muted-foreground leading-relaxed marker:text-muted-foreground/70">
                {sop.rule.conditions.map((cond, index) => <li key={index}>{cond}</li>)}
              </ul>
              <h3 className="font-semibold">限制</h3>
              <ul className="list-disc list-inside text-sm text-muted-foreground leading-relaxed marker:text-muted-foreground/70">
                {sop.rule.restrictions.map((rest, index) => <li key={index}>{rest}</li>)}
              </ul>
            </TabsContent>
            <TabsContent value="operation" className="space-y-4">
              <h3 className="font-semibold">操作步驟</h3>
              <Accordion type="single" collapsible className="w-full">
                {sop.operation.steps.map(step => (
                  <AccordionItem key={step.step} value={`step-${step.step}`} className="border-b px-0">
                    <AccordionTrigger className="py-3 font-medium text-left text-base hover:no-underline">
                      <div className="flex items-center gap-2">
                        <span className="text-primary font-bold">Step {step.step}:</span>
                        <span>{step.action}</span>
                      </div>
                    </AccordionTrigger>
                    {step.path && (
                      <AccordionContent className="pb-4 pt-0">
                        <div className="p-3 rounded-md bg-primary/5 border border-primary/20 font-mono text-sm text-primary flex items-center gap-2">
                          <ChevronRight className="h-4 w-4" />
                          <code>{step.path}</code>
                        </div>
                      </AccordionContent>
                    )}
                  </AccordionItem>
                ))}
              </Accordion>
            </TabsContent>
            <TabsContent value="exceptions" className="space-y-4">
              <h3 className="font-semibold">例外情況處理</h3>
              {sop.exceptions.length > 0 ? (
                <ul className="list-disc list-inside text-sm text-muted-foreground leading-relaxed">
                  {sop.exceptions.map((exc, index) => (
                    <li key={index}>
                      <span className="font-medium text-foreground">情境：</span>{exc.scenario}<br/>
                      <span className="font-medium text-foreground">處理方式：</span>{exc.handling}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">本 SOP 無已知例外情況。</p>
              )}
            </TabsContent>
          </Tabs>

          {(sop.linked_faq || sop.linked_template) && (
            <div className="flex flex-wrap gap-3 pt-4 mt-4 border-t">
              {renderFaqLinkFromSop(sop.linked_faq)}
              {sop.linked_template && (
                <Button asChild variant="link" size="sm" className="px-0 h-auto text-xs text-purple-600">
                  <Link to={`/templates?id=${sop.linked_template[0]}`}> {/* Assuming templates are also linked by ID */}
                    <Mail className="mr-1.5 h-3 w-3" />
                    使用對應模板
                  </Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // Render FAQ detail view
  const renderFaqDetail = (faq: FAQItem) => {
    return (
      <AccordionItem 
        key={faq.id} 
        value={faq.id}
        className="border rounded-lg px-4 bg-background hover:bg-slate-50/50 transition-colors"
      >
        <AccordionTrigger className="hover:no-underline py-4 text-left">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="font-normal">
                {faq.category}
              </Badge>
              <span className="text-sm text-muted-foreground">
                更新於 {faq.updated_at}
              </span>
            </div>
            <span className="font-semibold text-base">{faq.question}</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-4 pt-0 space-y-4">
          <div className="p-4 rounded-md bg-slate-50 dark:bg-slate-900 border text-sm leading-relaxed whitespace-pre-wrap">
            {faq.answer}
          </div>

          <div className="flex flex-wrap gap-2">
            {faq.tags.map(tag => (
              <Badge key={tag} variant="outline" className="text-[10px] px-2 py-0">
                #{tag}
              </Badge>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {faq.ops_note && (
              <Card className="bg-orange-50/30 border-orange-200/50">
                <CardContent className="p-3">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-orange-500 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-orange-700">運營備注</p>
                      <p className="text-xs text-orange-600/90 leading-relaxed">
                        {faq.ops_note}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {faq.answer_en && (
              <Card className="bg-blue-50/30 border-blue-200/50">
                <CardContent className="p-3">
                  <div className="flex items-start gap-2">
                    <Globe className="h-4 w-4 text-blue-500 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-blue-700">英文回覆</p>
                      <p className="text-xs text-blue-600/90 leading-relaxed italic">
                        {faq.answer_en}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {(faq.linked_sop || faq.linked_template) && (
            <div className="flex gap-3 pt-2 border-t mt-4">
              {renderSopLinkFromFaq(faq.linked_sop)}
              {faq.linked_template && (
                <Button asChild variant="link" size="sm" className="px-0 h-auto text-xs text-purple-600">
                  <Link to={`/templates?id=${faq.linked_template}`}> {/* Assuming templates are linked by ID */}
                    <Mail className="mr-1.5 h-3 w-3" />
                    使用對應模板
                  </Link>
                </Button>
              )}
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    );
  };

  // Render list items based on active tab
  const renderListItems = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-40">
          <p className="text-muted-foreground animate-pulse">載入中...</p>
        </div>
      );
    }
    
    const listToRender = activeTab === "faqs" ? filteredFaqs : filteredSOPs;
    const emptyMessage = activeTab === "faqs" 
      ? "查無符合結果，請嘗試其他關鍵字。" 
      : "查無符合結果，請嘗試其他關鍵字。";

    if (listToRender.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      );
    }

    if (activeTab === "faqs") {
      return (
        <Accordion type="single" collapsible className="w-full space-y-4">
          {listToRender.map((item) => renderFaqDetail(item as FAQItem))}
        </Accordion>
      );
    } else { // activeTab === "sops"
      return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {listToRender.map((item) => {
            const sop = item as SOPItem;
            return (
              <Card 
                key={sop.id} 
                className={`hover:shadow-md transition-shadow flex flex-col cursor-pointer ${selectedItem?.id === sop.id ? 'border-primary ring-2 ring-primary' : ''}`}
                onClick={() => handleItemSelect(sop)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="outline" className="font-normal text-xs px-2 py-0">
                      {sop.category}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      更新於 {sop.updated_at}
                    </span>
                  </div>
                  <CardTitle className="text-base leading-relaxed mt-2">{sop.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    {sop.rule.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {sop.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-[10px] px-2 py-0">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex justify-end">
                    <Button asChild variant="link" size="sm" className="px-0 h-auto text-xs">
                      <Link to={`/knowledge-base/sop/${sop.id}`}>
                        查看詳情
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      );
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] gap-6">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">知識庫</h2>
          <p className="text-muted-foreground">查找標準回覆、運營備注與關聯流程。</p>
        </div>

        <Tabs defaultValue={activeTab} className="w-full" onValueChange={(value) => setActiveTab(value as 'faqs' | 'sops')}>
          <TabsList className="mb-6">
            <TabsTrigger value="faqs">FAQ</TabsTrigger>
            <TabsTrigger value="sops">SOP</TabsTrigger>
          </TabsList>

          <TabsContent value="faqs" className="m-0 p-0">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜尋 FAQ 問題、內容或標籤..."
                  className="pl-10 h-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                {currentCategories.map(category => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    className="whitespace-nowrap"
                    onClick={() => handleCategorySelect(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
            <ScrollArea className="flex-1 rounded-md border bg-card mt-6 h-[calc(100vh-18rem)]">
              <div className="p-6">
                {renderListItems()}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="sops" className="m-0 p-0">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜尋 SOP 標題、標籤或關鍵字..."
                  className="pl-10 h-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                {currentCategories.map(category => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    className="whitespace-nowrap"
                    onClick={() => handleCategorySelect(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
            <ScrollArea className="flex-1 rounded-md border bg-card mt-6 h-[calc(100vh-18rem)]">
              <div className="p-6">
                {renderListItems()}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
      {/* Detail view area - currently handled by navigation to sub-routes */}
      {/* If a detail view is needed on the same page, it would be rendered here based on selectedItem */}
    </div>
  );
}
