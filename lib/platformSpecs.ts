// ─── Platform Specifications ──────────────────────────────────────────────────
// Character limits and format rules for every major social/ad platform.
// Sources: official platform ad guidelines (as of 2025).

export interface FieldSpec {
  name: string;
  maxChars: number;
  recommended?: number;
  required: boolean;
  note?: string;
}

export interface PlatformSpec {
  id: string;
  displayName: string;
  category: "ad" | "post" | "email";
  fields: FieldSpec[];
  formatNotes: string;        // Plain-English rules injected into prompts
  matchKeywords: string[];    // Used for auto-detection from brief assetType
}

export const PLATFORM_SPECS: PlatformSpec[] = [
  // ─── Google ───────────────────────────────────────────────────────────────
  {
    id: "google_search_ad",
    displayName: "Google Search Ad",
    category: "ad",
    fields: [
      { name: "Headline 1", maxChars: 30, required: true },
      { name: "Headline 2", maxChars: 30, required: true },
      { name: "Headline 3", maxChars: 30, required: false },
      { name: "Description 1", maxChars: 90, required: true },
      { name: "Description 2", maxChars: 90, required: false },
    ],
    formatNotes:
      "Google Search Ad: Up to 3 headlines (30 chars each, shown as 'H1 | H2 | H3'), and up to 2 descriptions (90 chars each). Each headline and description must work independently — Google rotates them. No punctuation at the end of headlines. Do not repeat the same words across headlines.",
    matchKeywords: ["google", "search ad", "google ad", "ppc", "adwords", "sem"],
  },
  {
    id: "google_display_ad",
    displayName: "Google Display / Responsive Ad",
    category: "ad",
    fields: [
      { name: "Short Headline", maxChars: 30, required: true },
      { name: "Long Headline", maxChars: 90, required: true },
      { name: "Description", maxChars: 90, required: true },
      { name: "Business Name", maxChars: 25, required: true },
    ],
    formatNotes:
      "Google Display / Responsive Display Ad: Short headline (30 chars), long headline (90 chars), description (90 chars), business name (25 chars). The short headline appears alone in some placements so it must make sense on its own.",
    matchKeywords: ["google display", "display ad", "responsive display", "gdn"],
  },

  // ─── Facebook ─────────────────────────────────────────────────────────────
  {
    id: "facebook_ad",
    displayName: "Facebook Ad",
    category: "ad",
    fields: [
      {
        name: "Primary Text",
        maxChars: 500,
        recommended: 125,
        required: true,
        note: "Truncated to ~125 chars in feed — lead with the hook",
      },
      { name: "Headline", maxChars: 40, required: true },
      { name: "Description (link preview)", maxChars: 30, required: false },
    ],
    formatNotes:
      "Facebook Ad: Primary text is truncated after ~125 characters in the feed (max 500). The most important message must be in the first 125 chars. Headline is 40 chars max and appears below the image. Description (30 chars) is optional and appears below the headline. Emojis are allowed and can improve engagement.",
    matchKeywords: ["facebook ad", "fb ad", "meta ad", "facebook"],
  },
  {
    id: "facebook_post",
    displayName: "Facebook Post",
    category: "post",
    fields: [
      {
        name: "Post Text",
        maxChars: 63206,
        recommended: 80,
        required: true,
        note: "Posts under 80 chars get 66% higher engagement",
      },
    ],
    formatNotes:
      "Facebook Post: Technically up to 63,206 characters, but posts under 80 characters receive 66% higher engagement. After 3 lines the post is truncated with 'See More'. Lead with the hook in the first 2 lines. Emojis, line breaks, and questions drive engagement.",
    matchKeywords: ["facebook post", "fb post", "facebook organic"],
  },

  // ─── Instagram ────────────────────────────────────────────────────────────
  {
    id: "instagram_ad",
    displayName: "Instagram Ad",
    category: "ad",
    fields: [
      {
        name: "Primary Text / Caption",
        maxChars: 2200,
        recommended: 125,
        required: true,
        note: "Truncated to ~125 chars in feed",
      },
      { name: "Headline (if link ad)", maxChars: 40, required: false },
    ],
    formatNotes:
      "Instagram Ad: Caption/primary text is truncated after ~125 characters in the feed (max 2,200). Lead with the strongest message in the first 125 chars. Hashtags work but keep them at the end. If using a link ad format, headline is 40 chars max. Visual-first platform — copy supports the image, not the other way around.",
    matchKeywords: ["instagram ad", "ig ad", "instagram"],
  },
  {
    id: "instagram_post",
    displayName: "Instagram Post",
    category: "post",
    fields: [
      {
        name: "Caption",
        maxChars: 2200,
        recommended: 138,
        required: true,
        note: "Truncated after ~125 chars without 'more' tap",
      },
      {
        name: "Hashtags",
        maxChars: 2200,
        recommended: 30,
        required: false,
        note: "Max 30 hashtags; 3-5 targeted hashtags often outperform 30",
      },
    ],
    formatNotes:
      "Instagram Post: Caption max 2,200 chars, truncated after ~125 chars in feed. Hook in the first line is critical. Max 30 hashtags, but 3-5 highly relevant hashtags outperform stuffing. Line breaks and emojis are expected on this platform. Call to action should direct to link in bio.",
    matchKeywords: ["instagram post", "ig post", "instagram organic", "reel"],
  },

  // ─── Twitter / X ──────────────────────────────────────────────────────────
  {
    id: "twitter_post",
    displayName: "X (Twitter) Post",
    category: "post",
    fields: [
      {
        name: "Tweet Text",
        maxChars: 280,
        required: true,
        note: "URLs count as 23 chars regardless of length. Images do not use character count.",
      },
    ],
    formatNotes:
      "X (Twitter) Post: Hard 280 character limit. URLs are automatically shortened and count as 23 chars. Images and videos do not consume characters. Hashtags consume characters — use 1-2 maximum. Front-load the value — the algorithm shows first ~100 chars before 'show more'.",
    matchKeywords: ["twitter", "tweet", "x post", "x ad", "twitter post"],
  },
  {
    id: "twitter_ad",
    displayName: "X (Twitter) Promoted Ad",
    category: "ad",
    fields: [
      {
        name: "Tweet Text",
        maxChars: 280,
        required: true,
        note: "Same limit as organic tweets",
      },
    ],
    formatNotes:
      "X (Twitter) Promoted Ad: 280 character hard limit, same as organic tweets. URLs count as 23 chars. Keep the CTA clear and direct. Promoted tweets perform best when they don't look like ads — conversational tone outperforms formal ad copy.",
    matchKeywords: ["twitter ad", "promoted tweet", "x ad", "promoted ad twitter"],
  },

  // ─── LinkedIn ─────────────────────────────────────────────────────────────
  {
    id: "linkedin_ad",
    displayName: "LinkedIn Sponsored Ad",
    category: "ad",
    fields: [
      {
        name: "Introductory Text",
        maxChars: 600,
        recommended: 150,
        required: true,
        note: "Truncated to ~150 chars in feed",
      },
      { name: "Headline", maxChars: 70, required: true },
      { name: "Description", maxChars: 100, required: false },
    ],
    formatNotes:
      "LinkedIn Sponsored Content Ad: Introductory text is 600 chars max but truncated to ~150 chars in the feed — lead with the core message. Headline is 70 chars max (appears as the link title). Description is 100 chars. Professional tone is expected. Stats and specific outcomes ('47% faster', '3x ROI') perform strongly on LinkedIn.",
    matchKeywords: ["linkedin ad", "linkedin sponsored", "linkedin", "b2b ad"],
  },
  {
    id: "linkedin_post",
    displayName: "LinkedIn Post",
    category: "post",
    fields: [
      {
        name: "Post Text",
        maxChars: 3000,
        recommended: 1300,
        required: true,
        note: "Truncated after ~210 chars without 'see more'",
      },
    ],
    formatNotes:
      "LinkedIn Post: 3,000 char max. Posts are truncated after ~210 characters with a 'see more' prompt — the hook must be in the first 2-3 lines. Posts between 1,000-1,300 chars tend to perform best. Short-paragraph format (1-2 sentences per line) with line breaks is the LinkedIn norm. First-person stories outperform company announcements.",
    matchKeywords: ["linkedin post", "linkedin organic", "linkedin article"],
  },

  // ─── TikTok ───────────────────────────────────────────────────────────────
  {
    id: "tiktok_ad",
    displayName: "TikTok Ad",
    category: "ad",
    fields: [
      { name: "Ad Text / Caption", maxChars: 100, required: true },
    ],
    formatNotes:
      "TikTok Ad: 100 character hard limit for ad text/caption. The visual and audio carry the message — text is secondary. CTAs must be extremely short and punchy. Native-feeling content (UGC style) dramatically outperforms polished ad creative on TikTok.",
    matchKeywords: ["tiktok", "tik tok", "tiktok ad"],
  },
  {
    id: "tiktok_post",
    displayName: "TikTok Post / Caption",
    category: "post",
    fields: [
      {
        name: "Caption",
        maxChars: 2200,
        recommended: 150,
        required: true,
      },
    ],
    formatNotes:
      "TikTok Post Caption: 2,200 char max, but most perform best under 150 chars. The video carries the content — captions are for SEO keywords and CTAs. 3-5 hashtags are recommended. Questions ('which would you choose?') drive comments.",
    matchKeywords: ["tiktok post", "tiktok organic", "tiktok caption"],
  },

  // ─── YouTube ──────────────────────────────────────────────────────────────
  {
    id: "youtube_ad",
    displayName: "YouTube Ad",
    category: "ad",
    fields: [
      {
        name: "Headline",
        maxChars: 15,
        required: false,
        note: "Bumper ads only — most YouTube ads are video scripts",
      },
      {
        name: "Video Script / Description",
        maxChars: 5000,
        required: false,
        note: "For skippable in-stream: hook must land within first 5 seconds",
      },
    ],
    formatNotes:
      "YouTube Ad: Skippable in-stream ads must capture attention in the first 5 seconds (before skip button appears). Non-skippable ads are 15-20 seconds. Bumper ads are 6 seconds max with a 15-char headline overlay. If writing a video script, structure it as: Hook (0-5s) → Problem (5-15s) → Solution (15-25s) → CTA (final 5s).",
    matchKeywords: ["youtube", "youtube ad", "pre-roll", "bumper ad"],
  },

  // ─── Pinterest ────────────────────────────────────────────────────────────
  {
    id: "pinterest_ad",
    displayName: "Pinterest Ad (Promoted Pin)",
    category: "ad",
    fields: [
      { name: "Title", maxChars: 100, required: true },
      {
        name: "Description",
        maxChars: 500,
        recommended: 150,
        required: true,
        note: "Only first ~50 chars show in feed",
      },
    ],
    formatNotes:
      "Pinterest Promoted Pin: Title is 100 chars. Description is 500 chars max but only the first ~50 chars appear in the feed — put the hook there. Pinterest is a visual search engine, so keyword-rich descriptions help with organic reach alongside the paid promotion. Aspirational and instructional content ('how to', 'ideas for') performs best.",
    matchKeywords: ["pinterest", "pinterest ad", "promoted pin"],
  },

  // ─── Email ────────────────────────────────────────────────────────────────
  {
    id: "email",
    displayName: "Email",
    category: "email",
    fields: [
      {
        name: "Subject Line",
        maxChars: 60,
        recommended: 40,
        required: true,
        note: "Preview on mobile cuts off after ~40 chars",
      },
      {
        name: "Preview Text",
        maxChars: 140,
        recommended: 90,
        required: false,
        note: "Shown next to subject in inbox",
      },
      {
        name: "Body",
        maxChars: 0, // no hard limit
        required: true,
        note: "No hard limit — but under 200 words for promotional emails",
      },
    ],
    formatNotes:
      "Email: Subject line should be under 60 chars (40 recommended for mobile). Preview text is 90-140 chars shown in the inbox alongside the subject. Body has no hard limit but promotional emails perform best under 200 words. Single clear CTA. Avoid spam trigger words. Personalization tokens ('{{first_name}}') significantly improve open rates.",
    matchKeywords: ["email", "newsletter", "email campaign", "drip", "cold email"],
  },

  // ─── SMS ──────────────────────────────────────────────────────────────────
  {
    id: "sms",
    displayName: "SMS / Text Message",
    category: "ad",
    fields: [
      {
        name: "Message",
        maxChars: 160,
        required: true,
        note: "160 chars = 1 SMS segment. Unicode chars (emojis) reduce limit to 70.",
      },
    ],
    formatNotes:
      "SMS: Hard limit of 160 characters per segment (standard GSM characters). Using emojis or special Unicode characters reduces the limit to 70 chars per segment. Keep it to 1 segment. Must include opt-out instructions ('Reply STOP') which consume characters. Brand name should appear in first ~20 chars.",
    matchKeywords: ["sms", "text message", "text ad", "mms"],
  },
];

