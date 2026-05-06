import { 
  FileQuestion, 
  FileText, 
  Mail, 
  Wrench, 
  ArrowRight 
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { ChainParser } from "@/components/chain-parser"

const shortcuts = [
  { 
    title: "FAQ 知識庫", 
    desc: "快速查找常見問題與標準回覆", 
    icon: FileQuestion, 
    href: "/knowledge-base",
    initialTab: "faqs",
    color: "text-blue-500",
    bg: "bg-blue-500/10"
  },
  { 
    title: "SOP 操作流程", 
    desc: "標準化操作指引與系統路徑", 
    icon: FileText, 
    href: "/knowledge-base",
    initialTab: "sops",
    color: "text-green-500",
    bg: "bg-green-500/10"
  },
  { 
    title: "郵件模板庫", 
    desc: "一鍵複製與情境卡片回覆", 
    icon: Mail, 
    href: "/templates",
    color: "text-purple-500",
    bg: "bg-purple-500/10"
  },
  { 
    title: "系統工具", 
    desc: "快速存取 OA、CRM 與帳號資源", 
    icon: Wrench, 
    href: "/tools",
    color: "text-orange-500",
    bg: "bg-orange-500/10"
  },
]

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-3xl font-bold tracking-tight mb-2">運營領航站</h2>
        <p className="text-muted-foreground">歡迎回來，這是您的運營工具箱。</p>
      </section>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {shortcuts.map((item) => (
          <Card key={item.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
              <div className={`${item.bg} p-2 rounded-lg`}>
                <item.icon className={`h-4 w-4 ${item.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-4">{item.desc}</p>
              <Button asChild variant="ghost" size="sm" className="w-full justify-between">
                <Link to={item.href} state={{ initialTab: item.initialTab }}>
                  進入模組
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <ChainParser />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>產品公告</CardTitle>
            <CardDescription>最近更新與重要通知</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center border-t border-dashed">
            <p className="text-muted-foreground italic text-sm">即將推出...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
