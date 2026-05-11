# Project Architecture: Operations Navigator (運營領航站)

## 1. 系統架構圖 (System Architecture)
本專案採用典型的 **Client-Server (C/S)** 架構，前後端分離，透過 RESTful API 進行通訊。

```text
[ Browser / Client ] <--- HTTP/JSON ---> [ Node.js Server ] <--- Drizzle ORM ---> [ SQLite Database ]
       |                                        |                                     |
       |-- React 19                             |-- Express.js                        |-- sqlite.db
       |-- Tailwind 4                           |-- TypeScript                        |-- schema.ts
       |-- Lucide Icons                         |-- Drizzle ORM                       |-- Migration Script
```

## 2. API Flow
資料存取流程如下：
1. **Request**: 前端 React 組件透過 `fetch` 發送 HTTP 請求（例如：`GET /api/faq`）。
2. **Routing**: 後端 Express 伺服器接收請求並導向至 `server/src/routes/api.ts`。
3. **Logic**: 路由處理器透過 Drizzle ORM 從 `sqlite.db` 執行 SQL 查詢。
4. **Response**: 伺服器將資料封裝為 JSON 格式並回傳給前端。
5. **Render**: 前端接收資料後更新 React State，觸發 UI 重新渲染。

## 3. Auth Flow (認證流程)
*目前為初步開發階段，尚未實作完整的 JWT 或 Session 驗證。*
- **規劃方向**：
  - 一般人員：僅可存取公開 FAQ/SOP。
  - 高級人員：可存取敏感帳號資訊。
  - 管理者：可存取後台管理介面（Admin Dashboard）。
- **實作預期**：將在 `server/src/middleware` 實作權限驗證攔截器。

## 4. DB Flow (資料庫流程)
- **現狀**：已完成從 JSON 轉向 SQLite 的遷移，使用 `drizzle-orm` 管理資料操作。
- **管理流程**：
  1. 定義 Drizzle Schema (`server/src/db/schema.ts`)。
  2. 使用 `drizzle-kit push` 同步至 SQLite 資料庫。
  3. API 路由透過 `db` Client 執行類型安全的 SQL 查詢。

## 5. Frontend/Backend 關係
- **通訊協議**：HTTP/HTTPS。
- **資料格式**：JSON。
- **端點範例**：
  - `http://localhost:3001/api/faq`
  - `http://localhost:3001/api/sop`
  - `http://localhost:3001/api/announcements`
- **依賴性**：前端強依賴後端提供的 JSON 結構來驅動動態 UI，後端確保資料結構與 Schema 一致。

## 6. Websocket/Event Flow
- **現狀**：無即時通訊需求，未導入 Websocket。
- **未來可能**：若增加「多人協作編輯」或「系統即時公告」功能，將考慮使用 Socket.io。

## 7. Service Dependency (服務依賴)
- **核心服務**：
  - **Vite Dev Server** (Port 5173): 提供前端開發環境。
  - **Express API Server** (Port 3001): 提供後端業務邏輯與資料存取。
- **外部資源**：
  - 無外部第三方 API 依賴（目前均為本地處理）。
- **關鍵程式庫**：
  - `shadcn/ui`: UI 元件基礎。
  - `react-router-dom`: 前端導航與路由管理。
  - `lucide-react`: 全域圖標系統。
