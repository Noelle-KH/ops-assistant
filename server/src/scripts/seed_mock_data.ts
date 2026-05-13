import { db } from "../db";
import { 
  faqs, 
  sops, 
  templates, 
  announcements, 
  groups, 
  tools
} from "../db/schema";

async function seed() {
  console.log("Seeding realistic mock data...");

  // 1. More FAQs
  const faqList = [
    {
      id: "faq_004",
      category: "帳戶安全",
      tags: ["密碼", "解鎖", "安全性"],
      question: "客戶帳號因多次嘗試失敗被鎖定，該如何處理？",
      answer: "1. 核對客戶基本資料。2. 確認鎖定原因（如：密碼錯誤、異地登入）。3. 若確認為本人操作，可透過後台『帳戶管理』執行『手動解鎖』。4. 提醒客戶重設強強度密碼。",
      updated_at: new Date().toISOString(),
      status: "active"
    },
    {
      id: "faq_005",
      category: "出入金",
      tags: ["入金", "到帳時間", "USDT"],
      question: "USDT 入金通常多久會到帳？",
      answer: "USDT 入金依據區塊鏈網路擁塞程度而定。一般而言，ERC20 約需 10-20 分鐘（12次確認），TRC20 約需 5-10 分鐘。若超過一小時未到帳，請索取 Hash ID 進行手動查詢。",
      updated_at: new Date().toISOString(),
      status: "active"
    },
    {
      id: "faq_006",
      category: "產品規則",
      tags: ["槓桿", "保證金", "爆倉"],
      question: "系統的強制平倉規則是什麼？",
      answer: "當帳戶保證金比例低於 50% 時，系統將觸發強制平倉。平倉順序從虧損最多的訂單開始，直到保證金比例恢復至 80% 以上。",
      updated_at: new Date().toISOString(),
      status: "active"
    }
  ];

  for (const faq of faqList) {
    await db.insert(faqs).values(faq).onConflictDoUpdate({
      target: faqs.id,
      set: faq
    });
  }
  console.log("FAQs seeded.");

  // 2. More SOPs
  const sopList = [
    {
      id: "sop_001",
      title: "轉移歸屬標準流程",
      category: "帳戶管理",
      tags: ["歸屬權", "業務員"],
      rule: {
        description: "規範客戶帳號在不同業務員或代理之間轉移的審核標準。",
        conditions: ["客戶本人提出書面申請", "原業務員離職或無意願繼續服務", "新業務員符合承接資格"],
        restrictions: ["轉移後 30 天內禁止再次轉移", "涉及爭議帳號需先凍結"]
      },
      operation: {
        steps: [
          { step: 1, action: "核對客戶身分與轉移申請書" },
          { step: 2, action: "OA > 客戶管理 > 歸屬變更 > 提交申請" },
          { step: 3, action: "等待二級主管審核通過" },
          { step: 4, action: "通知新舊業務員變更完成" }
        ]
      },
      exceptions: [
        { scenario: "客戶涉及詐騙投訴", handling: "立即停止轉移流程，交由風控部門介入" }
      ],
      linked_faq: [],
      linked_template: [],
      updated_at: new Date().toISOString(),
      status: "active"
    },
    {
      id: "sop_002",
      title: "負餘額保護審核 SOP",
      category: "風控審核",
      tags: ["負餘額", "補償"],
      rule: {
        description: "當客戶帳戶因極端行情出現負值時，執行補償清零的審核流程。",
        conditions: ["帳戶餘額 < 0", "無未平倉訂單", "非惡意刷單導致"],
        restrictions: ["每位客戶每季度上限 3 次", "單次補償金額超過 $5000 需總監審核"]
      },
      operation: {
        steps: [
          { step: 1, action: "確認所有訂單已平倉且無掛單" },
          { step: 2, action: "系統後台 > 財務管理 > 負餘額調整 > 新增記錄" },
          { step: 3, action: "上傳行情異常時段截圖作為附件" },
          { step: 4, action: "點擊『執行調整』完成清零" }
        ]
      },
      exceptions: [
        { scenario: "惡意利用漏洞獲利", handling: "拒絕補償並考慮封鎖帳號" }
      ],
      linked_faq: ["faq_006"],
      linked_template: [],
      updated_at: new Date().toISOString(),
      status: "active"
    },
    {
      id: "sop_003",
      title: "取款審核判斷 SOP",
      category: "出金管理",
      tags: ["出金", "反洗錢"],
      rule: {
        description: "確保客戶取款符合安全性與反洗錢規定。",
        conditions: ["取款人姓名與實名認證一致", "取款路徑為原路返回（入金路徑）", "帳戶保證金比例 > 100%"],
        restrictions: ["處理時間超過 24 小時需主動告知原因", "單筆超過 $50,000 需視訊核身"]
      },
      operation: {
        steps: [
          { step: 1, action: "核對取款金額與帳戶可用餘額" },
          { step: 2, action: "檢查最近交易記錄有無洗錢嫌疑" },
          { step: 3, action: "OA > 出金審核 > 點擊『通過』" },
          { step: 4, action: "確認金流系統已下發支付指令" }
        ]
      },
      exceptions: [
        { scenario: "第三方帳戶取款", handling: "直接拒絕，要求更換為本人帳戶" }
      ],
      linked_faq: ["faq_005"],
      linked_template: [],
      updated_at: new Date().toISOString(),
      status: "active"
    },
    {
      id: "sop_004",
      title: "異地登入風險處理 SOP",
      category: "帳戶管理",
      tags: ["安全性", "風險管理"],
      rule: {
        description: "處理系統偵測到異地登入或異常 IP 存取時的標準流程。",
        conditions: ["登入 IP 與常用 IP 距離 > 500km", "短時間內多次登入失敗後登入成功"],
        restrictions: ["處理期間禁止該帳號出金", "禁止修改敏感資料"]
      },
      operation: {
        steps: [
          { step: 1, action: "凍結帳戶提現權限" },
          { step: 2, action: "向客戶註冊信箱發送安全驗證碼" },
          { step: 3, action: "致電客戶確認是否為本人操作" },
          { step: 4, action: "若非本人，引導客戶更換密碼並清除所有登入 Session" }
        ]
      },
      exceptions: [
        { scenario: "客戶出國旅遊中", handling: "要求提供旅遊證明或視訊核身後解除限制" }
      ],
      linked_faq: ["faq_004"],
      linked_template: [],
      updated_at: new Date().toISOString(),
      status: "active"
    }
  ];

  for (const sop of sopList) {
    await db.insert(sops).values(sop).onConflictDoUpdate({
      target: sops.id,
      set: sop
    });
  }
  console.log("SOPs seeded.");

  // 3. More Tools
  const toolList = [
    {
      id: "tool_004",
      category: "後台系統",
      name: "CRM 管理系統",
      url: "https://crm.iexs.example",
      desc: "客戶關係管理與基本資料查詢主入口。",
      accounts: [
        { role: "高級權限", username: "crm_admin_01", password: "CRM_Password_2026", is_sensitive: true },
        { role: "測試員", username: "crm_tester", password: "test_only_password", is_sensitive: false }
      ]
    },
    {
      id: "tool_005",
      category: "測試資源",
      name: "MetaTrader 5 Demo Server",
      url: "",
      desc: "MT5 測試環境連接配置資訊。",
      accounts: [
        { role: "管理員", username: "mt5_manager", password: "MT5_Secure_Key_88", is_sensitive: true },
        { role: "交易者", username: "1002345", password: "demo_trader_pwd", is_sensitive: false }
      ]
    }
  ];

  for (const tool of toolList) {
    await db.insert(tools).values(tool).onConflictDoUpdate({
      target: tools.id,
      set: tool
    });
  }
  console.log("Tools seeded.");

  console.log("Seeding completed successfully.");
}

seed().catch(err => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
