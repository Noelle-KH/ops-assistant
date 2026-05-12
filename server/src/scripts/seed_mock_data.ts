import { db } from "../db";
import { 
  faqs, 
  sops, 
  templates, 
  announcements, 
  groups, 
  tools
} from "../db/schema";
import { v4 as uuidv4 } from 'uuid';

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
      id: "sop_002",
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
