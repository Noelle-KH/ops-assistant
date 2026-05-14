import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ShieldCheck, Lock, User, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // If already logged in, redirect away from login page
  useEffect(() => {
    const token = localStorage.getItem("user_token");
    if (token) {
      navigate("/");
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const result = await res.json();

      if (res.ok) {
        localStorage.setItem("user_token", result.token);
        localStorage.setItem("user_name", result.user.displayName || result.user.username);
        localStorage.setItem("user_role", result.user.role);
        localStorage.setItem("last_activity", Date.now().toString());
        
        // Also set admin info if they are admin, to keep compatibility with existing admin pages
        if (result.user.role === "admin") {
          localStorage.setItem("admin_token", result.token);
          localStorage.setItem("admin_user", result.user.displayName || result.user.username);
        }

        toast.success(`登入成功，歡迎 ${result.user.displayName || result.user.username}`);
        
        // Redirect to where they were going, or dashboard
        const from = (location.state as any)?.from?.pathname || "/";
        navigate(from, { replace: true });
      } else {
        toast.error(result.error || "帳號或密碼錯誤");
      }
    } catch (error) {
      console.error("Login failed:", error);
      toast.error("伺服器連線失敗");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      
      <Card className="w-full max-w-md shadow-2xl border-none relative z-10 bg-white/80 backdrop-blur-sm">
        <CardHeader className="space-y-4 text-center pb-2">
          <div className="mx-auto h-16 w-16 rounded-3xl bg-primary flex items-center justify-center shadow-xl shadow-primary/20 rotate-3 hover:rotate-0 transition-transform duration-300">
            <Terminal className="h-8 w-8 text-white" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-black tracking-tight text-slate-900">領航站系統</CardTitle>
            <CardDescription className="font-bold text-slate-500">企業運營知識管理與工具平台</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6 pt-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">員工帳號</label>
              <div className="relative group">
                <User className="absolute left-3 top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                <Input 
                  placeholder="Username" 
                  className="pl-10 h-12 bg-white/50 border-slate-200 focus:border-primary focus:ring-primary/20 transition-all rounded-xl"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">存取密碼</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  className="pl-10 h-12 bg-white/50 border-slate-200 focus:border-primary focus:ring-primary/20 transition-all rounded-xl"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-12 font-black text-lg shadow-xl shadow-primary/20 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              {loading ? "登入中..." : "即刻啟航"}
            </Button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <ShieldCheck className="h-3 w-3" />
              Secure Enterprise Access
            </div>
            <p className="text-[10px] text-slate-400 font-medium text-center leading-relaxed">
              本系統僅供內部運營人員使用<br />
              未經授權禁止存取
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
