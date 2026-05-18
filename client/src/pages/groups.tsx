import React, { useState, useEffect } from "react";
import { Search, Users, MessageSquare, ShieldCheck, Cpu, Landmark } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { API_BASE_URL } from "@/lib/utils";

interface GroupItem {
  id: string;
  division: string;
  name: string;
  purpose: string;
  use_cases: string[];
  contacts: string[];
  notes: string;
}

const DIVISION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "運營": ShieldCheck,
  "金流": Landmark,
  "產品": Cpu,
  "機器人": MessageSquare,
};

export default function GroupsPage() {
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/groups`)
      .then(res => res.json())
      .then(data => {
        setGroups(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch groups:", err);
        setLoading(false);
      });
  }, []);

  const filteredGroups = groups.filter(grp => 
    grp.name.toLowerCase().includes(search.toLowerCase()) ||
    grp.purpose.toLowerCase().includes(search.toLowerCase()) ||
    grp.division.toLowerCase().includes(search.toLowerCase()) ||
    grp.contacts.some(c => c.toLowerCase().includes(search.toLowerCase()))
  );

  // Group by division
  const groupedGroups = filteredGroups.reduce((acc, grp) => {
    if (!acc[grp.division]) acc[grp.division] = [];
    acc[grp.division].push(grp);
    return acc;
  }, {} as Record<string, GroupItem[]>);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <section>
        <h2 className="text-3xl font-black tracking-tight text-slate-900 mb-2 text-center md:text-left">群組與聯絡人目錄</h2>
        <p className="text-muted-foreground text-center md:text-left">整合各部門主要溝通群組與負責人，協助新進成員快速對接。</p>
      </section>

      <div className="relative max-w-2xl mx-auto md:mx-0">
        <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="搜尋群組名稱、負責人或部門..."
          className="pl-11 h-12 bg-white shadow-sm border-slate-200 focus:ring-primary"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <ScrollArea className="h-[calc(100vh-18rem)] -mx-4 px-4 md:-mx-8 md:px-8">
        <div className="space-y-12 pb-12 pt-4 px-2">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-48 rounded-2xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : Object.keys(groupedGroups).length > 0 ? (
            Object.entries(groupedGroups).map(([division, items]) => {
              const Icon = DIVISION_ICONS[division] || Users;
              return (
                <div key={division} className="space-y-6">
                  <div className="flex items-center gap-3 border-b pb-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-xl font-black text-slate-800">{division}部門</h3>
                    <Badge variant="outline" className="ml-auto font-mono text-[10px] text-slate-400">
                      {items.length} 個群組
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map(grp => (
                      <Card key={grp.id} className="border-slate-200 hover:shadow-md transition-all duration-300 group">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors">
                            {grp.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-sm text-slate-600 leading-relaxed min-h-[40px]">
                            {grp.purpose}
                          </p>
                          
                          <div className="space-y-3 pt-2 border-t border-slate-50">
                            <div className="space-y-1.5">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">負責人 / 聯絡點</p>
                              <div className="flex flex-wrap gap-2">
                                {grp.contacts.map(contact => (
                                  <Badge key={contact} variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-none font-bold text-[10px]">
                                    {contact}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            
                            <div className="space-y-1.5">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">常見使用情境</p>
                              <div className="flex flex-wrap gap-1.5">
                                {grp.use_cases.map(useCase => (
                                  <span key={useCase} className="text-[11px] text-slate-500 font-medium">
                                    • {useCase}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {grp.notes && (
                              <div className="p-3 rounded-lg bg-orange-50/50 border border-orange-100 mt-2">
                                <p className="text-[10px] text-orange-700 leading-relaxed italic">
                                  <span className="font-bold mr-1">Note:</span> {grp.notes}
                                </p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-32 text-center space-y-4">
              <Users className="h-12 w-12 text-slate-100 mx-auto" />
              <p className="text-slate-500 font-bold">查無符合結果</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
