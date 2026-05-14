# 運營領航站 (Operations Navigator) 🚀

「運營領航站」是一款專為企業內部運營團隊設計的一站式知識管理與工具平台。旨在解決資訊分散、查找效率低、SOP 不標準等問題，提升團隊協作效率與專業度。

## 🌟 核心功能

- **知識庫 (Knowledge Base)**: 統一存放 FAQ 與 SOP，支援分類篩選與快速查找。
- **全域搜尋 (Global Search)**: 支援跨模組（FAQ、SOP、郵件模板）的全文索引，定位精確。
- **郵件模板庫 (Email Templates)**: 預設常用郵件格式，支援動態變數填寫與一鍵複製。
- **鏈結解析工具 (Chain Parser)**: 將複雜系統字串轉換為人類可讀的階層架構。
- **管理後台 (Admin Panel)**: 視覺化維護系統內容，包含帳號權限管理與操作稽核日誌。
- **稽核系統 (Audit System)**: 精確記錄管理員的所有變更紀錄，確保資料安全性。

## 🛠 技術棧

### 前端 (Frontend)
- **Framework**: React 19 (TypeScript)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 4
- **UI Components**: Shadcn UI + Radix UI
- **Icons**: Lucide React
- **Notifications**: Sonner

### 後端 (Backend)
- **Runtime**: Node.js (Express)
- **ORM**: Drizzle ORM
- **Database**: SQLite (開發) / Turso (生產)
- **Auth**: JWT (JSON Web Token)

## 📁 目錄結構

```text
ops_assistant/
├── client/                 # 前端 React 專案
│   ├── src/components/     # UI 組件與 Shadcn
│   ├── src/pages/          # 各功能頁面
│   └── src/lib/            # 工具函式與邏輯處理
├── server/                 # 後端 Express 專案
│   ├── src/db/             # Drizzle Schema 與資料庫配置
│   ├── src/routes/         # API 路由
│   └── src/scripts/        # 資料初始化與維護腳本
├── ai/                     # 技術架構與開發決策文件
└── vercel.json             # 生產環境部署配置文件
```

## 🚀 快速啟動

### 環境需求
- Node.js 18+
- npm / pnpm

### 本地開發步驟

1. **複製專案**
   ```bash
   git clone <your-repo-url>
   cd ops_assistant
   ```

2. **啟動後端**
   ```bash
   cd server
   npm install
   # 複製並設定環境變數
   cp .env.example .env 
   # 同步資料庫結構
   npm run db:push
   # 啟動開發伺服器
   npm run dev
   ```

3. **啟動前端**
   ```bash
   cd ../client
   npm install
   # 啟動開發伺服器
   npm run dev
   ```

## 🔐 權限說明

系統採用三層權限設計：
- **Admin**: 可進入管理後台維護資料與管理帳號。
- **High Level**: 可存取包含「敏感資訊」的進階工具。
- **Operator**: 一般權限，可查詢知識庫與使用基礎工具。

## 📦 部署 (Deployment)

本專案支援 **Vercel + Turso** 的自動化部署方案：
1. 使用 `drizzle-kit push` 將結構同步至雲端資料庫。
2. 將專案推送到 GitHub 並串接 Vercel。
3. 在部署平台設定 `DB_URL`、`DB_AUTH_TOKEN`、`JWT_SECRET` 與 `VITE_API_URL`。

## 📄 授權

僅供內部授權人員使用。
