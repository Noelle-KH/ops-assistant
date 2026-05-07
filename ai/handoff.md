# Project Handoff: Operations Navigator (運營領航站)

## 1. 今日完成事項 (Completed Today)
- **建立 AI 知識庫 (AI Documentation Hub)**:
  - 建立 `ai/` 目錄並生成 `context.md`, `architecture.md`, `decisions.md` 與 `handoff.md`。
- **FAQ/SOP 模組重構與整合**:
  - 完成 `KnowledgeBase` 頁面重構，以 **FAQ 列表 (Accordion)** 為主視圖，提供最清爽的掃視體驗。
  - 實作 **大尺寸中央彈窗 (Dialog)** 展示 SOP 詳情，解決了側邊面板（Sheet）與雙欄佈局在不同設備上的壅擠與擠壓問題。
  - 優化 SOP 內部的時間軸 (Timeline) 與規則佈局，強化視覺對齊與空間呼吸感。
  - 補齊並建立 `client/src/components/ui/dialog.tsx` 基礎組件。
- **專案結構分析**: 確認了目前正處於從靜態 JSON 向 SQLite 遷移的過渡期。

## 2. 修改過的檔案 (Files Modified)
- `ai/context.md`, `ai/architecture.md`, `ai/decisions.md`, `ai/handoff.md`
- `client/src/pages/knowledge-base.tsx`
- `client/src/components/ui/dialog.tsx` (新建立)

## 3. 尚未完成事項 (Pending Items)
- **後端資料庫遷移**: 完成 Drizzle ORM 與 SQLite 的完整整合，取代現有的 `server/src/data/*.json`。
- **管理者後台 (Admin Panel)**: 實作視覺化編輯介面，讓運營人員能新增/編輯 FAQ 與 SOP。
- **權限控制 (RBAC)**: 實作登入功能與存取層級控管。
- **郵件模板功能**: 實作帶有 `{{變數}}` 的模板填寫與複製功能。

## 4. 已知問題 (Known Issues)
- **資料同步**: 目前前端透過 API 讀取 JSON，若手動修改 JSON 檔案後，後端需重啟。
- **解析器邊際情況**: `parser.ts` 對於極端異常的歸屬鏈格式仍有解析失敗的風險。

## 5. 明日建議下一步 (Suggested Next Steps)
1. **實作 Drizzle Schema**: 定義 FAQ 與 SOP 的資料表關聯，將靜態 JSON 轉入 SQLite。
2. **開發 Admin FAQ 編輯頁**: 實作基礎的 CRUD 功能。
3. **完善郵件模板功能**: 實作變數填寫 UI。

## 6. 重要技術變更 (Important Tech Changes)
- **UI 交互規範**: 最終確認使用 **`Dialog` (中央大彈窗)** 作為 SOP 詳細資訊的呈現方式，以確保在各設備上擁有最大閱讀空間與視覺通透感。
- **Tailwind CSS 4**: 專案全面採用 Tailwind 4 類名規範。

