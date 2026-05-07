# Technical Decisions: Operations Navigator (運營領航站)

## 1. 核心框架：React 19 + Vite
- **決策**：選用最新穩定版的 React 19 與 Vite 作為開發工具。
- **理由**：
  - **性能**：Vite 提供極速的 HMR (Hot Module Replacement)，大幅提升開發體驗。
  - **現代性**：React 19 引入了更簡潔的 Actions 與更好的伺服器組件支持（雖然目前主要使用 SPA 模式）。
  - **生態系**：與 Shadcn UI 和 Tailwind 4 有最佳的相容性。

## 2. 狀態管理：不使用 Redux
- **決策**：優先使用 React 原生 `useState`、`useContext` 與 URL State，拒絕導入 Redux 或 MobX。
- **理由**：
  - **簡潔性**：本專案以「內容展示」為主，跨組件的複雜狀態變更較少。
  - **URL 驅動**：知識庫的狀態（如當前選中的 FAQ ID 或 Tab）應由 URL 決定，以便使用者直接分享連結或使用瀏覽器後退功能。
  - **低開銷**：避免 Redux 的 Boilerplate 代碼，保持代碼庫輕量。

## 3. UI 元件架構：Shadcn UI (Radix UI)
- **決策**：基於 Radix UI 的 Shadcn UI 作為組件庫。
- **理由**：
  - **無障礙性 (A11y)**：Radix 處理了複雜的鍵盤導航與螢幕閱讀器支持。
  - **高度可定制**：Shadcn 直接將代碼下載至專案中，允許開發者直接修改原始碼以符合特定設計需求。
  - **一致性**：確保全系統的輸入框、彈窗、側欄風格高度統一。

## 4. 樣式方案：Tailwind CSS 4
- **決策**：使用最新的 Tailwind CSS 4。
- **理由**：
  - **開發速度**：Utility-first 模式讓 UI 調整不需離開 HTML/JSX。
  - **零運行負擔**：編譯時生成 CSS，不增加瀏覽器端計算壓力。
  - **主題支持**：與 `next-themes` 整合，輕鬆實現深色模式切換。

## 5. API 與資料持久化：從 JSON 轉向 SQLite
- **決策**：初期使用靜態 JSON，後續改用 Drizzle ORM + SQLite。
- **理由**：
  - **迭代速度**：初期使用 JSON 可快速完成 UI 原型，無需處理資料庫遷移。
  - **關聯性需求**：FAQ、SOP 與 模板之間存在複雜的「多對多」或「一對多」關係，傳統 RDBMS (SQLite) 在查詢效率與結構完整性上優於大型 JSON 嵌套。
  - **輕量化**：SQLite 無需獨立 Server 運行，適合內部中小型工具。

## 6. 組件設計規則 (Component Design Rules)
- **Surgical Updates**：修改組件時應保持邏輯與樣式的分離，儘量提取通用邏輯至 Hooks。
- **Prop Typing**：所有組件必須定義嚴謹的 TypeScript Interface。
- **Composition over Inheritance**：優先使用 `children` 與高階組件進行組合，而非繼承。

## 7. Style Guide (代碼風格指南)
- **命名規範**：
  - 檔案：kebab-case (例如 `app-sidebar.tsx`)。
  - 組件名：PascalCase (例如 `DashboardPage`)。
  - 變數與函式：camelCase。
- **排版**：嚴格執行 Prettier 與 ESLint 規範（由專案根目錄配置驅動）。
- **註釋**：複雜的業務邏輯（如 `parser.ts` 中的正則解析）必須附帶中文註釋說明。
