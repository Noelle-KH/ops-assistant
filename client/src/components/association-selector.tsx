import { useState, useEffect } from "react";
import { Search, Plus, X, Check, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Item {
  id: string;
  title?: string;
  question?: string;
  category: string;
}

interface AssociationSelectorProps {
  type: "faq" | "sop" | "template";
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  label: string;
  maxSelections?: number;
}

const API_BASE_URL = "http://localhost:3001";

export function AssociationSelector({ type, selectedIds, onChange, label, maxSelections }: AssociationSelectorProps) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (open) {
      fetchItems();
    }
  }, [open]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const endpoint = type === "template" ? "templates" : type;
      const res = await fetch(`${API_BASE_URL}/api/${endpoint}`);
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error(`Failed to fetch ${type}:`, err);
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(i => i !== id));
    } else {
      if (maxSelections === 1) {
        onChange([id]);
      } else {
        onChange([...selectedIds, id]);
      }
    }
  };

  const filteredItems = items.filter(item => {
    const title = item.title || item.question || "";
    return (
      title.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase()) ||
      item.id.toLowerCase().includes(search.toLowerCase())
    );
  });

  const getDisplayTitle = (item: Item) => item.title || item.question || "無標題";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{label}</label>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="h-6 px-2 text-[10px] font-bold border-dashed">
              <Plus className="mr-1 h-3 w-3" /> 選擇{label.replace("關聯 ", "")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
            <DialogHeader className="p-4 border-b bg-slate-50/50">
              <DialogTitle className="text-sm font-black">選擇關聯項目 ({label})</DialogTitle>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="搜尋標題、分類或 ID..."
                  className="pl-9 h-9 bg-white border-slate-200 text-xs"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </DialogHeader>

            <ScrollArea className="h-80">
              <div className="p-2 space-y-1">
                {loading ? (
                  <div className="flex items-center justify-center py-20 text-slate-400">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    <span className="text-xs font-bold">載入中...</span>
                  </div>
                ) : filteredItems.length > 0 ? (
                  filteredItems.map((item) => {
                    const isSelected = selectedIds.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        onClick={() => toggleItem(item.id)}
                        className={cn(
                          "w-full text-left p-3 rounded-xl transition-all flex items-center justify-between group",
                          isSelected ? "bg-primary/5 border border-primary/20" : "hover:bg-slate-50 border border-transparent"
                        )}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <Badge variant="outline" className="text-[8px] font-black uppercase px-1 h-3.5 border-slate-200 text-slate-400">
                              {item.category}
                            </Badge>
                            <code className="text-[8px] font-mono text-slate-300">#{item.id}</code>
                          </div>
                          <p className={cn(
                            "text-xs font-bold truncate",
                            isSelected ? "text-primary" : "text-slate-700"
                          )}>{getDisplayTitle(item)}</p>
                        </div>
                        {isSelected ? (
                          <div className="h-5 w-5 rounded-full bg-primary text-white flex items-center justify-center shadow-sm">
                            <Check className="h-3 w-3" />
                          </div>
                        ) : (
                          <Plus className="h-4 w-4 text-slate-200 group-hover:text-slate-400" />
                        )}
                      </button>
                    );
                  })
                ) : (
                  <div className="py-20 text-center text-slate-400 text-xs font-medium">
                    查無符合項目
                  </div>
                )}
              </div>
            </ScrollArea>
            <div className="p-3 border-t bg-slate-50/50 flex justify-end">
              <Button size="sm" className="h-8 font-bold rounded-lg px-6" onClick={() => setOpen(false)}>
                完成
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap gap-2 min-h-[40px] p-3 rounded-xl bg-slate-50 border border-slate-100">
        {selectedIds.length > 0 ? (
          selectedIds.map(id => (
            <Badge key={id} variant="secondary" className="pl-2 pr-1 h-6 gap-1 bg-white border-slate-200 text-slate-600 font-bold text-[10px]">
              {id}
              <button 
                onClick={() => onChange(selectedIds.filter(i => i !== id))}
                className="hover:text-red-500 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))
        ) : (
          <p className="text-[10px] text-slate-400 italic font-medium">尚未選擇任何關聯</p>
        )}
      </div>
    </div>
  );
}
