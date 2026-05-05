import { useState, useEffect } from "react"
import { Search, Info, Globe, ExternalLink, Mail } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Link } from "react-router-dom"

interface FAQItem {
  id: string
  category: string
  tags: string[]
  question: string
  answer: string
  ops_note?: string
  answer_en?: string
  linked_sop?: string
  linked_template?: string
  updated_at: string
}

const CATEGORIES = ["全部", "開戶", "交易帳戶", "入金", "出金", "交易", "代理", "活動"]

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQItem[]>([])
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("全部")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("http://localhost:3001/api/faq")
      .then(res => res.json())
      .then(data => {
        setFaqs(data)
        setLoading(false)
      })
      .catch(err => {
        console.error("Failed to fetch FAQs:", err)
        setLoading(false)
      })
  }, [])

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = 
      faq.question.toLowerCase().includes(search.toLowerCase()) ||
      faq.answer.toLowerCase().includes(search.toLowerCase()) ||
      faq.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
    
    const matchesCategory = selectedCategory === "全部" || faq.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] gap-6">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">FAQ 知識庫</h2>
          <p className="text-muted-foreground">查找標準回覆、運營備注與關聯流程。</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜尋問題、內容或標籤..."
              className="pl-10 h-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            {CATEGORIES.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                className="whitespace-nowrap"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 rounded-md border bg-card">
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <p className="text-muted-foreground animate-pulse">載入中...</p>
            </div>
          ) : filteredFaqs.length > 0 ? (
            <Accordion type="single" collapsible className="w-full space-y-4">
              {filteredFaqs.map((faq) => (
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
                        {faq.linked_sop && (
                          <Button asChild variant="link" size="sm" className="px-0 h-auto text-xs">
                            <Link to={`/sop?id=${faq.linked_sop}`}>
                              <ExternalLink className="mr-1.5 h-3 w-3" />
                              查看相關 SOP
                            </Link>
                          </Button>
                        )}
                        {faq.linked_template && (
                          <Button asChild variant="link" size="sm" className="px-0 h-auto text-xs text-purple-600">
                            <Link to={`/templates?id=${faq.linked_template}`}>
                              <Mail className="mr-1.5 h-3 w-3" />
                              使用對應模板
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
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-muted-foreground">查無符合結果，請嘗試其他關鍵字。</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
