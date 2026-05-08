# Project Handoff: Operations Navigator (運營領航站)

## 1. 今日完成事項 (Completed Today)
- **建立 AI 知識庫 (AI Documentation Hub)**:
  - 建立 `ai/` 目錄並生成 `context.md`, `architecture.md`, `decisions.md` 與 `handoff.md`。
- **郵件模板功能 (前端) 深度優化**:
  - 實作變數即時高亮顯示（琥珀色閃爍 vs 品牌色高亮）。
  - 新增「清空全部變數」與個別欄位清除按鈕。
  - 優化 RWD 佈局與 Tailwind 4 視覺樣式。
- **資料規範化與整理**:
  - 將 `knowledge-base.json` 拆分為獨立的 `faq.json` 與 `sop.json`。
  - 更新後端 API 以對應新的資料格式，刪除冗餘舊檔。
  - 完成管理者後台 (Admin Panel) 需求分析並整合至 `context.md`。

## 2. 修改過的檔案 (Files Modified)
- `ai/context.md`, `ai/handoff.md`
- `client/src/pages/templates.tsx`
- `server/src/routes/api.ts`
- `server/src/data/faq.json`, `server/src/data/sop.json` (新增)

## 3. 尚未完成事項 (Pending Items)
- **管理者後台 (Admin Panel)**: 實作視覺化編輯介面，包含互動式多步驟表單。
- **後端資料寫入與稽核**: 實作 JSON 寫入 API 與變更日誌記錄。
- **權限控制 (RBAC)**: 實作登入功能與存取層級控管。

## 4. 已知問題 (Known Issues)
- **資料同步**: 目前前端透過 API 讀取 JSON，修改 JSON 後後端需重新讀取檔案（已確定採每次請求重讀策略）。
- **解析器邊際情況**: `parser.ts` 對於極端異常的歸屬鏈格式仍有解析失敗的風險。

## 5. 今日建議下一步 (Suggested Next Steps)
1. **後端管理路由與寫入功能 (Step 1)**: 建立 `server/src/routes/admin.ts`，實作安全的 JSON 寫入與稽核日誌機制。
2. **Admin 登入頁與框架佈局 (Step 2)**: 實作管理員專屬的 `AdminLayout` 與登入驗證門檻。
3. **FAQ 管理介面實作 (Step 3)**: 完成基礎的內容 CRUD 操作。
4. **互動式 SOP 編輯器 (Step 4)**: 實作分步驟動態表單與即時預覽功能。

## 6. 重要技術變更 (Important Tech Changes)
- **UI 交互規範**: 最終確認使用 **`Dialog` (中央大彈窗)** 作為 SOP 詳細資訊的呈現方式，以確保在各設備上擁有最大閱讀空間與視覺通透感。
- **Tailwind CSS 4**: 專案全面採用 Tailwind 4 類名規範。

