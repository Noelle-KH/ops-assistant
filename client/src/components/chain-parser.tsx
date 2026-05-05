import { useState } from "react"
import { Copy, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react"
import { parseAttributionChain, type ParseResult } from "@/lib/parser"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"

export function ChainParser() {
  const [input, setInput] = useState("")
  const [result, setResult] = useState<ParseResult | null>(null)

  const handleParse = () => {
    const res = parseAttributionChain(input)
    setResult(res)
    if (!res.success) {
      console.error("Parse failed:", res.debugInfo)
      // We'll use a standard alert if sonner isn't ready, but I'll try to re-enable sonner in App.tsx
    }
  }

  const handleCopy = () => {
    if (result?.success && result.data) {
      navigator.clipboard.writeText(result.data)
      toast.success("解析結果已複製到剪貼簿")
    }
  }

  const handleClear = () => {
    setInput("")
    setResult(null)
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>歸屬鏈解析器</CardTitle>
          <CardDescription>
            貼入原始資料格式：ID,角色,姓名... 並轉換為人類可讀格式。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Textarea
              placeholder="例如：49878,sales,DT,22375,sales,Richar DT..."
              className="min-h-[150px] font-mono"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            {result && !result.success && (
              <div className="flex items-center gap-2 text-sm text-destructive mt-2">
                <AlertCircle className="h-4 w-4" />
                <span>{result.error}</span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={handleParse} className="flex-1">
              <RefreshCw className="mr-2 h-4 w-4" />
              解析
            </Button>
            <Button variant="outline" onClick={handleClear}>
              清空
            </Button>
          </div>
        </CardContent>
      </Card>

      {result?.success && (
        <Card className="border-primary/20 bg-primary/5 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary">
                <CheckCircle2 className="h-5 w-5" />
                <CardTitle className="text-lg">解析結果</CardTitle>
              </div>
              <Button size="sm" variant="ghost" onClick={handleCopy}>
                <Copy className="mr-2 h-4 w-4" />
                複製
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-md bg-background border font-medium text-sm leading-relaxed">
              {result.data}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
