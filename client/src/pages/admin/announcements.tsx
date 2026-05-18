import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Search, 
  Edit2, 
  Eye, 
  EyeOff, 
  Save, 
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { cn, API_BASE_URL } from "@/lib/utils"

interface Announcement {
  id: string
  title: string
  content: string
  type: "feature" | "update" | "maintenance" | "emergency"
  priority: "low" | "normal" | "high" | "urgent"
  date: string
  status: "active" | "disabled"
}

const TYPES = [
  { value: "feature", label: "新功能", color: "bg-blue-500" },
  { value: "update", label: "系統更新", color: "bg-emerald-500" },
  { value: "maintenance", label: "系統維護", color: "bg-amber-500" },
  { value: "emergency", label: "緊急通知", color: "bg-rose-500" },
]

const PRIORITIES = [
  { value: "low", label: "普通", color: "text-slate-400" },
  { value: "normal", label: "一般", color: "text-blue-500" },
  { value: "high", label: "重要", color: "text-amber-500" },
  { value: "urgent", label: "緊急", color: "text-rose-500" },
]

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [currentAnn, setCurrentAnn] = useState<Partial<Announcement> | null>(null)

  const fetchAnnouncements = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/announcements`)
      const data = await res.json()
      // Ensure status field exists for older data
      const normalizedData = data.map((item: Announcement) => ({
        ...item,
        status: item.status || "active"
      }))
      setAnnouncements(normalizedData)
    } catch (_err) {
      toast.error("無法載入公告資料")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchAnnouncements()
  }, [])

  const handleSave = async () => {
    if (!currentAnn?.title || !currentAnn?.content || !currentAnn?.type) {
      toast.error("請填寫標題、內容與類型")
      return
    }

    const admin = localStorage.getItem("admin_user") || "Admin"
    let updatedList = [...announcements]
    const today = new Date().toISOString().split('T')[0]

    if (currentAnn.id) {
      // Update
      updatedList = updatedList.map(a => 
        a.id === currentAnn.id ? { ...a, ...currentAnn } as Announcement : a
      )
    } else {
      // Create
      const newAnn: Announcement = {
        ...currentAnn as Announcement,
        id: `ann_${Date.now()}`,
        date: today,
        status: "active",
        priority: currentAnn.priority || "normal"
      }
      updatedList.unshift(newAnn)
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/update/announcements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: updatedList, admin })
      })

      if (res.ok) {
        setAnnouncements(updatedList)
        setIsEditing(false)
        setCurrentAnn(null)
        toast.success(currentAnn.id ? "公告已更新" : "公告已發布")
      } else {
        throw new Error()
      }
    } catch (_err) {
      toast.error("儲存失敗，請檢查網路連線")
    }
  }

  const toggleStatus = async (id: string) => {
    const admin = localStorage.getItem("admin_user") || "Admin"
    const updatedList = announcements.map(a => {
      if (a.id === id) {
        return { ...a, status: a.status === "active" ? "disabled" : "active" as "active" | "disabled" }
      }
      return a
    })

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/update/announcements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: updatedList, admin })
      })

      if (res.ok) {
        setAnnouncements(updatedList)
        toast.info("狀態已變更")
      }
    } catch (_err) {
      toast.error("操作失敗")
    }
  }

  const filteredAnnouncements = announcements.filter(a => 
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.content.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">公告管理</h2>
          <p className="text-muted-foreground text-sm">維護首頁展示的產品公告與重要通知</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="搜尋公告..."
              className="pl-9 h-10 rounded-xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button 
            onClick={() => {
              setCurrentAnn({ type: "update", priority: "normal" })
              setIsEditing(true)
            }}
            className="rounded-xl font-bold shadow-lg shadow-primary/20 gap-2"
          >
            <Plus className="h-4 w-4" /> 發布公告
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">公告列表</CardTitle>
          <CardDescription>目前系統中所有發布的公告紀錄</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-slate-100 overflow-hidden">
            <div className="grid grid-cols-12 bg-slate-50 dark:bg-slate-900/50 border-b p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
              <div className="col-span-6">標題與內容摘要</div>
              <div className="col-span-2">類型</div>
              <div className="col-span-2">日期</div>
              <div className="col-span-2 text-right">操作</div>
            </div>
            <div className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-8 text-center animate-pulse bg-white/50" />
                ))
              ) : filteredAnnouncements.length > 0 ? (
                filteredAnnouncements.map((ann) => (
                  <div 
                    key={ann.id} 
                    className={cn(
                      "grid grid-cols-12 p-4 items-center transition-colors hover:bg-slate-50/50",
                      ann.status === "disabled" && "opacity-50 grayscale"
                    )}
                  >
                    <div className="col-span-6 pr-4">
                      <div className="font-bold text-slate-900 mb-1">{ann.title}</div>
                      <div className="text-xs text-slate-500 line-clamp-1">{ann.content}</div>
                    </div>
                    <div className="col-span-2">
                      <Badge 
                        variant="secondary" 
                        className={cn(
                          "text-[10px] font-bold uppercase",
                          ann.type === "emergency" && "bg-rose-100 text-rose-600",
                          ann.type === "maintenance" && "bg-amber-100 text-amber-600",
                          ann.type === "feature" && "bg-blue-100 text-blue-600"
                        )}
                      >
                        {TYPES.find(t => t.value === ann.type)?.label || ann.type}
                      </Badge>
                    </div>
                    <div className="col-span-2 text-xs text-slate-400 font-medium">
                      {ann.date}
                    </div>
                    <div className="col-span-2 text-right space-x-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-slate-400 hover:text-primary"
                        onClick={() => {
                          setCurrentAnn(ann)
                          setIsEditing(true)
                        }}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className={cn(
                          "h-8 w-8",
                          ann.status === "active" ? "text-slate-400 hover:text-amber-500" : "text-amber-500 hover:text-emerald-500"
                        )}
                        onClick={() => toggleStatus(ann.id)}
                      >
                        {ann.status === "active" ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center">
                  <AlertCircle className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">目前沒有任何公告</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">
              {currentAnn?.id ? "編輯公告" : "發布新公告"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">公告標題</Label>
              <Input 
                placeholder="輸入公告標題..."
                value={currentAnn?.title || ""}
                onChange={(e) => setCurrentAnn(prev => ({ ...prev!, title: e.target.value }))}
                className="rounded-xl font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">類型</Label>
                <Select 
                  value={currentAnn?.type} 
                  onValueChange={(v) => setCurrentAnn(prev => ({ ...prev!, type: v as any }))}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="選擇類型" />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPES.map(t => (
                      <SelectItem key={t.value} value={t.value}>
                        <div className="flex items-center gap-2">
                          <div className={cn("h-2 w-2 rounded-full", t.color)} />
                          {t.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">優先級</Label>
                <Select 
                  value={currentAnn?.priority} 
                  onValueChange={(v) => setCurrentAnn(prev => ({ ...prev!, priority: v as any }))}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="選擇優先級" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map(p => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">內容詳細描述</Label>
              <Textarea 
                placeholder="輸入公告具體內容..."
                className="min-h-[150px] rounded-xl leading-relaxed"
                value={currentAnn?.content || ""}
                onChange={(e) => setCurrentAnn(prev => ({ ...prev!, content: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsEditing(false)} className="rounded-xl font-bold">
              取消
            </Button>
            <Button onClick={handleSave} className="rounded-xl font-bold px-8">
              <Save className="mr-2 h-4 w-4" /> 
              {currentAnn?.id ? "儲存變更" : "立即發布"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
