import { useState, useEffect } from "react";
import { 
  UserPlus, 
  ShieldAlert, 
  UserCheck, 
  UserX, 
  Search, 
  Edit2, 
  Trash2,
  Lock,
  Mail,
  Key,
  ShieldCheck,
  Zap,
  User
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface UserItem {
  id: string;
  username: string;
  displayName: string;
  role: "admin" | "high_level" | "operator";
  status: "active" | "disabled";
  lastLogin: string;
  createdAt: string;
}

const ROLES = [
  { 
    value: "admin", 
    label: "系統管理員", 
    description: "最高權限", 
    color: "bg-rose-600", 
    icon: ShieldAlert 
  },
  { 
    value: "high_level", 
    label: "高級運營", 
    description: "敏感資訊存取", 
    color: "bg-amber-500", 
    icon: Zap 
  },
  { 
    value: "operator", 
    label: "一般運營", 
    description: "基礎功能查詢", 
    color: "bg-blue-500", 
    icon: User 
  },
];

const API_BASE_URL = "http://localhost:3001";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState<Partial<UserItem> | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users`);
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      toast.error("無法載入使用者資料");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentUser?.username || !currentUser?.displayName || !currentUser?.role) {
      toast.error("請填寫所有必要欄位");
      return;
    }

    const admin = localStorage.getItem("admin_user") || "Admin";
    let updatedUsers = [...users];
    const now = new Date().toISOString();

    if (currentUser.id) {
      updatedUsers = updatedUsers.map(u => 
        u.id === currentUser.id ? { ...u, ...currentUser } as UserItem : u
      );
    } else {
      const newUser: UserItem = {
        ...currentUser as any,
        id: `u_${Date.now()}`,
        status: "active",
        lastLogin: "Never",
        createdAt: now.split('T')[0]
      };
      updatedUsers.unshift(newUser);
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/update/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: updatedUsers, admin })
      });

      if (res.ok) {
        setUsers(updatedUsers);
        setIsEditing(false);
        setCurrentUser(null);
        toast.success(currentUser.id ? "使用者資訊已更新" : "新帳號已建立");
      }
    } catch (err) {
      toast.error("儲存失敗");
    }
  };

  const toggleStatus = async (id: string) => {
    const admin = localStorage.getItem("admin_user") || "Admin";
    const updated = users.map(u => {
      if (u.id === id) {
        return { ...u, status: u.status === "active" ? "disabled" : "active" as any };
      }
      return u;
    });

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/update/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: updated, admin })
      });
      if (res.ok) {
        setUsers(updated);
        toast.info("使用者狀態已變更");
      }
    } catch (err) {
      toast.error("操作失敗");
    }
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.displayName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="搜尋使用者名稱或姓名..."
            className="pl-10 h-11 rounded-xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button onClick={() => {
          setCurrentUser({ role: "operator" });
          setIsEditing(true);
        }} className="rounded-xl h-11 font-bold shadow-lg shadow-primary/20">
          <UserPlus className="mr-2 h-4 w-4" /> 建立新帳號
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-16rem)] rounded-2xl border bg-white shadow-sm">
        <div className="p-4 space-y-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 bg-slate-50 animate-pulse rounded-2xl" />
            ))
          ) : filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <Card key={user.id} className={cn(
                "border-slate-100 hover:border-primary/20 transition-all overflow-hidden",
                user.status === "disabled" && "opacity-60 bg-slate-50/50"
              )}>
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-black/5",
                      ROLES.find(r => r.value === user.role)?.color || "bg-slate-400"
                    )}>
                      {(() => {
                        const Icon = ROLES.find(r => r.value === user.role)?.icon || ShieldAlert;
                        return <Icon className="h-6 w-6" />;
                      })()}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-slate-900">{user.displayName}</h3>
                        <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 border-slate-200">
                          @{user.username}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <span>角色：{ROLES.find(r => r.value === user.role)?.label}</span>
                        <span>最後登入：{user.lastLogin === "Never" ? "尚無紀錄" : new Date(user.lastLogin).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button size="icon" variant="ghost" className="h-9 w-9 text-slate-400 hover:text-primary" onClick={() => {
                      setCurrentUser(user);
                      setIsEditing(true);
                    }}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className={cn(
                      "h-9 w-9 transition-colors",
                      user.status === "active" ? "text-slate-400 hover:text-amber-500" : "text-amber-500 hover:text-emerald-500"
                    )} onClick={() => toggleStatus(user.id)}>
                      {user.status === "active" ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="py-20 text-center space-y-3">
              <Key className="h-10 w-10 text-slate-100 mx-auto" />
              <p className="text-slate-400 font-bold">目前尚無任何使用者帳號</p>
            </div>
          )}
        </div>
      </ScrollArea>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-md rounded-2xl border-none shadow-2xl">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-2xl font-black flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              {currentUser?.id ? "修改帳號權限" : "建立新運營帳號"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">使用者名稱</Label>
                <Input 
                  placeholder="hank_ops" 
                  className="h-11 rounded-xl bg-slate-50 border-none font-bold"
                  value={currentUser?.username || ""}
                  onChange={e => setCurrentUser({...currentUser!, username: e.target.value})}
                  disabled={!!currentUser?.id}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">顯示姓名</Label>
                <Input 
                  placeholder="陳大文" 
                  className="h-11 rounded-xl font-bold"
                  value={currentUser?.displayName || ""}
                  onChange={e => setCurrentUser({...currentUser!, displayName: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">選取角色與權限</Label>
              <div className="grid grid-cols-1 gap-2">
                {ROLES.map(role => (
                  <button
                    key={role.value}
                    onClick={() => setCurrentUser({...currentUser!, role: role.value as any})}
                    className={cn(
                      "p-4 rounded-2xl border-2 transition-all flex items-center gap-4 text-left group",
                      currentUser?.role === role.value 
                        ? "bg-slate-900 border-slate-900 shadow-xl" 
                        : "bg-white border-slate-100 hover:border-primary/30"
                    )}
                  >
                    <div className={cn(
                      "h-10 w-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg",
                      role.color,
                      currentUser?.role === role.value ? "scale-110" : "opacity-80 group-hover:opacity-100"
                    )}>
                      <role.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm font-black mb-0.5",
                        currentUser?.role === role.value ? "text-white" : "text-slate-900"
                      )}>{role.label}</p>
                      <p className={cn(
                        "text-[10px] font-bold",
                        currentUser?.role === role.value ? "text-slate-400" : "text-slate-500"
                      )}>{role.description}</p>
                    </div>
                    {currentUser?.role === role.value && (
                      <div className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center">
                        <ShieldCheck className="h-4 w-4" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {!currentUser?.id && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex gap-3 shadow-sm shadow-amber-100/50">
                <Lock className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest">安全提醒</p>
                  <p className="text-[10px] font-bold text-amber-700/80 leading-relaxed">
                    初始密碼預設為 <span className="text-amber-900 underline decoration-2">Admin123456</span>。
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="p-2 gap-3">
            <Button variant="ghost" onClick={() => setIsEditing(false)} className="rounded-xl font-bold text-slate-400">
              取消
            </Button>
            <Button onClick={handleSave} className="rounded-xl font-bold h-11 px-8 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90">
              儲存帳號設定
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
