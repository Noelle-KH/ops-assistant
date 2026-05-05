export const ROLE_MAP: Record<string, string> = {
  "sales": "业务员",
  "Level I": "Level I",
  "Level II": "Level II",
  "Level III": "Level Ⅲ",
  "Level Ⅲ": "Level Ⅲ",
  "user": "直客",
};

export interface ParseResult {
  success: boolean;
  data?: string;
  error?: string;
  debugInfo?: any;
}

export function parseAttributionChain(input: string): ParseResult {
  const trimmedInput = input.trim();
  if (!trimmedInput) {
    return { success: false, error: "請輸入歸屬鏈資料後再進行解析" };
  }

  // First, try splitting by comma as primary separator
  let fields = trimmedInput.split(",").map(f => f.trim());
  
  // If comma split doesn't result in multiple fields, try tab/newline
  if (fields.length <= 1) {
    fields = trimmedInput.split(/[\t\n\r]+/).map(f => f.trim());
  }

  // Filter out truly empty strings but keep spaces if they are within a field
  fields = fields.filter(f => f !== "");
  
  if (fields.length < 3) {
    return { 
      success: false, 
      error: "輸入資料不足：每筆資料至少應包含 ID、角色、姓名三個欄位",
      debugInfo: { fieldCount: fields.length, fields }
    };
  }

  if (fields.length % 3 !== 0) {
    // If it's not a multiple of 3, maybe it's separated by something else or has extra trailing stuff
    // We'll try to process what we can, but technically it's an error per PRD
    return { 
      success: false, 
      error: `格式錯誤：資料欄位數量(${fields.length})不符，每筆資料應包含 ID、角色、姓名三個欄位`,
      debugInfo: { fields }
    };
  }

  const results: string[] = [];
  for (let i = 0; i < fields.length; i += 3) {
    const rawRole = fields[i + 1];
    const name = fields[i + 2];
    const recordIndex = Math.floor(i / 3) + 1;

    if (!rawRole) {
      return { success: false, error: `第 ${recordIndex} 筆資料的角色欄位為空` };
    }

    // Fuzzy matching for roles
    let matchedRole: string | null = null;
    
    // Normalize Roman Numeral characters to standard characters first
    const normalizedForRoman = rawRole
      .replace(/Ⅰ/g, 'I')
      .replace(/Ⅱ/g, 'II')
      .replace(/Ⅲ/g, 'III');
      
    const normalizedRawRole = normalizedForRoman.toLowerCase().replace(/\s+/g, '');

    // 1. Direct map check using the pre-normalized (but still with spaces) version
    if (ROLE_MAP[rawRole]) {
      matchedRole = ROLE_MAP[rawRole];
    } else if (ROLE_MAP[normalizedForRoman]) {
      matchedRole = ROLE_MAP[normalizedForRoman];
    }
    // 2. Normalized check (lowercase and no spaces)
    else {
      for (const [key, value] of Object.entries(ROLE_MAP)) {
        if (key.toLowerCase().replace(/\s+/g, '') === normalizedRawRole) {
          matchedRole = value;
          break;
        }
      }
    }

    // 3. Fallback for common patterns
    if (!matchedRole) {
      if (normalizedRawRole.includes("levelii") || normalizedRawRole === "level2") {
        matchedRole = "Level II";
      } else if (normalizedRawRole.includes("leveli") && !normalizedRawRole.includes("levelii")) {
        matchedRole = "Level I";
      } else if (normalizedRawRole.includes("leveliii") || normalizedRawRole === "level3") {
        matchedRole = "Level Ⅲ";
      } else if (normalizedRawRole.includes("sales") || normalizedRawRole.includes("业务员")) {
        matchedRole = "业务员";
      } else if (normalizedRawRole.includes("user") || normalizedRawRole.includes("直客")) {
        matchedRole = "直客";
      }
    }

    if (!matchedRole) {
      return { 
        success: false, 
        error: `第 ${recordIndex} 筆資料的角色代碼「${rawRole}」無法識別`,
        debugInfo: { rawRole, normalizedRawRole }
      };
    }

    if (!name) {
      return { 
        success: false, 
        error: `第 ${recordIndex} 筆資料的姓名欄位為空`,
        debugInfo: { fields }
      };
    }

    results.push(`${name}(${matchedRole})`);
  }

  return { 
    success: true, 
    data: results.join(" ,") 
  };
}
