import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login for now
    if (username === "admin" && password === "admin123") {
      localStorage.setItem("admin_token", "fake_token");
      localStorage.setItem("admin_user", username);
      toast.success("登入成功，歡迎進入管理者後台");
      navigate("/admin/dashboard");
    } else {
      toast.error("帳號或密碼錯誤");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-2xl border-none">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-black tracking-tight">管理員登入</CardTitle>
            <CardDescription>運營領航站內容維護系統</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">帳號</label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Admin Username" 
                  className="pl-10 h-11 bg-slate-50/50 border-slate-200"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">密碼</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  className="pl-10 h-11 bg-slate-50/50 border-slate-200"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full h-11 font-bold text-base mt-2 shadow-lg shadow-primary/20">
              確認進入
            </Button>
          </form>
          <p className="text-center text-[10px] text-slate-400 mt-6 font-medium">
            請使用公司核發之管理員權限帳號進行存取
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
