export type AzureTtsVoiceEntry = {
  country: string;
  lang: string;
  voiceName: string;
  ttsValue: string;
};

export const azureTtsVoices: AzureTtsVoiceEntry[] = [
  // ==================== en-US ====================
  {
    country: "US",
    lang: "en-US",
    voiceName: "Aria",
    ttsValue: "en-US-Aria:DragonHDFlashLatestNeural",
  },
  {
    country: "US",
    lang: "en-US",
    voiceName: "Davis",
    ttsValue: "en-US-Davis:DragonHDFlashLatestNeural",
  },
  {
    country: "US",
    lang: "en-US",
    voiceName: "Jenny",
    ttsValue: "en-US-Jenny:DragonHDFlashLatestNeural",
  },
  {
    country: "US",
    lang: "en-US",
    voiceName: "Guy",
    ttsValue: "en-US-Guy:Neural",
  },
  {
    country: "US",
    lang: "en-US",
    voiceName: "Amber",
    ttsValue: "en-US-Amber:Neural",
  },
  {
    country: "US",
    lang: "en-US",
    voiceName: "Ana",
    ttsValue: "en-US-Ana:Neural",
  },
  {
    country: "US",
    lang: "en-US",
    voiceName: "Andrew",
    ttsValue: "en-US-Andrew:Neural",
  },
  {
    country: "US",
    lang: "en-US",
    voiceName: "Brandon",
    ttsValue: "en-US-Brandon:Neural",
  },
  {
    country: "US",
    lang: "en-US",
    voiceName: "Christopher",
    ttsValue: "en-US-Christopher:Neural",
  },
  {
    country: "US",
    lang: "en-US",
    voiceName: "Elizabeth",
    ttsValue: "en-US-Elizabeth:Neural",
  },
  {
    country: "US",
    lang: "en-US",
    voiceName: "Emma",
    ttsValue: "en-US-Emma:Neural",
  },

  // ==================== en-GB ====================
  {
    country: "GB",
    lang: "en-GB",
    voiceName: "Alba",
    ttsValue: "en-GB-Alba:DragonHDFlashLatestNeural",
  },
  {
    country: "GB",
    lang: "en-GB",
    voiceName: "Ethan",
    ttsValue: "en-GB-Ethan:DragonHDFlashLatestNeural",
  },
  {
    country: "GB",
    lang: "en-GB",
    voiceName: "Mia",
    ttsValue: "en-GB-Mia:Neural",
  },
  {
    country: "GB",
    lang: "en-GB",
    voiceName: "Oliver",
    ttsValue: "en-GB-Oliver:Neural",
  },
  {
    country: "GB",
    lang: "en-GB",
    voiceName: "Amelia",
    ttsValue: "en-GB-Amelia:Neural",
  },
  {
    country: "GB",
    lang: "en-GB",
    voiceName: "Charlotte",
    ttsValue: "en-GB-Charlotte:Neural",
  },

  // ==================== zh-CN ====================
  {
    country: "CN",
    lang: "zh-CN",
    voiceName: "Xiaoxiao",
    ttsValue: "zh-CN-Xiaoxiao:DragonHDFlashLatestNeural",
  },
  {
    country: "CN",
    lang: "zh-CN",
    voiceName: "Yunxi",
    ttsValue: "zh-CN-Yunxi:DragonHDFlashLatestNeural",
  },
  {
    country: "CN",
    lang: "zh-CN",
    voiceName: "Yunjian",
    ttsValue: "zh-CN-Yunjian:Neural",
  },
  {
    country: "CN",
    lang: "zh-CN",
    voiceName: "Xiaochen",
    ttsValue: "zh-CN-Xiaochen:Neural",
  },
  {
    country: "CN",
    lang: "zh-CN",
    voiceName: "Xiaohan",
    ttsValue: "zh-CN-Xiaohan:Neural",
  },
  {
    country: "CN",
    lang: "zh-CN",
    voiceName: "Xiaomeng",
    ttsValue: "zh-CN-Xiaomeng:Neural",
  },

  // ==================== zh-TW ====================
  {
    country: "TW",
    lang: "zh-TW",
    voiceName: "HsiaoYu",
    ttsValue: "zh-TW-HsiaoYu:Neural",
  },
  {
    country: "TW",
    lang: "zh-TW",
    voiceName: "YunJhe",
    ttsValue: "zh-TW-YunJhe:Neural",
  },

  // ==================== zh-HK ====================
  {
    country: "HK",
    lang: "zh-HK",
    voiceName: "HiuMaan",
    ttsValue: "zh-HK-HiuMaan:Neural",
  },
  {
    country: "HK",
    lang: "zh-HK",
    voiceName: "WanLung",
    ttsValue: "zh-HK-WanLung:Neural",
  },
];

/** Default aligned with previous Step2 default (Yunjian). */
export const DEFAULT_AZURE_TTS_VOICE_VALUE = "zh-CN-Yunjian:Neural";

const LANG_GROUP_LABEL: Record<string, string> = {
  "en-US": "en-US · US English",
  "en-GB": "en-GB · UK English",
  "zh-CN": "zh-CN · 普通话",
  "zh-TW": "zh-TW · 台湾",
  "zh-HK": "zh-HK · 粤语",
};

const GROUP_ORDER = ["en-US", "en-GB", "zh-CN", "zh-TW", "zh-HK"];

export function formatAzureVoiceOptionLabel(entry: AzureTtsVoiceEntry): string {
  return `${entry.lang} · ${entry.voiceName} · ${entry.country}`;
}

export function groupAzureTtsVoicesForSelect(): {
  lang: string;
  groupLabel: string;
  voices: AzureTtsVoiceEntry[];
}[] {
  const byLang = new Map<string, AzureTtsVoiceEntry[]>();
  for (const v of azureTtsVoices) {
    const list = byLang.get(v.lang) ?? [];
    list.push(v);
    byLang.set(v.lang, list);
  }
  const result: {
    lang: string;
    groupLabel: string;
    voices: AzureTtsVoiceEntry[];
  }[] = [];
  for (const lang of GROUP_ORDER) {
    const voices = byLang.get(lang);
    if (!voices?.length) continue;
    result.push({
      lang,
      groupLabel: LANG_GROUP_LABEL[lang] ?? lang,
      voices,
    });
  }
  return result;
}
