# Project Context: Operations Navigator (運營領航站)

## 1. 專案用途
「運營領航站」是為 IEXS 運營部門開發的內部知識管理與工具平台。旨在解決資訊分散、查找效率低、SOP 不標準等問題。提供 FAQ 查詢、SOP 指引、郵件模板、群組目錄及歸屬鏈解析工具。

## 2. 技術棧
- **Frontend**: 
  - Framework: React 19 (TypeScript)
  - Build Tool: Vite
  - Styling: Tailwind CSS 4, Lucide React (Icons)
  - UI Components: Shadcn UI, Radix UI
  - Routing: React Router 7 (BrowserRouter)
  - Notifications: Sonner
- **Backend**:
  - Runtime: Node.js (Express)
  - Language: TypeScript
  - ORM: Drizzle ORM (預留/開發中)
  - Database: SQLite / Static JSON Files
- **Other**:
  - Theme: next-themes (支援 Dark/Light mode)

## 3. 目錄結構
```text
ops_assistant/
├── client/                 # 前端 React 專案
│   ├── src/
│   │   ├── components/     # UI 元件 (含 Shadcn)
│   │   ├── hooks/          # 自定義 Hooks
│   │   ├── lib/            # 工具函式 (如 parser.ts)
│   │   ├── pages/          # 頁面元件 (Dashboard, KnowledgeBase, Parser)
│   │   └── App.tsx         # 路由配置與進入點
│   └── package.json
├── server/                 # 後端 Express 專案
│   ├── src/
│   │   ├── data/           # 靜態 JSON 數據庫
│   │   ├── routes/         # API 路由
│   │   ├── controllers/    # 業務邏輯 (待擴展)
│   │   └── index.ts        # 伺服器進入點
│   └── package.json
└── ai/
    └── context.md          # 本文件 (AI 上下文)
```

## 4. 啟動方式
- **Frontend**: `cd client && npm install && npm run dev` (預設 port: 5173)
- **Backend**: `cd server && npm install && npm run dev` (預設 port: 3001)

## 5. 環境需求
- Node.js 18+
- npm / pnpm

## 6. 核心模組
- **Dashboard**: 系統入口與快捷功能。
- **Knowledge Base (FAQ/SOP)**: 統一的知識庫頁面，支援分類篩選與標籤切換。
- **Email Templates**: 郵件模板庫，支援變數填寫與一鍵複製。
- **Chain Parser (歸屬鏈解析器)**: 將 OA 系統的原始歸屬鏈字串轉換為人類可讀格式。
- **Groups & Contacts**: 部門群組與負責人清單。

## 7. API 架構
- **RESTful API**: 使用 Express 構建。
- **Data Source**: 目前主要從 `server/src/data/*.json` 讀取靜態資料。
- **Endpoints**:
  - `GET /api/faq`: 獲取 FAQ 清單。
  - `GET /api/sop`: 獲取 SOP 清單。
  - `GET /api/templates`: 獲取郵件模板。
  - `GET /api/groups`: 獲取群組目錄。
  - `GET /api/tools`: 獲取系統連結。

## 8. 狀態管理方式
- **Local State**: 使用 React `useState` 與 `useReducer` 管理組件內狀態。
- **URL State**: 使用 `react-router-dom` 的 Params 與 Search Params (如 `/knowledge-base/faq/:id`)。
- **Theme State**: 使用 `next-themes` 處理深色模式。

## 9. Coding Conventions
- **TypeScript**: 強制使用類型定義，避免 `any`。
- **Components**: 採用 Functional Components 與 Hooks。
- **UI**: 優先使用 `client/src/components/ui` 下的 Shadcn 元件。
- **Styling**: 嚴格遵守 Tailwind CSS 4 類名規範。
- **File Naming**: 組件與頁面使用 kebab-case 或 PascalCase (依現有風格)。

## 10. 注意事項
- **RWD**: 必須支持桌機、平板與手機端。
- **Performance**: 確保搜尋與解析操作的流暢度。
- **Data Integrity**: 修改 JSON 數據時需確保格式符合 PRD 定義。
- **Transition**: 系統正從純 JSON 讀取轉向 Drizzle ORM + SQLite，開發新功能時應考慮擴展性。
