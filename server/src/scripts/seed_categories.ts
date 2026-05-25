import { db } from "../db";
import { categories } from "../db/schema";

async function seedInitialCategories() {
  console.log("Seeding initial categories into database...");

  const initialCategories = [
    { id: "cat_faq_1", name: "開戶", type: "faq", sort_order: 1, color: "bg-blue-500" },
    { id: "cat_faq_2", name: "交易帳戶", type: "faq", sort_order: 2, color: "bg-emerald-500" },
    { id: "cat_faq_3", name: "入金", type: "faq", sort_order: 3, color: "bg-amber-500" },
    { id: "cat_faq_4", name: "出金", type: "faq", sort_order: 4, color: "bg-rose-500" },
    { id: "cat_faq_5", name: "交易", type: "faq", sort_order: 5, color: "bg-violet-500" },
    { id: "cat_faq_6", name: "代理", type: "faq", sort_order: 6, color: "bg-cyan-500" },
    { id: "cat_faq_7", name: "活動", type: "faq", sort_order: 7, color: "bg-pink-500" },
    { id: "cat_faq_8", name: "其他", type: "faq", sort_order: 8, color: "bg-slate-500" },
    
    { id: "cat_sop_1", name: "帳戶管理", type: "sop", sort_order: 1, color: "bg-blue-500" },
    { id: "cat_sop_2", name: "開戶", type: "sop", sort_order: 2, color: "bg-emerald-500" },
    { id: "cat_sop_3", name: "入金", type: "sop", sort_order: 3, color: "bg-amber-500" },
    { id: "cat_sop_4", name: "出金", type: "sop", sort_order: 4, color: "bg-rose-500" },
    { id: "cat_sop_5", name: "交易", type: "sop", sort_order: 5, color: "bg-violet-500" },
    { id: "cat_sop_6", name: "代理", type: "sop", sort_order: 6, color: "bg-cyan-500" },
    { id: "cat_sop_7", name: "合規", type: "sop", sort_order: 7, color: "bg-pink-500" },
    { id: "cat_sop_8", name: "其他", type: "sop", sort_order: 8, color: "bg-slate-500" },

    { id: "cat_tpl_1", name: "取款類", type: "template", sort_order: 1, color: "bg-rose-500" },
    { id: "cat_tpl_2", name: "帳戶變更類", type: "template", sort_order: 2, color: "bg-blue-500" },
    { id: "cat_tpl_3", name: "開戶類", type: "template", sort_order: 3, color: "bg-emerald-500" },
    { id: "cat_tpl_4", name: "審查類", type: "template", sort_order: 4, color: "bg-amber-500" },
    { id: "cat_tpl_5", name: "其他", type: "template", sort_order: 5, color: "bg-slate-500" },
  ];

  try {
    await db.insert(categories).values(initialCategories);
    console.log("Initial categories seeded successfully!");
  } catch (e) {
    console.error("Failed to seed categories (maybe they already exist?)", e);
  }
}

seedInitialCategories().catch(console.error);
