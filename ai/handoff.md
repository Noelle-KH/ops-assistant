# Project Handoff: Operations Navigator (運營領航站)

## 1. 今日完成事項 (Completed Today)
- **安全與認證體系實作 (核心進度)**:
  - **密碼安全性**: 引入 `bcrypt` 對密碼進行雜湊處理。編寫並執行了全量密碼加密腳本，將資料庫現有帳號同步為安全格式。
  - **統一登入機制**: 實作前台登入頁面與後端 `/api/auth/login` 驗證路由，取代先前的 Mock 認證。
  - **路由權限保護**: 實作 `AuthGuard` 元件，區分一般運營與管理員權限，確保敏感路徑受到保護。
  - **身分狀態管理**: 側邊欄現在會動態展示登入者的姓名與職等，並提供完整的登出功能（清除 Token 與 Session）。
- **敏感資料處理與遮罩**:
  - **後端自動遮罩**: 在 `/api/tools` 路由中實作角色判斷邏輯，非高級權限者獲取的敏感密碼將自動轉換為掩碼格式。
  - **權限連動**: 前台「系統工具」模組已與登入身分連動，動態決定帳密的可視性。
- **公告系統視覺與交互優化**:
  - **詳情彈窗**: 實作公告點擊彈窗功能（Dialog），支持完整內容閱讀。
  - **緊急公告強化**: 為「緊急」類別公告新增呼吸燈閃爍動畫、高對比警示色與專屬圖示，大幅提升視覺存在感。
- **資料豐富化**:
  - 編寫 `seed_mock_data.ts` 腳本，錄入多筆真實業務場景的 FAQ (出入金、爆倉規則) 與 SOP (異地登入處理)，提升頁面可測試性。
- **管理後台優化**:
  - 在管理後台側邊欄加入「回到領航站」入口，方便管理員切換身分使用工具。

## 2. 修改過的檔案 (Files Modified)
- **AI Docs**: `ai/handoff.md`
- **Server**: 
  - `server/src/routes/api.ts` (遮罩邏輯)
  - `server/src/routes/auth.ts` (新建立 - 登入 API)
  - `server/src/routes/admin.ts` (雜湊同步)
  - `server/src/index.ts` (路徑註冊)
  - `server/src/scripts/hash_passwords.ts` (新建立 - 密碼遷移)
  - `server/src/scripts/seed_mock_data.ts` (新建立 - 資料填充)
- **Client**:
  - `client/src/pages/login.tsx` (新建立 - 登入頁)
  - `client/src/pages/tools.tsx` (權限連動)
  - `client/src/pages/dashboard.tsx` (公告彈窗與緊急標籤)
  - `client/src/App.tsx` (路由與守衛配置)
  - `client/src/components/auth-guard.tsx` (新建立 - 權限守衛)
  - `client/src/components/app-sidebar.tsx` (使用者 Footer)
  - `client/src/components/admin-layout.tsx` (後台保護與返回按鈕)

## 3. 尚未完成事項 (Pending Items)
- **資料整理與真實填入**: 繼續將運營端剩餘的真實 FAQ 與 SOP 資料錄入。
- **JWT 實作**: 目前使用簡單 Token，未來應升級為具備時效性的 JWT 驗證。
- **管理後台關聯選擇器**: 在編輯 SOP 時實作視覺化的 FAQ 搜尋與關聯選擇組件。

## 4. 已知問題 (Known Issues)
- **Session 過期**: 目前 Token 存放在 localStorage 且無過期機制，重新整理瀏覽器會維持登入。

## 5. 今日建議下一步 (Suggested Next Steps)
1. **關聯選擇器**: 優化管理後台的 FAQ/SOP 編輯體驗，加入搜尋選擇器。
2. **操作稽核增強**: 在稽核日誌中詳細記錄具體修改了哪些欄位內容。

## 6. 重要技術變更 (Important Tech Changes)
- **角色映射**: 統一使用 `admin`, `high_level`, `operator` 作為系統權限關鍵字。
- **密碼策略**: 資料庫不再存儲任何明文密碼。
