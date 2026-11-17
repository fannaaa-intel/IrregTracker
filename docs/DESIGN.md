# Design: Pink Minimalist

Soft, calm, and personal, but never childish. Mostly white space with blush pink accents and a few organic shapes. It should feel like a quiet notebook, not a cartoon.

Tokens live in `src/theme/tokens.ts`. Components must use tokens only.

---

## 1. Color

### Light (default)
| Token | Hex | Use | Contrast on `bg` |
|---|---|---|---|
| `bg` | `#FFF8FA` | App background (blush white) | — |
| `surface` | `#FFFFFF` | Cards, sheets | — |
| `surfaceTint` | `#FCE8EF` | Selected chips, soft panels | — |
| `border` | `#F3DCE4` | Hairlines, card borders | — |
| `text` | `#3B2A31` | Primary text (warm plum-brown) | 12.9 ✅ |
| `textMuted` | `#7A6570` | Secondary text, captions | 5.1 ✅ |
| `primary` | `#C2416E` | Buttons, links, active tab, text accents | 4.7 ✅ |
| `onPrimary` | `#FFFFFF` | Text on primary buttons | 4.9 ✅ |
| `primaryDeep` | `#9C2F57` | Text on `surfaceTint` | 6.1 ✅ |
| `petal` | `#E57A9C` | **Decorative only**: period-day fill, ring progress | 2.6 (no text) |
| `blush` | `#F7C6D5` | **Decorative only**: predicted window band, blobs | — |
| `notice` | `#8A5A1F` | Gentle flag text (warm amber, not red) | 5.6 ✅ |
| `noticeBg` | `#FDF1E3` | Flag card background | — |
| `calm` | `#2F6B4F` | Success / "saved" text (sage) | 6.0 ✅ |

### Dark
| Token | Hex |
|---|---|
| `bg` | `#1C1418` |
| `surface` | `#261B20` |
| `surfaceTint` | `#3A2530` |
| `border` | `#3A2A31` |
| `text` | `#F7E9EE` (15.4 ✅) |
| `textMuted` | `#B9A4AD` (7.7 ✅) |
| `primary` | `#F08DAE` (7.9 ✅ as text) |
| `onPrimary` | `#1C1418` (7.9 ✅) |
| `petal` | `#D9658A` |
| `blush` | `#5A3344` |
| `notice` | `#E8B97A` |
| `noticeBg` | `#33261A` |
| `calm` | `#8CC8A8` |

### Flow colors (calendar fills)
Lighter to stronger. Each one is also marked by a **droplet icon count** (1–3), so the meaning isn't shown by color alone.

| Flow | Light | Marker |
|---|---|---|
| spotting | outline only, `petal` dot | small dot |
| light | `#F7C6D5` | 1 droplet |
| medium | `#E57A9C` | 2 droplets |
| heavy | `#C2416E` | 3 droplets |

---

## 2. Typography

Font: **Nunito** (rounded, friendly, very readable). Numbers use `fontVariant: ['tabular-nums']`.

| Token | Size / line | Weight | Use |
|---|---|---|---|
| `display` | 44 / 48 | 700 | "Day 18" in the cycle ring |
| `title` | 24 / 30 | 700 | Screen titles |
| `heading` | 18 / 24 | 700 | Card titles |
| `body` | 16 / 22 | 400 | Default text |
| `label` | 14 / 18 | 600 | Chips, buttons |
| `caption` | 12 / 16 | 400 | Hints, timestamps |

Sentence case everywhere. No ALL CAPS.

---

## 3. Spacing, radius, elevation

- Spacing scale (4-pt): `xs 4 · sm 8 · md 12 · lg 16 · xl 24 · xxl 32 · xxxl 48`
- Screen padding: `xl` (24)
- Radius: `sm 8 · md 14 · lg 20 · pill 999`
- Cards: `surface`, radius `lg`, 1px `border`, **no heavy shadows**. At most one soft shadow (`#C2416E` at 6% opacity, y 4, blur 16).

---

## 4. Elements (the "personality" layer)

Use these sparingly. One or two per screen is enough.

1. **Cycle ring (Home)**: a thin circular track (`border`, 10px stroke) with a `petal` arc showing progress through the median cycle. The predicted window shows as a `blush` arc segment on the same ring. A big "Day 18" sits in the center, with "of usually 31–38" under it in `textMuted`.
2. **Soft blobs**: 1–2 organic SVG blob shapes in `blush` at 40–60% opacity, partly off-screen behind the Home header and the onboarding cards. They are static, or drift very slowly (respect Reduce Motion).
3. **Petal dots**: tiny 4-dot clusters (`petal`) used as section dividers and empty-state decorations.
4. **Droplet marks**: a simple rounded droplet icon for flow (1–3 droplets). It's also the app's core icon motif.
5. **Dashed window band**: on the calendar, predicted days get a `blush` dashed rounded outline that connects across the days, plus "Likely window" in the legend.
6. **Line icons**: `lucide-react-native`, stroke width 1.5, size 22, color `textMuted` (or `primary` when active).
7. **Empty states**: one small blob + petal dots + one friendly sentence ("Nothing logged yet. Tap a day to start.").

Avoid: flowers, hearts, cartoon characters, glitter, gradients across whole screens, and stock "feminine" clip-art. The UW study found users disliked pink, flowery designs; we keep pink as an *accent*, not wallpaper.

---

## 5. Components

| Component | Spec |
|---|---|
| `Button` (primary) | `primary` bg, `onPrimary` text, radius `pill`, height 52, `label` text |
| `Button` (quiet) | transparent, `primary` text, same size |
| `Chip` | height 36, radius `pill`, `surface` + `border`; selected = `surfaceTint` bg + `primaryDeep` text + check icon |
| `Card` | see §3 |
| `FlagCard` | `noticeBg`, `notice` text, leaf/info icon, "Why am I seeing this?" quiet link, dismiss ✕ |
| `ConfidenceChip` | Low / Medium / High with 1–3 filled dots (not color-only) |
| `CalendarDay` | 44×44 circle; period = filled flow color; today = 1.5px `primary` ring; spotting = dot under number |
| `CycleRing` | see Elements §1 |
| `BarChart` (history) | rounded-top bars in `petal`; excluded cycles = `border` color with a tag icon; median = dashed `primary` line |

---

## 6. Motion & feel

- Durations: 150 ms (press), 250 ms (sheet/modal). Ease-out.
- Haptics: light impact on logging a day; nothing else.
- Respect `AccessibilityInfo.isReduceMotionEnabled`. When it's on, there's no blob drift and no ring animation.

---

## 7. Discreet mode (v1.5)

- Alternate app icon: plain blush circle with a white dot. Name: "Cycle" or "Notes".
- Notifications: "You have a reminder" with no health wording.
- Lock screen shows only a petal-dot mark, no text.
