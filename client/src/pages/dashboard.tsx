import { 
  FileQuestion, 
  Mail, 
  Users,
  Wrench, 
  ArrowRight,
  Bell,
  Megaphone,
  Info
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Link } from "react-router-dom"
import { ChainParser } from "@/components/chain-parser"
import { useEffect, useState } from "react"

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'feature' | 'update' | 'maintenance';
  priority: 'high' | 'normal' | 'low';
  date: string;
}

const shortcuts = [
  { 
    title: "知識庫", 
    desc: "查找標準回覆、運營備注與 SOP 流程", 
    icon: FileQuestion, 
    href: "/knowledge-base",
    color: "text-blue-500",
    bg: "bg-blue-500/10"
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
    title: "群組目錄", 
    desc: "查找部門聯絡人與主要溝通頻道", 
    icon: Users, 
    href: "/groups",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10"
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
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://localhost:3001/api/announcements')
      .then(res => res.json())
      .then(data => {
        // Only show active announcements
        const activeData = data.filter((item: any) => item.status !== 'disabled')
        setAnnouncements(activeData)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch announcements:', err)
        setLoading(false)
      })
  }, [])

  const getAnnouncementIcon = (type: string) => {
    switch (type) {
      case 'feature': return <Megaphone className="h-4 w-4 text-blue-500" />
      case 'update': return <Info className="h-4 w-4 text-emerald-500" />
      case 'maintenance': return <Bell className="h-4 w-4 text-amber-500" />
      default: return <Info className="h-4 w-4 text-blue-500" />
    }
  }

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
                <Link to={item.href}>
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
        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>產品公告</CardTitle>
              <Badge variant="outline">{announcements.length}</Badge>
            </div>
            <CardDescription>最近更新與重要通知</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-[300px] px-6">
              <div className="space-y-4 pb-6">
                {loading ? (
                  <div className="flex items-center justify-center h-[200px]">
                    <p className="text-sm text-muted-foreground animate-pulse">載入中...</p>
                  </div>
                ) : announcements.length > 0 ? (
                  announcements.map((ann) => (
                    <div key={ann.id} className="border-b last:border-0 pb-4 last:pb-0">
                      <div className="flex items-start gap-3 mb-2">
                        <div className="mt-1 bg-muted p-1.5 rounded-md">
                          {getAnnouncementIcon(ann.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-sm font-semibold">{ann.title}</h4>
                            <span className="text-[10px] text-muted-foreground font-mono">{ann.date}</span>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {ann.content}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-10">
                        {ann.priority === 'high' && (
                          <Badge variant="destructive" className="text-[10px] px-1.5 py-0">重要</Badge>
                        )}
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 capitalize">
                          {ann.type}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-[200px]">
                    <p className="text-muted-foreground italic text-sm">暫無公告</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
