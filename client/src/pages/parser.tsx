import { ChainParser } from "@/components/chain-parser"

export default function ParserPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">歸屬鏈解析器</h2>
        <p className="text-muted-foreground">
          將 OA 系統的原始資料快速轉換為標準通知格式。
        </p>
      </div>
      <div className="max-w-4xl">
        <ChainParser />
      </div>
    </div>
  )
}
