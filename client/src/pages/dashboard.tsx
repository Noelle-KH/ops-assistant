import { 
  FileQuestion, 
  Mail, 
  Users,
  Wrench, 
  ArrowRight,
  Bell,
  Megaphone,
  Info,
  Calendar,
  ShieldAlert
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Link } from "react-router-dom"
import { ChainParser } from "@/components/chain-parser"
import { useEffect, useState } from "react"
import { API_BASE_URL, fetchWithAuth } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'feature' | 'update' | 'maintenance' | 'emergency';
  priority: 'high' | 'normal' | 'low' | 'urgent';
  date: string;
  status?: 'active' | 'disabled';
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
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null)

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await fetchWithAuth(`${API_BASE_URL}/api/announcements`)
        const data = await res.json()
        if (Array.isArray(data)) {
          // Only show active announcements
          const activeData = data.filter((item: Announcement) => item.status !== 'disabled')
          setAnnouncements(activeData)
        } else {
          setAnnouncements([])
        }
      } catch (err) {
        console.error('Failed to fetch announcements:', err)
      } finally {
        setLoading(false)
      }
    }

    void fetchAnnouncements()
  }, [])

  const getAnnouncementIcon = (type: string) => {
    switch (type) {
      case 'feature': return <Megaphone className="h-4 w-4 text-blue-500" />
      case 'update': return <Info className="h-4 w-4 text-emerald-500" />
      case 'maintenance': return <Bell className="h-4 w-4 text-amber-500" />
      case 'emergency': return <ShieldAlert className="h-4 w-4 text-rose-500" />
      default: return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent': 
        return (
          <Badge className="text-[10px] px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white border-none shadow-sm shadow-rose-200 animate-pulse font-black">
            <ShieldAlert className="h-3 w-3 mr-1" />
            緊急公告
          </Badge>
        )
      case 'high': 
        return (
          <Badge className="text-[10px] px-2 py-0.5 bg-orange-500 hover:bg-orange-600 text-white border-none shadow-sm shadow-orange-100 font-black">
            重要
          </Badge>
        )
      default: return null
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'feature': return '新功能'
      case 'update': return '系統更新'
      case 'maintenance': return '維護通知'
      case 'emergency': return '緊急公告'
      default: return '公告'
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
          <Card key={item.title} className="hover:shadow-md transition-shadow group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
              <div className={`${item.bg} p-2 rounded-lg group-hover:scale-110 transition-transform`}>
                <item.icon className={`h-4 w-4 ${item.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-4">{item.desc}</p>
              <Button asChild variant="ghost" size="sm" className="w-full justify-between hover:bg-slate-100">
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
        <Card className="flex flex-col border-none shadow-xl bg-white/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <Bell className="h-4 w-4 text-primary" />
                </div>
                <CardTitle className="text-lg font-black">產品公告</CardTitle>
              </div>
              <Badge variant="secondary" className="rounded-full bg-slate-100 text-slate-500 font-bold">{announcements.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-[400px] px-6">
              <div className="space-y-3 pb-6">
                {loading ? (
                  <div className="flex items-center justify-center h-[200px]">
                    <p className="text-sm text-muted-foreground animate-pulse">載入中...</p>
                  </div>
                ) : announcements.length > 0 ? (
                  announcements.map((ann) => (
                    <div 
                      key={ann.id} 
                      className="group p-4 rounded-2xl border border-transparent hover:border-slate-100 hover:bg-white hover:shadow-sm transition-all cursor-pointer"
                      onClick={() => setSelectedAnnouncement(ann)}
                    >
                      <div className="flex items-start gap-3 mb-2">
                        <div className="mt-1 bg-slate-50 p-2 rounded-xl group-hover:bg-primary/5 transition-colors">
                          {getAnnouncementIcon(ann.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <h4 className="text-sm font-bold text-slate-800 truncate group-hover:text-primary transition-colors">{ann.title}</h4>
                            <span className="text-[10px] text-slate-400 font-mono shrink-0">{ann.date}</span>
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                            {ann.content}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-11">
                        {getPriorityBadge(ann.priority)}
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-slate-200 text-slate-400 bg-transparent font-medium">
                          {getTypeLabel(ann.type)}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-[200px] gap-2">
                    <Megaphone className="h-8 w-8 text-slate-100" />
                    <p className="text-slate-400 italic text-sm font-bold">產品公告即將推出</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Announcement Detail Dialog */}
      <Dialog open={!!selectedAnnouncement} onOpenChange={(open) => !open && setSelectedAnnouncement(null)}>
        <DialogContent className="max-w-2xl border-none shadow-2xl p-0 overflow-hidden rounded-3xl">
          {selectedAnnouncement && (
            <div className="flex flex-col">
              <div className="h-32 bg-primary/5 p-8 flex items-end justify-between border-b border-primary/10">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                    {getAnnouncementIcon(selectedAnnouncement.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {getPriorityBadge(selectedAnnouncement.priority)}
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">
                        {getTypeLabel(selectedAnnouncement.type)}
                      </span>
                    </div>
                    <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">
                      {selectedAnnouncement.title}
                    </DialogTitle>
                  </div>
                </div>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="flex items-center gap-2 text-slate-400">
                  <Calendar className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">發佈日期：{selectedAnnouncement.date}</span>
                </div>
                
                <div className="prose prose-slate max-w-none">
                  <DialogDescription className="text-slate-600 leading-loose whitespace-pre-wrap font-medium text-base">
                    {selectedAnnouncement.content}
                  </DialogDescription>
                </div>
                
                <div className="pt-6 border-t border-slate-100">
                  <Button 
                    className="w-full h-12 rounded-2xl font-bold text-base"
                    onClick={() => setSelectedAnnouncement(null)}
                  >
                    我知道了
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
