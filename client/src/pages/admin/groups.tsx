import { useState, useEffect } from "react";
import { 
  Users, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Save
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn, API_BASE_URL, fetchWithAuth } from "@/lib/utils";

interface GroupItem {
  id: string;
  division: string;
  name: string;
  purpose: string;
  use_cases: string[];
  contacts: string[];
  notes?: string;
}

const DIVISIONS = ["運營", "金流", "產品", "機器人", "其他"];

export default function AdminGroupsPage() {
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentGroup, setCurrentGroup] = useState<Partial<GroupItem> | null>(null);
  const [useCaseInput, setUseCaseInput] = useState("");
  const [contactInput, setContactInput] = useState("");

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/api/groups`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setGroups(data);
      } else {
        setGroups([]);
      }
    } catch (_err) {
      toast.error("無法載入群組資料");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchGroups();
  }, []);

  const handleSave = async () => {
    if (!currentGroup?.name || !currentGroup?.division) {
      toast.error("請填寫名稱與部門");
      return;
    }

    setIsSaving(true);
    const admin = localStorage.getItem("user_name") || "Admin";
    let updatedGroups = [...groups];

    const processedGroup = {
      ...currentGroup,
      use_cases: useCaseInput.split(/[，,]/).map(s => s.trim()).filter(Boolean),
      contacts: contactInput.split(/[，,]/).map(s => s.trim()).filter(Boolean),
    };

    if (currentGroup.id) {
      updatedGroups = updatedGroups.map(g => g.id === currentGroup.id ? processedGroup as GroupItem : g);
    } else {
      const newGroup = { ...processedGroup, id: `grp_${Date.now()}` } as GroupItem;
      updatedGroups.unshift(newGroup);
    }

    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/api/admin/update/groups`, {
        method: "POST",
        body: JSON.stringify({ data: updatedGroups, admin })
      });

      if (res.ok) {
        setGroups(updatedGroups);
        setIsEditing(false);
        setCurrentGroup(null);
        toast.success("群組資料已更新");
      }
    } catch (err) {
      toast.error("儲存失敗");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteGroup = async (id: string) => {
    if (!confirm("確定要刪除此群組嗎？")) return;
    
    const admin = localStorage.getItem("user_name") || "Admin";
    const updated = groups.filter(g => g.id !== id);

    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/api/admin/update/groups`, {
        method: "POST",
        body: JSON.stringify({ data: updated, admin })
      });
      if (res.ok) {
        setGroups(updated);
        toast.success("群組已刪除");
      }
    } catch (err) {
      toast.error("刪除失敗");
    }
  };

  const filteredGroups = groups.filter(g => 
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.division.toLowerCase().includes(search.toLowerCase()) ||
    g.purpose.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="搜尋群組名稱、部門或用途..."
            className="pl-10 h-11 rounded-xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button onClick={() => {
          setCurrentGroup({ division: "運營" });
          setUseCaseInput("");
          setContactInput("");
          setIsEditing(true);
        }} className="rounded-xl h-11 font-bold shadow-lg shadow-primary/20">
          <Plus className="mr-2 h-4 w-4" /> 建立新群組
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-16rem)] rounded-2xl border bg-white shadow-sm">
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-slate-50 animate-pulse rounded-2xl" />
            ))
          ) : filteredGroups.map((group) => (
            <Card key={group.id} className="p-5 border-slate-100 hover:border-primary/20 transition-all flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="space-y-1">
                    <Badge variant="secondary" className="text-[10px] font-bold uppercase">{group.division}</Badge>
                    <h3 className="text-lg font-black text-slate-900">{group.name}</h3>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-primary" onClick={() => {
                      setCurrentGroup(group);
                      setUseCaseInput(group.use_cases.join(", "));
                      setContactInput(group.contacts.join(", "));
                      setIsEditing(true);
                    }}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-red-500" onClick={() => deleteGroup(group.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2 mb-4 font-medium">{group.purpose}</p>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-slate-50 text-[10px] font-bold">
                <span className="text-slate-400">負責人: {group.contacts.join(", ")}</span>
                <code className="text-slate-300 font-mono">ID: {group.id}</code>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-2xl rounded-2xl border-none shadow-2xl overflow-hidden p-0">
          <DialogHeader className="p-6 border-b bg-slate-50/50">
            <DialogTitle className="text-xl font-black flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <Users className="h-5 w-5 text-white" />
              </div>
              {currentGroup?.id ? "編輯群組資訊" : "建立新群組"}
            </DialogTitle>
            <DialogDescription className="sr-only">
              設定群組名稱、所屬部門、用途說明及相關聯繫人。
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[70vh]">
            <div className="p-4 md:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">群組名稱</Label>
                  <Input 
                    placeholder="如: OPST 運營核心群" 
                    className="h-11 rounded-xl font-bold"
                    value={currentGroup?.name || ""}
                    onChange={e => setCurrentGroup({...currentGroup!, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">所屬部門</Label>
                  <div className="flex flex-wrap gap-2">
                    {DIVISIONS.map(div => (
                      <button
                        key={div}
                        onClick={() => setCurrentGroup({...currentGroup!, division: div})}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-bold border transition-all",
                          currentGroup?.division === div ? "bg-slate-900 text-white border-slate-900 shadow-md" : "bg-white text-slate-500 border-slate-200 hover:border-primary/50"
                        )}
                      >
                        {div}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">用途說明 (Purpose)</Label>
                <Textarea 
                  placeholder="簡述此群組主要處理的事項..."
                  className="min-h-[80px] rounded-xl text-sm leading-relaxed"
                  value={currentGroup?.purpose || ""}
                  onChange={e => setCurrentGroup({...currentGroup!, purpose: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">常見場景 (以逗號分隔)</Label>
                  <Input 
                    placeholder="如: 查單, 報表, 權限申請" 
                    className="h-11 rounded-xl"
                    value={useCaseInput}
                    onChange={e => setUseCaseInput(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">負責人/聯繫人 (以逗號分隔)</Label>
                  <Input 
                    placeholder="如: Hank, Eric" 
                    className="h-11 rounded-xl"
                    value={contactInput}
                    onChange={e => setContactInput(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">額外備註 (可選)</Label>
                <Input 
                  placeholder="如: 重要問題請標註特定對象" 
                  className="h-11 rounded-xl text-xs"
                  value={currentGroup?.notes || ""}
                  onChange={e => setCurrentGroup({...currentGroup!, notes: e.target.value})}
                />
              </div>
            </div>
          </ScrollArea>


          <DialogFooter className="p-6 border-t bg-slate-50/50 gap-3">
            <Button variant="ghost" onClick={() => setIsEditing(false)} className="rounded-xl font-bold text-slate-400">
              取消
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="rounded-xl font-bold px-10 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90">
              <Save className="mr-2 h-4 w-4" /> {isSaving ? "處理中..." : "儲存群組設定"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
