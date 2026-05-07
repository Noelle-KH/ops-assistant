# Project Handoff: Operations Navigator (運營領航站)

## 1. 今日完成事項 (Completed Today)
- **建立 AI 知識庫 (AI Documentation Hub)**:
  - 建立 `ai/` 目錄，用於存放專案上下文、架構設計與技術決策文檔。
  - 生成 `ai/context.md`: 提供專案用途、技術棧、啟動方式與核心模組的快速概覽。
  - 生成 `ai/architecture.md`: 繪製系統流程、API 數據流以及前後端依賴關係。
  - 生成 `ai/decisions.md`: 記錄技術選型決策（如選用 React 19, Tailwind 4, 以及不使用 Redux 的理由）。
- **專案結構分析**: 深入研究 PRD 與現有代碼結構，確認了目前正處於從靜態 JSON 向 SQLite 遷移的過渡期。

## 2. 修改過的檔案 (Files Modified)
- `ai/context.md` (新建立)
- `ai/architecture.md` (新建立)
- `ai/decisions.md` (新建立)

## 3. 尚未完成事項 (Pending Items)
- **FAQ/SOP 模組整合**:
  - 重構 `KnowledgeBase` 頁面，改以 FAQ 為主軸，移除 SOP 獨立標籤頁。
  - 實作「FAQ 關聯 SOP」的顯示邏輯。
  - 實作 `Sheet` (側邊抽屜) 組件用於展示 SOP 詳細步驟與規則。
- **後端資料庫遷移**: 完成 Drizzle ORM 與 SQLite 的完整整合，取代現有的 `server/src/data/*.json`。
- **管理者後台 (Admin Panel)**: 實作視覺化編輯介面，讓運營人員能新增/編輯 FAQ 與 SOP。
- **權限控制 (RBAC)**: 實作登入功能與存取層級控管（一般運營 / 高級運營 / 管理者）。
- **郵件模板功能**: 實作帶有 `{{變數}}` 的模板填寫與複製功能。

## 4. 已知問題 (Known Issues)
- **UI 冗餘**: 目前 KnowledgeBase 頁面同時顯示 FAQ 與 SOP，資訊重複度高（預計在下一階段重構解決）。
- **資料同步**: 目前前端透過 API 讀取 JSON，若手動修改 JSON 檔案後，後端需重啟。

## 5. 明日建議下一步 (Suggested Next Steps)
1. **重構 KnowledgeBase 頁面**: 
   - 移除頂部 Tabs，改為純 FAQ 列表。
   - 整合 `Sheet` 組件到 FAQ 卡片中。
2. **實作 Drizzle Schema**: 定義 FAQ 與 SOP 的關聯模型 (One-to-One 或 One-to-Many)。
3. **完善歸屬鏈解析器 UI**: 增加歷史紀錄或更友好的錯誤提示 UI。

## 6. 重要技術變更 (Important Tech Changes)
- **UI 交互規範**: 確認使用 **`Sheet` (側邊抽屜)** 作為 SOP 詳細資訊的呈現方式，而非 Dialog 或獨立頁面，以保持導航上下文。
- **Tailwind CSS 4**: 專案已採用最新的 Tailwind 4。
- **React 19**: 使用了 React 19 的新特性。

