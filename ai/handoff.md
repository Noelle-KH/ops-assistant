# Project Handoff: Operations Navigator (運營領航站)

## 1. 今日完成事項 (Completed Today)
- **資料庫實體遷移 (重要進度)**:
  - 成功從靜態 JSON 檔案轉向 **SQLite + Drizzle ORM** 架構。
  - 實作資料庫 Schema 定義，包含 FAQ、SOP、公告、模板、使用者、稽核日誌等 8 張表。
  - 編寫並執行 `migrate_json_to_db.ts` 腳本，完整遷移所有現有資料。
  - 重構後端 `api.ts` 與 `admin.ts` 路由，全面改用 SQL 查詢取代檔案讀寫，支援事務 (Transaction) 級別的批量更新。
- **公告管理功能 (前端) 完整實作**:
  - 實作公告列表、CRUD 編輯彈窗、狀態切換與搜尋過濾功能。
  - 同步更新管理者儀表板與前台展示邏輯。
- **郵件模板功能 (前端) 深度優化**:
  - 實作變數即時高亮顯示、一鍵清空與個別欄位清除功能。

## 2. 修改過的檔案 (Files Modified)
- `ai/architecture.md`, `ai/context.md`, `ai/handoff.md`
- `server/src/db/schema.ts`, `server/src/db/index.ts` (新建立)
- `server/drizzle.config.ts`, `server/src/scripts/migrate_json_to_db.ts` (新建立)
- `server/src/routes/api.ts`, `server/src/routes/admin.ts` (重構)
- `client/src/pages/admin/announcements.tsx`, `client/src/pages/admin/dashboard.tsx`
- `client/src/components/ui/select.tsx` (新建立)

## 3. 尚未完成事項 (Pending Items)
- **資料整理與內容填入**: 將運營端現有的真實 FAQ 與 SOP 資料透過後台錄入系統。
- **登入安全性強化**: 實作正式的密碼雜湊加密與 Session/JWT 驗證。
- **敏感資料遮罩**: 在前台「系統工具」模組中實作基於角色等級的敏感帳密遮罩功能。

## 4. 已知問題 (Known Issues)
- **JSON 同步**: 目前 JSON 檔案僅作為備份存放在 `server/src/data/`，系統已完全依賴 `sqlite.db`。

## 5. 今日建議下一步 (Suggested Next Steps)
1. **敏感資料遮罩**: 實作 `tools` 模組中的 `is_sensitive` 邏輯，根據使用者等級決定密碼顯示狀態。
2. **真實資料錄入**: 依照提取的模板，開始大批量導入真實運營數據。
3. **密碼安全性**: 將現有的明文密碼透過 `bcrypt` 進行雜湊處理。

## 6. 重要技術變更 (Important Tech Changes)
- **UI 交互規範**: 最終確認使用 **`Dialog` (中央大彈窗)** 作為 SOP 詳細資訊的呈現方式，以確保在各設備上擁有最大閱讀空間與視覺通透感。
- **Tailwind CSS 4**: 專案全面採用 Tailwind 4 類名規範。