// ─── Auto-detect platform from assetType string ───────────────────────────────

export function detectPlatformSpec(assetType: string): PlatformSpec | null {
  const lower = assetType.toLowerCase();
  let bestMatch: PlatformSpec | null = null;
  let bestScore = 0;

  for (const spec of PLATFORM_SPECS) {
    for (const keyword of spec.matchKeywords) {
      if (lower.includes(keyword)) {
        const score = keyword.length; // longer keyword = more specific match
        if (score > bestScore) {
          bestScore = score;
          bestMatch = spec;
        }
      }
    }
  }

  return bestMatch;
}

// ─── Format spec for prompt injection ────────────────────────────────────────

export function formatSpecForPrompt(spec: PlatformSpec): string {
  const fieldLines = spec.fields.map((f) => {
    const limit = f.maxChars > 0 ? `${f.maxChars} chars max` : "no hard limit";
    const rec = f.recommended ? ` (recommended: ${f.recommended} chars)` : "";
    const req = f.required ? "required" : "optional";
    const note = f.note ? ` — ${f.note}` : "";
    return `  • ${f.name}: ${limit}${rec} [${req}]${note}`;
  });

  return `PLATFORM: ${spec.displayName}
FORMAT REQUIREMENTS:
${fieldLines.join("\n")}
RULES: ${spec.formatNotes}`;
}

// ─── Get total character budget for an asset (for UI display) ─────────────────

export function getPrimaryFieldLimit(spec: PlatformSpec): { fieldName: string; limit: number; recommended?: number } | null {
  // Return the most important single-field limit for the character counter UI
  const primary = spec.fields.find((f) => f.required);
  if (!primary || primary.maxChars === 0) return null;
  return {
    fieldName: primary.name,
    limit: primary.maxChars,
    recommended: primary.recommended,
  };
}
