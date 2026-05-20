import { useState, useEffect } from "react";
import { 
  Wrench, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  ShieldAlert
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { cn, API_BASE_URL, fetchWithAuth } from "@/lib/utils";

interface AccountInfo {
  role: string;
  username: string;
  password?: string;
  is_sensitive: boolean;
}

interface ToolItem {
  id: string;
  category: string;
  name: string;
  url?: string;
  desc: string;
  accounts?: AccountInfo[];
}

const CATEGORIES = ["後台系統", "測試資源", "敏感資源", "其他"];

export default function AdminToolsPage() {
  const [tools, setTools] = useState<ToolItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTool, setCurrentTool] = useState<Partial<ToolItem> | null>(null);

  const fetchTools = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("user_token");
      const res = await fetch(`${API_BASE_URL}/api/tools`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setTools(data);
      } else {
        setTools([]);
      }
    } catch {
      toast.error("無法載入工具資料");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTools();
  }, []);

  const handleSave = async () => {
    if (!currentTool?.name || !currentTool?.category) {
      toast.error("請填寫名稱與分類");
      return;
    }

    setIsSaving(true);
    const admin = localStorage.getItem("user_name") || "Admin";
    const token = localStorage.getItem("user_token");
    let updatedTools = [...tools];

    const cleanedTool = {
      ...currentTool,
      name: currentTool.name || "",
      category: currentTool.category || "其他",
      desc: currentTool.desc || "",
      url: currentTool.url || "",
      accounts: currentTool.accounts || []
    };

    if (currentTool.id) {
      updatedTools = updatedTools.map(t => t.id === currentTool.id ? cleanedTool as ToolItem : t);
    } else {
      const newTool = { ...cleanedTool, id: `tool_${Date.now()}` } as ToolItem;
      updatedTools.unshift(newTool);
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/update/tools`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ data: updatedTools, admin })
      });

      if (res.ok) {
        setTools(updatedTools);
        setIsEditing(false);
        setCurrentTool(null);
        toast.success("工具資料已更新");
      }
    } catch (err) {
      toast.error("儲存失敗");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteTool = async (id: string) => {
    if (!confirm("確定要刪除此工具嗎？")) return;
    
    const admin = localStorage.getItem("user_name") || "Admin";
    const token = localStorage.getItem("user_token");
    const updated = tools.filter(t => t.id !== id);

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/update/tools`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ data: updated, admin })
      });
      if (res.ok) {
        setTools(updated);
        toast.success("工具已刪除");
      }
    } catch {
      toast.error("刪除失敗");
    }
  };

  const addAccount = () => {
    const updated = { ...currentTool };
    if (!updated.accounts) updated.accounts = [];
    updated.accounts.push({ role: "", username: "", password: "", is_sensitive: false });
    setCurrentTool(updated);
  };

  const removeAccount = (index: number) => {
    const updated = { ...currentTool };
    updated.accounts!.splice(index, 1);
    setCurrentTool(updated);
  };

  const filteredTools = tools.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.category.toLowerCase().includes(search.toLowerCase()) ||
    t.desc.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="搜尋工具名稱、分類或描述..."
            className="pl-10 h-11 rounded-xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button onClick={() => {
          setCurrentTool({ category: "後台系統", accounts: [] });
          setIsEditing(true);
        }} className="rounded-xl h-11 font-bold shadow-lg shadow-primary/20">
          <Plus className="mr-2 h-4 w-4" /> 建立新工具
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-16rem)] rounded-2xl border bg-white shadow-sm">
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-slate-50 animate-pulse rounded-2xl" />
            ))
          ) : filteredTools.map((tool) => (
            <Card key={tool.id} className="p-5 border-slate-100 hover:border-primary/20 transition-all flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="space-y-1">
                    <Badge variant="secondary" className="text-[10px] font-bold uppercase">{tool.category}</Badge>
                    <h3 className="text-lg font-black text-slate-900">{tool.name}</h3>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-primary" onClick={() => {
                      setCurrentTool(tool);
                      setIsEditing(true);
                    }}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-red-500" onClick={() => deleteTool(tool.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-slate-500 line-clamp-1 mb-4 font-medium">{tool.desc}</p>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-slate-50 text-[10px] font-bold">
                <span className="text-slate-400">{tool.accounts?.length || 0} 組帳號資訊</span>
                <code className="text-slate-300 font-mono">ID: {tool.id}</code>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-3xl rounded-2xl border-none shadow-2xl overflow-hidden p-0">
          <DialogHeader className="p-6 border-b bg-slate-50/50">
            <DialogTitle className="text-xl font-black flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <Wrench className="h-5 w-5 text-white" />
              </div>
              {currentTool?.id ? "編輯系統工具" : "建立新系統工具"}
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[70vh]">
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">工具/系統名稱</Label>
                  <Input 
                    placeholder="如: CRM 管理後台" 
                    className="h-11 rounded-xl font-bold"
                    value={currentTool?.name || ""}
                    onChange={e => setCurrentTool({...currentTool!, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">分類</Label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setCurrentTool({...currentTool!, category: cat})}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-bold border transition-all",
                          currentTool?.category === cat ? "bg-slate-900 text-white border-slate-900 shadow-md" : "bg-white text-slate-500 border-slate-200 hover:border-primary/50"
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">系統網址 (URL)</Label>
                  <Input 
                    placeholder="https://..." 
                    className="h-11 rounded-xl font-mono text-xs"
                    value={currentTool?.url || ""}
                    onChange={e => setCurrentTool({...currentTool!, url: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">備註說明</Label>
                  <Input 
                    placeholder="簡述此系統的用途..." 
                    className="h-11 rounded-xl"
                    value={currentTool?.desc || ""}
                    onChange={e => setCurrentTool({...currentTool!, desc: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-black uppercase text-primary tracking-widest">帳號資訊管理</Label>
                  <Button size="sm" variant="outline" className="h-7 rounded-lg text-[10px] font-bold" onClick={addAccount}>
                    <Plus className="mr-1 h-3 w-3" /> 新增帳號組
                  </Button>
                </div>

                <div className="space-y-3">
                  {currentTool?.accounts?.map((acc, index) => (
                    <div key={index} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 relative group">
                      <button 
                        onClick={() => removeAccount(index)}
                        className="absolute -top-2 -right-2 h-6 w-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-300 hover:text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-1">
                          <Label className="text-[9px] font-black text-slate-400">角色/用途</Label>
                          <Input 
                            value={acc.role} 
                            onChange={e => {
                              const updated = [...currentTool.accounts!];
                              updated[index].role = e.target.value;
                              setCurrentTool({...currentTool, accounts: updated});
                            }}
                            placeholder="如: 管理員"
                            className="h-8 text-xs rounded-lg"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[9px] font-black text-slate-400">使用者名稱</Label>
                          <Input 
                            value={acc.username} 
                            onChange={e => {
                              const updated = [...currentTool.accounts!];
                              updated[index].username = e.target.value;
                              setCurrentTool({...currentTool, accounts: updated});
                            }}
                            placeholder="Username"
                            className="h-8 text-xs rounded-lg font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[9px] font-black text-slate-400">密碼</Label>
                          <Input 
                            value={acc.password} 
                            type="text"
                            onChange={e => {
                              const updated = [...currentTool.accounts!];
                              updated[index].password = e.target.value;
                              setCurrentTool({...currentTool, accounts: updated});
                            }}
                            placeholder="Password"
                            className="h-8 text-xs rounded-lg font-mono"
                          />
                        </div>
                        <div className="flex flex-col justify-end pb-1">
                          <button
                            onClick={() => {
                              const updated = [...currentTool.accounts!];
                              updated[index].is_sensitive = !updated[index].is_sensitive;
                              setCurrentTool({...currentTool, accounts: updated});
                            }}
                            className={cn(
                              "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[9px] font-black transition-all",
                              acc.is_sensitive 
                                ? "bg-rose-50 border-rose-100 text-rose-600" 
                                : "bg-white border-slate-200 text-slate-400"
                            )}
                          >
                            <ShieldAlert className="h-3 w-3" />
                            {acc.is_sensitive ? "高度敏感 (遮罩)" : "一般資訊 (公開)"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!currentTool?.accounts || currentTool.accounts.length === 0) && (
                    <div className="py-8 text-center border-2 border-dashed border-slate-100 rounded-xl text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      無帳號資訊
                    </div>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="p-6 border-t bg-slate-50/50 gap-3">
            <Button variant="ghost" onClick={() => setIsEditing(false)} className="rounded-xl font-bold text-slate-400">
              取消
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="rounded-xl font-bold px-10 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90">
              <Save className="mr-2 h-4 w-4" /> {isSaving ? "處理中..." : "儲存工具設定"}
            </Button>
          </DialogFooter>

        </DialogContent>
      </Dialog>
    </div>
  );
}
