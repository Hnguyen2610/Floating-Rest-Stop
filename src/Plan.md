Dưới đây là **toàn bộ roadmap từ Pass 1 đến Pass 31**, mình đã gom lại thành một lộ trình thống nhất, bao gồm cả MVP đã làm xong, các feature còn thiếu theo mô tả game gốc, và các findings kỹ thuật đã rút ra trong quá trình QA.

# Tổng quan roadmap

```text
PHASE 1 — MVP FOUNDATION                 Pass 1–14   ✅ DONE
PHASE 2 — CORE GAME DEPTH                Pass 15–17  ✅ DONE (hệ thống + nội dung — xem ghi chú trạng thái trong từng pass)
PHASE 3 — CONTENT & SOCIAL INTERACTION   Pass 18–20  ✅ DONE (xem ghi chú trạng thái trong từng pass)
PHASE 4 — WORLD PROGRESSION              Pass 21–23  ✅ DONE (xem ghi chú trạng thái trong từng pass)
PHASE 5 — PRESENTATION & GAME FEEL       Pass 24–26  ✅ DONE (xem ghi chú trạng thái trong từng pass)
PHASE 6 — BALANCE & PLATFORM             Pass 27–30
PHASE 7 — RELEASE QA                     Pass 31
POST-MVP (sau Release QA)                xem "PRODUCT DIRECTION CHECKPOINT"
                                          + "POST-MVP" gần cuối file —
                                          Cloudy Origin/Rare Weather/Sky Archive
                                          đã chốt hướng, chưa bắt đầu code
```

Core philosophy phải giữ xuyên suốt:

```text
Observe
   ↓
Understand
   ↓
Interact
   ↓
Soothe
   ↓
Remember
```

Không được biến thành:

```text
Order → Craft → Sell → Upgrade
```

---

# PHASE 1 — MVP FOUNDATION ✅

Đây là phần Claude đã hoàn thành.

| Pass | Nội dung                         | Trạng thái |
| ---- | -------------------------------- | ---------- |
| 1    | Foundation / Phaser architecture | ✅          |
| 2    | Cloudy / Mây Bông                | ✅          |
| 3    | Guest + Emotion System           | ✅          |
| 4    | Weather Ingredients              | ✅          |
| 5    | Weather Crafting                 | ✅          |
| 6    | Guest Soothing                   | ✅          |
| 7    | Happiness Crystals               | ✅          |
| 8    | Decoration MVP                   | ✅          |
| 9    | Journal MVP                      | ✅          |
| 10   | Photo Moments                    | ✅          |
| 11   | Emotional Progression foundation | ✅          |
| 12   | Save / Load                      | ✅          |
| 13   | Polish cơ bản                    | ✅          |
| 14   | MVP QA                           | ✅          |

## Pass 1 — Foundation

Đã xây dựng:

```text
Phaser 3
TypeScript
Vite
Scenes
EventBus
GameSystems
Responsive canvas
Data loading
```

Architecture:

```text
Scenes / Entities
        ↓
 presentation
        ↓
Systems
        ↓
pure game logic
```

Systems không phụ thuộc Phaser để unit test được.

---

# Pass 2 — Cloudy

Mây Bông có:

```text
floating
blinking
touch
drag
soft deformation
spring return
```

Soft physics dựa trên control points + spring/damping.

---

# Pass 3 — Guest & Emotion System

Có:

```text
Sun
Moon
Little Star
```

và generic emotion system.

Guest lifecycle foundation:

```text
ARRIVING
↓
DISTRESSED
↓
CALMING
↓
RELAXED
↓
HAPPY
↓
LEAVING
```

---

# Pass 4 — Weather Ingredients

Đã có floating ingredient:

```text
Morning Dew
Warm Sunbeam
Cool Breeze
Rainbow Fragment
Star Dust
```

Có collect + inventory foundation.

---

# Pass 5 — Weather Crafting

Có Weather Mixer và recipe system data-driven.

Ví dụ:

```text
Morning Dew
+
Cool Breeze
=
Cool Drizzle
```

---

# Pass 6 — Guest Soothing

Có interaction:

```text
Sun → Cool Drizzle

Moon → Starry Lullaby

Little Star → gentle polishing
```

---

# Pass 7 — Happiness Crystal

Guest thư giãn:

```text
Guest relaxed
↓
Crystal spawn
↓
Player collect
↓
Happiness resource
```

Không coi đây là score.

---

# Pass 8 — Decoration MVP

Có ít nhất:

```text
Crystal Wind Chime
Rainbow Hammock
Firefly Lantern
Morning Dew Tea Table
Wind Pinwheel
```

---

# Pass 9 — Journal MVP

Có:

```text
guest chapters
photo
front/back
diary text
locked/unlocked memories
```

Nhưng hiện mới có khoảng 1 memory / guest.

---

# Pass 10 — Photo Moment

Có:

```text
special guest state
↓
sparkle/photo icon
↓
Dewdrop Lens
↓
photoMomentId
↓
Journal unlock
```

Không lưu screenshot base64.

Đây là quyết định đúng và phải giữ.

---

# Pass 11 — Progression Foundation

Có:

```text
visitCount
trustLevel
emotional state
memory unlock foundation
```

Nhưng chiều sâu nội dung vẫn chưa đủ.

---

# Pass 12 — Save System

Đã có abstraction async:

```ts
SaveProvider
```

Architecture phải tiếp tục giữ:

```text
SaveProvider
├── LocalSaveProvider
└── YouTubePlayablesSaveProvider     ← sau này
```

---

# Pass 13 — Initial Polish

Có:

```text
particles
tweens
basic sound
interaction feedback
```

Nhưng audio và game feel vẫn đang ở mức MVP.

---

# Pass 14 — MVP QA ✅

Đây là pass rất quan trọng vì đã phát hiện các bug thực tế:

```text
Guest không tự spawn production
LittleStar initialization crash
Phaser Container hit-area bug
pointer coordinate issue
```

Từ đây có một rule bắt buộc cho tất cả pass sau:

```text
Visible ≠ Interactive
Compile ≠ Playable
Unit tests pass ≠ Feature works in game
```

Mọi interaction đều phải test bằng pointer thực tế trên production build.

---

# CHECKPOINT — v0.1.0-mvp

Trước khi làm tiếp nên tag:

```text
v0.1.0-mvp
```

Đây là baseline ổn định.

---

# PHASE 2 — CORE GAME DEPTH ✅ (hệ thống + nội dung)

**Trạng thái (2026-09-03, cập nhật lần 2):** Pass 15/16/17 đã hoàn thiện cả hệ thống lẫn nội dung — code compile sạch (`tsc --noEmit`), 60/60 test pass, `npm run build` thành công, verify bằng Playwright thật trong browser (spawn khách cả 3 loại, pha chế, capture photo moment, mở Sky Journal — 0 console error). Nội dung do Claude tự thiết kế (được yêu cầu "tự thiết kế theo ý bạn") — xem ghi chú "Nội dung đã viết" trong từng pass để biết giọng văn/mạch truyện đã chọn, có thể chỉnh lại nếu không đúng ý.

Mỗi guest giờ có: 5 dòng cảm xúc × 2 câu thoại/dòng (10 câu, random mỗi lần), và 4 chapter/4 memory theo mạch cảm xúc riêng (3 chapter đầu tự mở khi guest đạt đúng stage trong lúc đang được dỗ dành, chapter 4 gắn với Photo Moment làm khoảnh khắc "resolution"). Đây là mức thấp trong khoảng "4-5 memory" mà Plan gốc đề ra — có thể mở rộng thêm nếu muốn nhiều hơn.

# Pass 15 — Inventory & Weather Mixer UX ✅ (hệ thống)

**Đã làm:** Bỏ scaffold kéo-thả nửa vời (getter `mixerUI` cứng `null`, không bao giờ chạy được), khôi phục flow tap-để-pha-chế đã chứng minh hoạt động — Collect → tap dòng nguyên liệu → tự động vào Mixer → Craft → Consume đúng. Sửa `WeatherMixerUI` gọi `fillArc`/`fillLine` (không tồn tại trên Phaser Graphics) và `this.scene.audioSystem` (không tồn tại) — cả hai đều là lỗi compile. Thêm click-vào-slot-để-gỡ nguyên liệu (`removeFromMixer` đã có sẵn trong `WeatherSystem` nhưng chưa được UI gọi tới).

### Vấn đề hiện tại

Hiện đang có flow hơi sai mental model:

```text
Ingredient
↓
Collect
↓
Inventory count tăng
```

nhưng để pha chế lại phải:

```text
tìm ingredient mới ngoài world
↓
kéo trực tiếp vào Mixer
```

Inventory vì vậy chưa có ý nghĩa gameplay thực sự.

### Flow mới

```text
World
↓
Collect
↓
Inventory
↓
Select / Drag
↓
Weather Mixer
↓
Craft
↓
Consume
```

Mixer phải có slots.

Player có thể:

```text
add ingredient
remove ingredient
replace ingredient
craft
```

Rule:

```text
Craft success → consume

Craft fail → không consume
```

Save/load inventory đầy đủ.

### Acceptance

```text
Collect
→ inventory tăng
→ đưa vào mixer
→ craft
→ consume đúng
→ reload
→ inventory đúng
```

### Priority

**P0**

Đây nên là pass tiếp theo.

---

# Pass 16 — Deep Emotional Progression ✅ (hệ thống + nội dung)

**Đã làm:** Chuyển từ mô hình 3 tầng cũ (`DISTRESSED/CALMING/RELAXED/HAPPY`) sang đúng 5 tầng như spec (`DISTRESSED/CALMING/RELAXED/CONTENT/PEACEFUL`), mỗi guest có emotion ID riêng theo từng tầng (`SUN_OVERHEATED` → `SUN_RELAXED`, `MOON_LONELY` → `MOON_PEACEFUL`, `STAR_INSECURE` → `STAR_CONFIDENT`). `emotions.json` được viết lại đầy đủ 15 entry (label + color tiếng Việt sạch, không lỗi encode) — trước đó data file này chưa từng được cập nhật theo model mới nên game sẽ crash "Unknown emotion" ngay khi guest đổi trạng thái. Sửa luôn 1 bug logic: fallback khi intensity thấp nhất trả về `DISTRESSED` (ngược), giờ trả `PEACEFUL` đúng nghĩa.

**Nội dung đã viết:** thêm `dialogue?: string[]` vào `EmotionMeta`, mỗi emotion ID (15 cái) có 2 câu thoại riêng — `StationScene` random 1 câu mỗi lần cập nhật hint thay vì dùng chung `needHint` tĩnh như trước. Giọng từng guest: Mặt Trời (nóng nảy → học cách nghỉ ngơi, không cần chứng minh gì), Mặt Trăng (cô đơn → dám kể chuyện, được lắng nghe), Bé Sao (tự ti → tin vào ánh sáng của riêng mình).

**Vẫn chưa làm:** visual progression riêng theo particles/animation cho từng stage — hiện chỉ đổi màu qua `emotionMeta.color`. Đây là việc thuộc Pass 26 (Visual Asset Pipeline)/Pass 25 (Game Feel), không phải nợ của Pass 16.

Đây là **feature quan trọng nhất của game**.

Không thêm 10 guest trước khi 3 guest hiện tại có chiều sâu.

Mỗi guest cần khoảng:

```text
5 emotional stages
8–10 dialogue variations
4–5 memories
3+ visual progression states
1 emotional resolution
```

Ví dụ Sun:

```text
Burned Out
↓
Irritable
↓
Beginning To Trust
↓
Comfortable
↓
Emotionally Open
↓
At Peace
```

Không hiển thị:

```text
Sun Level 5
```

Player phải cảm nhận progression thông qua:

```text
expression
animation
color
particles
dialogue
arrival behavior
interaction response
journal
```

Progression không chỉ dựa trên `visitCount`.

Nên dùng:

```text
visitCount
trustLevel
successfulTreatments
memoryProgress
specialInteractions
```

---

# Pass 17 — Sky Journal 2.0 ✅ (hệ thống + nội dung)

**Đã làm (hệ thống):** `journal.json` migrate sang schema mới (`id`, `title`, `hint` mỗi memory). Sửa `JournalSystem` constructor thiếu tham số `guestSystem`. Sửa bug thật phát hiện khi test bằng browser: card memory render sai tọa độ (tuyệt đối vs tương đối) → card nằm ngoài màn hình, hoàn toàn vô hình. Sửa vùng bấm lật thẻ bị lệch tâm và lỗi kiểu `PALETTE.mint` (number) dùng nhầm chỗ cần CSS string. Viết lại layout `drawChapters()`: đổi từ chia cột ngang theo số guest (không đủ chỗ khi 1 guest có nhiều chapter) sang xếp mỗi guest 1 hàng dọc, chapter trải ngang hết chiều rộng canvas — đã verify bằng screenshot thật, không còn đè chữ/đè card.

**Đã làm (nội dung):** mỗi guest có **4 chapter** ("01 Lần Ghé Đầu Tiên" → "04 [kết chuyện riêng]"), khớp mức thấp của "4-5 memory". Gating tăng dần qua visitCount (1→2→4→6) và trustLevel (0→8→24→40), chapter 4 thêm `requiredSuccessfulTreatments: 3`. 3 chapter đầu **tự mở khi guest đạt đúng emotional stage** trong lúc được dỗ (cơ chế mới, wired qua `JournalSystem.checkStageUnlocks` lắng nghe `guest:emotion-changed` — field `unlockedAtStage` trước đó có trong schema nhưng chưa từng được dùng thật). Chapter 4 vẫn gắn với Photo Moment như cũ, đóng vai trò "emotional resolution".

Journal chuyển từ proof-of-concept thành **một progression reward system thực sự**.

Ví dụ chapter Sun:

```text
01 First Visit
02 Cooling Down
03 A Quiet Afternoon
04 Learning To Rest
05 A Softer Light
```

Các memory chưa unlock:

```text
silhouette
+
small hint
```

Photo Moment condition có thể dựa trên:

```text
emotional stage
treatment
decoration
visit count
trust
time/state
special condition
```

Quan trọng:

Ảnh cũ phải phản ánh Sun ở thời điểm cũ.

Ví dụ:

```text
Photo 1
Sun đỏ, cau có

Photo 5
Sun vàng pastel, relaxed
```

Không lưu canvas screenshot.

Lưu:

```text
photoMomentId
guestId
stage
variant
unlockedAt
```

Sau đó reconstruct scene.

---

# PHASE 3 — CONTENT & SOCIAL INTERACTION ✅ (2026-09-03)

**Trạng thái:** Cả 3 pass đã xong — code compile sạch, 66/66 test pass, `npm run build` thành công, verify bằng Playwright thật (spawn Butterfly, gửi lời nhắn qua Paper Boat, đặt/kéo/xoay sticker trong Journal, **reload trang thật để xác nhận sticker được lưu đúng qua save/load**) — 0 console error xuyên suốt.

# Pass 18 — Journal Decoration ✅

**Đã làm:** `JournalSystem` mở rộng `setJournalItemLayout`/`getJournalItemLayout`/`getAllJournalLayouts` (vốn là dead code trước đây, không scene nào gọi) để lưu thêm `stickerType`, thêm `removeJournalItem`/`restoreJournalLayouts`. `public/data/stickers.json` (5 loại: mây, sao, cầu vồng, hoa sương, washi tape — dùng emoji làm placeholder art, khớp phong cách hiện có). `JournalScene` có nút "🎀 Trang trí" bật/tắt chế độ chỉnh sửa: bảng palette ở dưới để thêm sticker mới, kéo-thả để di chuyển, tap-không-kéo để chọn (hiện toolbar mini ↻ xoay / ⤢ đổi cỡ / 🗑 xóa). Sticker vô hiệu hóa tương tác khi ở chế độ xem thường (tránh chặn tap vào card bên dưới). Lưu qua `SaveData.journalLayout` (Map serialize thành mảng entries, giống cách đã xử lý `memoryProgress`), autosave khi có thay đổi (`journal:layout-updated`/`journal:item-removed`).

Thêm customization vào Journal.

Items:

```text
Cloud sticker
Star sticker
Rainbow sticker
Mist flower
Washi tape
```

Player có thể:

```text
select
drag
rotate
scale
remove
```

Save layout:

```text
chapter
itemId
x
y
rotation
scale
```

Không ảnh hưởng progression.

Đây là purely cosmetic/cozy activity.

---

# Pass 19 — Butterfly Messengers ✅

**Đã làm:** Guest thứ 4 `butterfly` tái sử dụng đúng 100% kiến trúc `GuestSystem`/`EmotionSystem` (không tạo FSM riêng, đúng yêu cầu "phải reuse tối đa" bên dưới) — map 7 trạng thái narrative (WET→RESTING→DRYING→CHATTING→HAPPY) vào đúng 5 stage cảm xúc sẵn có qua các emotion ID `BUTTERFLY_*`. Treatment dùng recipe mới `gentle_breeze` (cool_breeze + rainbow_fragment). Visual "group guest": `ButterflyGuest` vẽ 3 cụm cánh nhỏ lệch vị trí/tỉ lệ thay vì 1 hình lớn, phân biệt rõ với Sun/Moon/Star. Nhân tiện sửa `GuestSystem`: gộp 5 method switch gần giống hệt nhau (đã ghi nhận là trùng lặp từ trước) thành 1 lookup table `STAGE_EMOTION_BY_GUEST`, đỡ phải sửa 5 chỗ mỗi khi thêm guest mới.

**Cập nhật (không rút gọn nữa):** cả 3 interaction trong Plan giờ có cơ chế thật riêng biệt:
- **"Cloudy → chỗ nằm mềm"**: Cloudy phát `playHappyBounce()` thật khi đàn Bướm đến — phản ứng chào đón hữu hình, không chỉ text.
- **"Gentle Breeze → hong cánh"**: recipe `gentle_breeze` qua Weather Mixer như 3 guest kia.
- **"Tap gently → nghe chuyện"**: cơ chế riêng thật — khi Bướm ở stage `BUTTERFLY_CHATTING` (muốn kể chuyện) và người chơi chạm vào lúc **không có potion sẵn** (vốn dĩ trước đây là một tap vô nghĩa, không làm gì), giờ hiện một câu chuyện ngắn (3 câu chuyện có sẵn trong `public/data/stories.json`, không lặp lại trong cùng lượt ghé) qua toast riêng — không chặn việc dùng potion thật khi đã pha xong, chỉ tận dụng khoảng tap "chết" trước đó. Đã verify toàn bộ chuỗi qua browser thật: pha 2 lần Gentle Breeze → đúng dialogue theo từng stage → chạm lần 3 → đúng story hiện ra.

**Bonus tìm thấy khi verify:** nút "CHẾ TẠO" của Weather Mixer trước đó nằm ngoài canvas (y=726 > GAME_HEIGHT=720) — không bấm được ở độ phân giải chuẩn 1280×720, ảnh hưởng luôn cả Pass 15 (Sun/Moon cũng dùng chung nút này). Đã sửa vị trí mixer, verify lại bằng browser xác nhận bấm được.

Thêm guest thứ 4:

# Đàn Bướm Đưa Tin

Khác Sun/Moon/Star vì đây là **group guest**.

Lifecycle:

```text
ARRIVING
↓
WET
↓
RESTING
↓
DRYING
↓
CHATTING
↓
HAPPY
↓
DEPARTING
```

Needs:

```text
mỏi cánh
ướt sương
cần nghỉ
muốn kể chuyện
```

Interactions:

```text
Cloudy → chỗ nằm mềm

Gentle Breeze → hong cánh

Tap gently → nghe chuyện
```

Phải reuse Guest/Emotion architecture tối đa.

Không tạo một hệ guest hoàn toàn riêng chỉ cho Butterfly.

---

# Pass 20 — Paper Boat & Wind Messages ✅

**Đã làm:** `PaperBoatSystem` mới (data-driven từ `messages.json`, 4 message có sẵn trong Plan). UI mới `PaperBoatUI` — panel dạng modal (giống pattern `DecorationShopUI`), mở qua icon "🎐" thứ 5 trên bottom nav: chọn lời nhắn → 1 nút "Gấp" bấm 3 lần (icon đổi 📄→📃→⛵ → thả) → thuyền bay tween ra khỏi panel kèm sparkle → reward. Đã lưu qua save (`paperBoatSentCount`). Xem chi tiết reward bên dưới.

**Cập nhật (không rút gọn nữa) — Reward giờ đa dạng thật, không còn chỉ 1 crystal cố định:**
- **Crystal** (happiness) — như cũ, luôn nhận.
- **Guest relationship** — mỗi lần gửi, +3 trust cho 1 guest ngẫu nhiên trong 4 guest (`GuestSystem.addTrust`, method mới) — nhỏ hơn hẳn +8 từ 1 lượt ghé thành công thật, để không thành đường tắt cày cấp (đúng nguyên tắc "Không biến thành farming mechanic"). Có toast riêng báo "Lời nhắn của bạn đã sưởi ấm lòng [Tên guest]" — đã verify guest được chọn đổi ngẫu nhiên qua nhiều lần gửi.
- **Special sparkle** — hiệu ứng 5 hạt ✨ tỏa ra quanh thuyền lúc thả vào gió, thuần hình ảnh.

Bỏ qua có chủ đích: **"small memory"** — không tạo thêm memory/content mới ở đây vì sẽ trùng lặp với hệ thống memory đã có ở Pass 16/17 (memory nên gắn với hành trình cảm xúc của guest, không nên phát ngẫu nhiên qua 1 minigame phụ) — đây là quyết định thiết kế có chủ đích, không phải bỏ sót.

Paper folding vẫn giữ nguyên "chỉ cần 3 bước tương tác" (đúng yêu cầu bên dưới, không phải origami simulator): 1 nút gấp bấm 3 lần (gấp góc 1 → gấp góc 2 → thả vào gió), không phải 3 nút riêng biệt — cách này vẫn đúng số bước tương tác (3) mà không cần dựng UI cho từng bước gấp tay.

Đây không nên chỉ là minigame phụ.

Đây có thể trở thành một **signature mechanic** của game.

Flow:

```text
Choose message
↓
Fold paper
↓
Paper boat
↓
Place into wind
↓
Boat floats away
↓
Bird / Butterfly receives it
```

Messages có thể là predefined:

```text
"Hôm nay bạn đã làm rất tốt."

"Không sao nếu bạn cần nghỉ ngơi."

"Bạn không cần phải vội."

"Mong chuyến bay của bạn thật bình yên."
```

Paper folding chỉ cần 3 bước tương tác.

Không cần origami simulator.

Reward nhẹ:

```text
small memory
sticker
guest relationship
special sparkle
```

Không biến thành farming mechanic.

Ý nghĩa design:

```text
Receive kindness
      ↓
Pass kindness onward
```

---

# PHASE 4 — WORLD PROGRESSION ✅ (2026-09-03)

**Trạng thái:** Cả 3 pass đã xong, đầy đủ không rút gọn (theo yêu cầu từ Phase 3) — 87/87 test pass, `tsc`/lint/build sạch, verify browser thật nhiều vòng. Phase này có phụ thuộc thật giữa các pass (khác Phase 3) nên làm theo đúng thứ tự: Pass 21 trước (cung cấp "Wind Garden" và chu kỳ đêm mà Pass 22 cần), rồi Pass 22, rồi Pass 23 (cần "rare guest reward" từ Pass 22).

**3 bug thật tìm thấy khi verify bằng browser** (không phải suy đoán — đúng tinh thần "Visible ≠ Interactive" trong Plan):
1. Quên lọc rare guest khỏi vòng spawn ngẫu nhiên — Aurora/Comet spawn như guest thường, phá vỡ toàn bộ thiết kế "phải tạo điều kiện mới gặp được". Đã sửa (`spawnRandomGuest` giờ lọc `!def.rare`).
2. Mua hình dạng Cloudy mới không tự mặc — phải bấm 2 lần (mua, rồi mặc). Đã sửa để mua xong mặc luôn.
3. Guest thường có thể "cướp chỗ" của rare guest do đua với timer spawn 3s — thêm guard tạm dừng random spawn khi đang có rare guest chờ mời, và check ngay khi guest rời đi thay vì chỉ dựa vào poll 2s.

# Pass 21 — Station Expansion ✅

**Đã làm:** `StationAreaSystem` mới (data-driven `areas.json`, 5 khu vực đúng theo Plan, unlock bằng crystal như `DecorationSystem`). "Decoration slots" của mỗi khu vực triển khai cụ thể: 4/5 decoration cũ (Pass 8) giờ có `requiredAreaId` — chỉ mua được sau khi mở khu tương ứng (VD: Wind Pinwheel cần Wind Pinwheel Garden). "Ambient interactions": mỗi khu có hiệu ứng nền riêng khi mở (khói trà, chong chóng quay, sao lấp lánh, mưa rơi — Graphics + tween, không cần asset mới). Thêm `DayNightSystem` (toggle thủ công, không phải đồng hồ thời gian thực — giữ đúng nguyên tắc "không tạo áp lực chờ đợi") làm điều kiện "night station" cho Aurora, mở khóa cùng Stargazing Corner.

Trạm không nên chỉ là một màn hình có nhiều decoration.

Nó phải phát triển dần.

Progression ví dụ:

```text
Small Floating Cloud
↓
Morning Dew Tea Corner
↓
Wind Pinwheel Garden
↓
Stargazing Corner
↓
Rain Garden
```

Không hiển thị kiểu:

```text
Station Level 4
```

Mỗi area unlock:

```text
decoration slots
ambient interactions
new guest conditions
rare guest conditions
new photo moments
```

Không biến thành city builder.

---

# Pass 22 — Rare Guest System ✅

**Đã làm:** `RareGuestSystem` mới — pure logic, không tự spawn gì cả, chỉ trả về điều kiện đã đủ hay chưa (`isAuroraAvailable`/`isCometAvailable`), khớp đúng cả 4 điều kiện Aurora (moon trustLevel≥40, đêm, Wind Chime, moon_memory_3) và cả 2 điều kiện Comet (star_memory_4, Wind Garden). Aurora/Comet là guest thứ 5/6 trong `guests.json`, tái sử dụng 100% GuestSystem/EmotionSystem (đúng kiến trúc, không FSM riêng) nhưng đánh dấu `rare: true` để loại khỏi vòng spawn ngẫu nhiên. `StationScene` poll điều kiện mỗi 2s, hiện icon "✨ Một vị khách hiếm đang đến gần..." khi đủ điều kiện và không có guest hiện tại — bấm vào mới thật sự mời (`guestSystem.spawn`), đúng tinh thần "người chơi tạo ra điều kiện, rồi chủ động mời" thay vì tự động ập tới.

Mỗi rare guest có đủ: arrival + 1 emotional need (5 stage riêng: DIM→RADIANT cho Aurora, FADING→BRILLIANT cho Comet) + 1 interaction (recipe riêng: Aurora Veil, Comet Trail) + 1 Photo Moment + 1 Journal memory + đóng vai trò "rare reward" cho Pass 23. Đã verify bằng browser thật toàn bộ chuỗi Comet: mở Wind Garden → capture photo Little Star → indicator hiện đúng lúc → bấm mời → Sao Chổi spawn đúng dialogue.

Rare Guest không xuất hiện hoàn toàn random.

Phải xuất hiện do **người chơi tạo ra điều kiện phù hợp**.

## Aurora

Ví dụ condition:

```text
Moon trust cao
+
night station
+
Wind Chime
+
enough Moon memories
```

## Comet

Ví dụ:

```text
Little Star emotional resolution
+
Wind Garden unlocked
+
star-related memories
```

Mỗi rare guest MVP cần:

```text
arrival
one emotional need
one interaction
one Photo Moment
one Journal memory
one rare reward
```

Rare Guest phải tạo cảm giác:

> “Mình đã tạo ra một nơi đủ đặc biệt để nhân vật này ghé tới.”

---

# Pass 23 — Cloudy Cosmetics ✅

**Đã làm:** `src/entities/CloudyShapes.ts` — mỗi shape chỉ là một hàm sinh `Point[]` khác nhau (blob wobble cho default/cotton_candy với tham số khác nhau, công thức heart curve cho heart) rồi đưa cùng vào `SoftBodyMesh` sẵn có — đúng yêu cầu "không viết HeartCloudPhysics/CottonCandyPhysics riêng". `Cloudy.ts` thêm `setShape()`/`setAccessories()` để đổi trực tiếp không cần tạo lại scene. `CloudyCosmeticsSystem` map đủ cả 4 nguồn unlock trong Plan — không bỏ sót cái nào:
- **Happiness**: mua Heart Cloud bằng crystal (💎8)
- **Memory milestone**: bất kỳ guest nào unlock memory cuối (resolution) → tự mở Cotton Candy Cloud
- **Guest relationship**: bất kỳ guest nào đạt trustLevel≥40 → tự mở Sunset Hat
- **Rare guest reward**: capture photo Aurora → Rainbow Ribbon; capture photo Comet → Star Clip

UI `CloudyCosmeticsShopUI` cho chọn shape (mua xong mặc luôn, đã sửa sau khi phát hiện bug ở trên) và bật/tắt phụ kiện. Đã verify bằng browser: mua Heart Cloud → Cloudy đổi hình thật, toast báo mở khóa, hình dạng giữ nguyên qua các lượt guest đến/đi.

Customization cho Mây Bông.

## Shapes

```text
Default Cloud
Heart Cloud
Cotton Candy Cloud
```

## Accessories

```text
Sunset Hat
Tiny Star Clip
Rainbow Ribbon
```

Cosmetics:

```text
no stats
no power
no gacha
```

Unlock bằng:

```text
Happiness
Memory milestone
Guest relationship
Rare guest reward
```

Soft physics phải reuse cùng implementation.

Không viết:

```text
HeartCloudPhysics
CottonCandyPhysics
DefaultCloudPhysics
```

Shape geometry nên configurable.

---

# PHASE 5 — PRESENTATION & GAME FEEL ✅ (2026-09-03)

**Trạng thái:** Cả 3 pass xong. Khác Phase 3/4 ở chỗ đây là polish/architecture, không phải tính năng mới — "hoàn thiện" ở đây nghĩa là review + cải thiện thật (Pass 25), không phải thêm mechanic. 93/93 test pass, `tsc`/lint/build sạch, verify browser qua nhiều vòng (âm thanh không chụp màn hình được nên verify bằng: không có console error xuyên suốt toàn bộ luồng tương tác mới, và UI slider phản hồi đúng khi kéo).

# Pass 24 — Audio & Ambience ✅

**Đã làm:** `AudioSystem` viết lại theo đúng kiến trúc bus MASTER→{MUSIC, AMBIENCE, SFX} như Plan yêu cầu — mỗi bus có GainNode và volume riêng, mute là thao tác đưa master gain về 0 (không phải chặn tạo AudioContext, để ambience giữ được trạng thái xuyên suốt lúc tắt/bật tiếng). Thêm 4 SFX còn thiếu so với danh sách Plan: "star polishing" (vuốt Bé Sao, có throttle 180ms để không spam), "journal page" (lật thẻ), "paper boat" fold/release. Ambient: gió nhẹ luôn bật (noise buffer lowpass, không cần asset), cộng thêm lớp theo ngữ cảnh — đêm (drone trầm), Wind Garden mở khóa (chuông gió ngẫu nhiên mỗi 4-9s), Rain Garden mở khóa (noise bandpass) — tất cả fade in/out qua `setAmbienceContext()`, gọi lại mỗi khi khu vực mở hoặc ngày/đêm đổi. UI mới `AudioSettingsUI` — 4 thanh trượt kéo được (Tổng/Nhạc nền/Không gian/Hiệu ứng) + nút mute, mở qua icon "⚙️" cạnh nút loa cũ.

Music bus có volume control như Plan yêu cầu nhưng chưa phát nhạc nào — không có track nhạc để gắn vào, và tự soạn nhạc nằm ngoài phạm vi hợp lý ở đây; bus đã sẵn sàng nhận track khi có.

Hiện Web Audio tone chỉ đủ chứng minh cơ chế.

Production architecture cần:

```text
MASTER
├── MUSIC
├── AMBIENCE
└── SFX
```

Settings:

```text
Master volume
Music volume
Ambience volume
SFX volume
Mute
```

Ambient:

```text
gentle wind
soft atmosphere
distant wind chimes
```

Contextual:

```text
Rain → drizzle ambience

Night → night ambience

Wind Garden → wind chimes
```

SFX:

```text
ingredient
mixer
crystal
star polishing
journal page
photo
decoration
paper boat
```

Nếu chưa có production audio asset:

không tải asset copyrighted.

Chỉ xây architecture + hooks.

---

# Pass 25 — Full Game Feel Polish ✅

**Đã làm — review có hệ thống, sửa đúng chỗ thiếu thật (không phải rải rác cho đủ số):**
- **Guest (Sun/Moon/Star/Butterfly/Aurora/Comet)**: phát hiện input→result thiếu hẳn bước "immediate feedback" — chạm vào guest trước đây không có phản hồi gì cho tới khi emotion thật sự đổi (có thể không đổi nếu chưa đúng potion). Thêm squash nhẹ ngay lúc chạm, ở `Guest.ts` base class nên áp dụng cho tất cả guest cùng lúc.
- **Ingredient**: phát hiện gap nghiêm trọng nhất — thả nguyên liệu vào mixer hoặc túi đồ trước đây `destroy()` ngay lập tức, không animation nào cả. Thêm `playLanded()` (pop + fade) trước khi hủy.
- **Inventory**: số lượng đổi chỉ `setText()` thẳng, trong khi `CrystalCounter` (cùng chức năng, khác UI) đã có sẵn hiệu ứng nảy — sửa cho nhất quán.
- **Paper Boat**: mỗi bước gấp trước đây chỉ đổi text/icon, không chuyển động — thêm pop nhẹ mỗi lần bấm gấp.
- **Sticker (Journal)**: đặt sticker mới từ palette xuất hiện tức thì — thêm pop-in (Back.easeOut), tách biệt với việc tải sticker đã lưu (không animate lại mỗi lần mở trang).

**Đã rà nhưng thấy đã đủ tốt, không sửa:** Cloudy (đã có squish chạm + blink + bounce), Mixer (đã có craft success bounce/fail shake), Crystal/Photo Moment (đã có entrance + sparkle/pulse + capture flash) — không thêm hiệu ứng chồng lên hiệu ứng đã ổn, đúng nguyên tắc "Subtle > Flashy" bên dưới.

Không thêm feature mới.

Review tất cả interaction theo:

```text
INPUT
↓
IMMEDIATE FEEDBACK
↓
ANIMATION
↓
AUDIO
↓
RESULT
```

Review:

```text
Cloudy
Ingredient
Inventory
Mixer
Weather
Sun
Moon
Star
Butterflies
Paper Boat
Crystal
Decoration
Journal
Sticker
Photo Moment
```

Improve:

```text
easing
timing
squash/stretch
spring
anticipation
follow-through
particles
audio feedback
```

Rule:

```text
Subtle > Flashy
```

Game này không được reward spam.

---

# Pass 26 — Visual Asset Pipeline ✅

**Đã làm:** `src/core/AssetRegistry.ts` mới — điểm swap art duy nhất trong toàn bộ codebase. `emotionIdToAssetKey('SUN_STRESSED')` → `'guest.sun.stressed'` (khớp chính xác ví dụ trong Plan), tương tự cho decoration/cloudy shape. `REGISTERED_ASSETS` hiện rỗng nên mọi lookup fallback về vẽ procedural như cũ — **không có gì thay đổi về mặt hình ảnh hôm nay**, đã verify bằng browser (spawn cả 6 loại guest + decoration sau khi refactor, render giống hệt trước). `Guest.ts` (class cha dùng chung 6 guest) và `Decoration.ts` đã wire qua registry: nếu sau này có texture thật đã preload đúng key, code tự động vẽ ảnh thay vì Graphics — không cần sửa gì ở `EmotionSystem`/`GuestSystem`/subclass nào, đúng yêu cầu "EmotionSystem chỉ biết STRESSED, không biết tên file".

**Ngoại lệ có chủ đích:** hình dạng Cloudy (Pass 23) không đi qua registry — silhouette của nó LÀ output sống của SoftBodyMesh (vật lý biến dạng theo tay kéo), không phải ảnh tĩnh theo trạng thái như Guest/Decoration, nên thay bằng texture tĩnh sẽ mất luôn hiệu ứng vật lý là điểm cốt lõi của Pass 2/23. Đã ghi chú rõ trong code (`Cloudy.ts`) và giữ `cloudyShapeIdToAssetKey` chỉ để đặt tên nhất quán cho phụ kiện/overlay tương lai, không dùng để render silhouette.

Không yêu cầu Claude tự biến placeholder thành artwork production.

Claude chỉ chuẩn bị architecture để **thay art dễ dàng sau này**.

Ví dụ asset keys:

```text
guest.sun.stressed
guest.sun.calm
guest.sun.relaxed
guest.sun.happy

guest.moon.lonely
guest.moon.relaxed

cloudy.default
cloudy.heart

decoration.windChime
```

Architecture:

```text
Gameplay Logic
      ↓
Presentation
      ↓
Asset Config
      ↓
PNG / WebP / SpriteSheet
```

Không để `EmotionSystem` biết:

```text
sun-stressed.png
```

Nó chỉ biết:

```text
STRESSED
```

Presentation layer quyết định asset.

Điều này cực kỳ quan trọng khi sau này thay toàn bộ placeholder art bằng hand-drawn assets.

---

# PHASE 6 — BALANCE & PLATFORM

# Pass 27 — Content & Economy Balancing + Cozy Pacing

**Cập nhật (2026-09-03, sau thảo luận về Pass 32-40 đề xuất):** Quyết định không tạo pass "Retention Balancing" riêng — dễ dẫn tư duy daily-reward/streak/FOMO, đi ngược triết lý cozy của chính game này. Pacing/retention concern gộp thẳng vào Pass 27 dưới đây, dưới tên "Cozy Pacing" thay vì "Retention".

**✅ Đã làm — Paper Boat rework (2026-09-03):** thay vì thêm cooldown (chỉ sửa con số, không sửa thiết kế), đã thiết kế lại đúng chiều "Receive kindness ↓ Pass kindness onward" mà bản thân Pass 20 gốc đã đề ra nhưng chưa từng thực sự có chiều "receive". `PaperBoatSystem` giờ có state machine 2 bước:

```text
guest:relaxed (dỗ khách thành công thật)
        ↓
1 lời nhắn "đến" (incoming) — ngẫu nhiên từ cùng pool 4 message
        ↓
người chơi đọc + bấm "Cảm ơn — giờ mình sẽ gửi..." (acknowledgeIncoming)
        ↓
canSend = true → mở khóa luồng gấp thuyền → gửi (send)
        ↓
canSend = false, incoming = null — không gửi lại được nữa
        ↓
phải chờ guest:relaxed tiếp theo mới có lời nhắn mới
```

Không có timer, không có "chờ X phút" hiển thị cho người chơi — nhịp độ hoàn toàn gắn vào core loop dỗ khách thật (guest:relaxed là event đã tồn tại sẵn, dùng chung với lúc Happiness Crystal xuất hiện). `PaperBoatUI` có 3 trạng thái hiển thị riêng: rỗng ("Gió đang lặng... hãy tiếp tục chăm sóc các vị khách"), đang có lời nhắn đến (đọc trước khi được gửi), và luồng gửi bình thường (chọn/gấp/thả) — chỉ hiện khi đã đọc lời nhắn đến. Đã verify bằng browser thật đủ 3 trạng thái + xác nhận **không thể gửi lại ngay sau khi vừa gửi** (đúng phát hiện exploit ban đầu). Save schema đổi từ `paperBoatSentCount: number` sang `paperBoat: {sentCount, incomingMessageId, canSend}` để giữ nguyên trạng thái đang chờ qua các lần reload. 98/98 test pass.

Review (2026-09-03, đọc trực tiếp số liệu trong `public/data/*.json` + code, không đoán):

```text
Happiness income      — 1 crystal/lần, nhưng HappinessCrystal chỉ xuất hiện sau khi dỗ
                         khách THÀNH CÔNG thật (không phải theo thời gian) — tự giới hạn
                         bởi chính kỹ năng chăm sóc khách, không thể cày nhanh hơn việc chơi.
Decoration prices      — 1-2 crystal/món (rẻ), 4/5 món còn khoá thêm bởi requiredAreaId
                         (phải mở khu vực tương ứng trước) — giá tiền không phải cổng
                         chính, việc mở khu vực mới là cổng chính.
Cosmetic prices        — chỉ 1/8 món cosmetic (hình "Trái Tim", 8 crystal) mua bằng
                         crystal; 7 món còn lại đến từ memory milestone, guest trust
                         (≥40), hoặc rare-guest photo reward — tức phần lớn cosmetic
                         KHÔNG nằm trong vòng lặp currency-grind, mà nằm trong vòng lặp
                         chăm sóc/quan hệ — đúng tinh thần "expression, không phải
                         progression" mà Post-MVP checkpoint đã đặt ra.
Station expansion costs— 0 → 5 → 10 → 15 → 20 crystal, tuyến tính không phải cấp số
                         nhân — không có việc giá sau "trừng phạt" người chơi đi chậm.
Ingredient spawn rate  — mỗi 4s, tối đa 4 nguyên liệu nổi cùng lúc — luôn có việc để làm
                         nhưng không dồn dập/rối mắt.
Guest visit pacing     — mỗi 3s kiểm tra, khách mới xuất hiện gần như ngay khi khách cũ
                         rời đi (guard: không có khách hiện tại + không đang chờ rare
                         guest) — không có khoảng chờ nhân tạo giữa 2 lượt khách.
Rare guest conditions  — Aurora/Comet đều khoá bởi TỔ HỢP nhiều điều kiện thật (trust
                         cao + khu vực + trang trí + memory đã mở + ngày/đêm) chứ không
                         phải 1 con số để cày — RareGuestSystem chỉ kiểm tra điều kiện,
                         không tự spawn, người chơi phải chủ động "mời".
Memory unlock pacing   — mỗi chapter tăng dần cả requiredVisitCount (1→2→4→...) lẫn
                         requiredTrustLevel (0→8→...) — đòi hỏi nhiều lượt chăm sóc
                         thành công thật, không thể unlock bằng cách chờ hay spam.
Paper Boat reward/freq — đã xử lý ở trên (state machine receive→send, không cooldown).
```

**Kết luận:** không tìm thấy điểm nào trong hệ thống hiện tại cho phép "cày" (lặp hành động vô nghĩa để lấy thưởng) — hầu hết mọi phần thưởng đều khoá sau một tương tác chăm sóc thật (dỗ khách thành công, giữ trust, mở khu vực), không khoá sau thời gian chờ. Điểm duy nhất từng có lỗ hổng thật (Paper Boat gửi liên tục) đã được sửa ở mục trên. Không cần chỉnh số nào thêm ở Pass này.

Không để grind.

Không có:

```text
energy timer
daily streak pressure
mandatory login rewards
artificial waiting
aggressive retention
```

Cozy player phải cảm thấy:

> “Mình chơi vì muốn ở đây.”

không phải:

> “Mình phải login để không mất reward.”

**Cozy Pacing** (phần mở rộng của Pass 27, thay cho 1 pass "Retention" riêng): kiểm tra guest frequency, ingredient frequency, crystal income, decoration cost, memory unlock pacing, rare event frequency, session length — nhưng mục tiêu luôn là "không ép chơi, không ép quay lại", không phải tối ưu hóa engagement. **✅ Đã review (2026-09-03)** — xem bảng số liệu cụ thể + kết luận ở phần "Review" phía trên: không có cổng nào dựa trên thời gian chờ nhân tạo, mọi pacing đều bám theo nhịp chăm sóc khách thật.

---

# Pass 28 — Mobile & Touch QA

**✅ Đã làm (2026-09-03):**

Trước khi test, review code cho toàn bộ input/drag: grep hết `setInteractive`/`pointermove`/`pointerdown` trong `src/` — xác nhận **không có nơi nào** tự làm toán tọa độ tay (không `clientX/clientY`, không `getBoundingClientRect`, không `window.innerWidth/Height` ở bất kỳ file gameplay nào). Mọi drag (`Cloudy`, `FloatingIngredient`, sticker trong `JournalScene`, slider trong `AudioSettingsUI`) đều dùng `pointer.x`/`pointer.worldX` do chính Phaser cung cấp — tọa độ này đã được Phaser's Scale Manager quy đổi qua FIT-scale + letterbox tự động. Đây là điểm khởi đầu tốt: rủi ro chính không phải "code tự tính sai tọa độ" mà là "có hit-area nào bị lệch trong thực tế không".

Test bằng Playwright thật (không chỉ screenshot) trên 5 viewport:

```text
1920×1080        (desktop, mouse)
1366×768         (laptop, mouse)
1024×768         (tablet landscape, hasTouch)
926×428          (phone lớn, ngang, hasTouch)
667×375          (phone nhỏ, ngang, hasTouch — gần đúng tỉ lệ 16:9 nên gần như không letterbox)
```

Chuỗi tương tác thật cho mỗi viewport: spawn khách (phím debug) → tap khách → spawn ingredient → **kéo-thả ingredient vào bát trộn** → tap nút CHẾ TẠO → mở/đóng shop trang trí → mở Journal → bật edit mode → đặt sticker → **kéo sticker** → quay lại StationScene → chạm vào Mây Bông. Toàn bộ 5 viewport: **0 console/page error**.

**Phát hiện quan trọng khi test (không phải bug code):** viewport có `hasTouch:true`, dùng `page.mouse.*` (chuột giả lập) để "kéo" không phản ánh đúng touch input thật — với các context này phải dùng touch event thật (`Input.dispatchTouchEvent` qua CDP: touchstart/touchmove/touchend) mới đúng con đường mà Phaser InputManager xử lý trên thiết bị cảm ứng thật. Sau khi đổi sang touch event thật, toàn bộ hit-area (bát trộn, khách, sticker, nút nav) đều nhận đúng ở cả 3 kích thước cảm ứng — xác nhận code không hề có vấn đề coordinate-mapping.

**Cloudy không phải "kéo đổi vị trí"** — đọc `Cloudy.ts` mới phát hiện: chạm/kéo Cloudy chỉ gọi `applyPointerInfluence` để biến dạng mesh (squish phản ứng mềm), container `x,y` không bao giờ đổi — đây là thiết kế đúng ("mềm, phản ứng khi chạm" chứ không phải "kéo đi chỗ khác"), không phải bug.

**Giới hạn đã biết, ghi lại có chủ đích:** khi script test dồn 3 cử chỉ touch liên tiếp qua CDP quá nhanh (vd. kéo Cloudy → thả ingredient ngay sau, cách nhau ~200ms), thỉnh thoảng cử chỉ sau bị bỏ lỡ không xác định — lặp lại cùng chuỗi nhiều lần cho cùng 1 viewport cho kết quả khác nhau (khi thì qua khi thì không), và không có state dùng chung nào trong `Guest.ts`/`Cloudy.ts`/`FloatingIngredient.ts` giải thích được hiện tượng này (đã đọc kỹ, mỗi entity tự quản lý flag `dragging` riêng). Kết luận: đây là giới hạn của việc giả lập touch qua CDP dồn dập bằng script (không giống nhịp chạm thật của ngón tay người), **không phải bug của game** — khi giãn cách cử chỉ ra tự nhiên hơn (~300-800ms, đúng nhịp một người thật thao tác) thì luôn thành công. Khuyến nghị: trước khi phát hành thật, nên có thêm 1 lượt test tay trên thiết bị cảm ứng thật (không chỉ tự động hoá) để loại trừ hoàn toàn khả năng đây là vấn đề thật — nhưng dựa trên code review + phần lớn kết quả tự động, khả năng cao đây chỉ là nhiễu công cụ test.

Không có source code nào bị sửa ở Pass này — toàn bộ là QA/verification. `tsc`/`vitest` (105/105)/`lint`/`build` không đổi so với Pass 29/30.

Test production build thật.

Viewports:

```text
1920×1080
1366×768
tablet landscape
large phone landscape
small phone landscape
```

Test bằng actual interaction:

```text
Cloudy drag
Ingredient drag
Inventory
Mixer
Star rubbing
Sticker placement
Paper folding
Decoration
Journal
Navigation
```

Đặc biệt kiểm tra:

```text
Phaser Container hit areas
pointer → local coordinate
camera transform
scale transform
responsive resize
safe area
orientation
browser gestures
```

Rule:

```text
Screenshot đúng
≠
interaction đúng
```

---

# Pass 29 — YouTube Playables Integration

**✅ Đã làm (2026-09-03):** Đã xây kiến trúc `PlatformAdapter` đúng như mô tả bên dưới, dựa trên SDK thật đã verify qua tài liệu chính thức (`https://developers.google.com/youtube/gaming/playables/reference/getting_started`) — không đoán API.

Files mới:

```text
src/services/platform/PlatformAdapter.ts              — interface
src/services/platform/BrowserPlatformAdapter.ts        — no-op/Web API fallback, dùng khi không phải Playables
src/services/platform/YouTubePlayablesPlatformAdapter.ts — bọc window.ytgame.*
src/services/platform/createPlatformAdapter.ts          — isPlayablesEnvironment() + createPlatformAdapter()
src/core/Platform.ts                                    — singleton accessor (initPlatformAdapter/getPlatformAdapter, giống pattern GameSystems.ts)
src/services/save/YouTubePlayablesSaveProvider.ts        — loadData/saveData, tái dùng normalizeSaveData() của Pass 30
src/types/ytgame.d.ts                                    — ambient type cho window.ytgame
```

`isPlayablesEnvironment()` kiểm tra `window.ytgame?.IN_PLAYABLES_ENV` — mọi build bình thường (dev, itch.io, GitHub Pages...) đều rơi vào `BrowserPlatformAdapter`, hành vi y hệt trước Pass 29 (không có gì phá vỡ khi không nhúng trong YouTube). SDK script (`https://www.youtube.com/game_api/v1`) **không** được thêm vào `index.html` dùng chung — chỉ nên có ở bản build riêng cho YouTube Playables; code phía adapter luôn optional-chain `window.ytgame` nên an toàn dù script có mặt hay không.

Wiring:

```text
src/core/Game.ts
  → initPlatformAdapter() ngay khi tạo game
  → Phaser.Core.Events.POST_RENDER  → platform.signalFirstFrameReady()
  → platform.onPause()  → game.loop.sleep() + saveNow() best-effort (nếu systems đã init)
  → platform.onResume() → game.loop.wake()

src/scenes/PreloadScene.ts
  → chọn SaveProvider theo platform.isPlayablesEnv (Local hoặc YouTubePlayables)
  → đồng bộ AudioSystem.setMuted() theo platform.isAudioEnabled() lúc khởi động
  → subscribe platform.onAudioEnabledChange() để đồng bộ tiếp khi người dùng đổi ở ngoài game (YouTube UI)
  → platform.signalGameReady() ngay trước khi start StationScene
```

`StationScene` và mọi gameplay code khác **không** import SDK hay `PlatformAdapter` — đúng yêu cầu, chỉ 2 file bootstrap (`Game.ts`, `PreloadScene.ts`) chạm vào abstraction này.

Verify: `tsc`/`vitest` (105/105)/`lint`/`build` sạch. Playwright thật trên `BrowserPlatformAdapter` path (môi trường duy nhất test được lúc này) xác nhận game vẫn boot và render StationScene bình thường, không console error — đúng kỳ vọng "no-op cho browser thường". Chưa test được nhánh `YouTubePlayablesPlatformAdapter` thật vì không có môi trường nhúng YouTube Playables thật để chạy — đây là giới hạn đã biết, ghi lại có chủ đích thay vì giả vờ đã verify.

Nếu mục tiêu phát hành vẫn là YouTube Playables thì đây là pass riêng.

Architecture:

```text
PlatformAdapter
      │
      ├── Browser
      └── YouTube Playables
```

Save:

```text
SaveProvider
├── LocalSaveProvider
└── YouTubePlayablesSaveProvider
```

Implement integration points:

```text
SDK loading
firstFrameReady
gameReady

loadData
saveData

pause
resume

audio mute state

language hook

platform lifecycle
```

Không để gameplay code gọi trực tiếp YouTube SDK.

Ví dụ không nên:

```ts
youtube.saveData(...)
```

từ `StationScene`.

Phải:

```text
StationScene
↓
SaveSystem
↓
SaveProvider
↓
YouTubePlayablesSaveProvider
```

Audit:

```text
bundle
startup
cloud save size
local fallback
platform errors
```

---

# Pass 30 — Save Migration & Robustness

**✅ Đã làm (2026-09-03):** Tạo `src/services/save/saveMigration.ts` với hàm thuần `normalizeSaveData(raw: unknown): SaveData` — không phụ thuộc Phaser, không phụ thuộc provider cụ thể, dùng chung được cho cả `LocalSaveProvider` và `YouTubePlayablesSaveProvider` (Pass 29). Hàm này luôn trả về một `SaveData` đầy đủ field, bất kể input là gì:

```text
null / undefined           → toàn bộ default
string / number / array    → toàn bộ default (không phải object hợp lệ)
object thiếu field         → field thiếu được điền default riêng lẻ
object có field sai kiểu   → field đó bị bỏ, dùng default (không propagate rác)
object có version tương lai → luôn stamp lại CURRENT_VERSION = 1 hiện tại
object hợp lệ đầy đủ       → giữ nguyên, không đổi field nào
```

Từng sub-field lồng nhau (guestProgress theo từng guest, paperBoat, cloudyCosmetics, journalLayout) đều có hàm normalize riêng — một guest bị hỏng không kéo hỏng cả object `guestProgress`. Hiện tại toàn bộ save mới chỉ có version 1 (chưa có breaking schema change thật nào xảy ra) — comment trong code đã ghi rõ chỗ để thêm transform step theo `raw.version` nếu sau này version 2 thật sự cần đổi shape dữ liệu (không chỉ điền default).

`LocalSaveProvider.load()` gọi `normalizeSaveData(JSON.parse(raw))` bên trong cùng khối `try/catch` đã có sẵn cho JSON hỏng — vậy JSON hỏng lẫn schema hỏng đều rơi về "coi như chưa có save" thay vì crash boot. `save()` giữ nguyên try/catch best-effort đã có từ trước cho quota/storage failure.

Test: `src/services/save/saveMigration.test.ts` — 7 test bao phủ toàn bộ bảng trên (kể cả field lồng sai kiểu như `paperBoat: {sentCount: 'four', canSend: 'true'}`, và guest entry không phải object). Full suite: **105/105 pass**, `tsc`/`lint`/`build` sạch.

Đến lúc này SaveData đã gần ổn định.

Mới formalize migration.

Ví dụ:

```text
MVP save
v1
 ↓
Production save
v2
```

Save mới chứa thêm:

```text
inventory
memories
journal stickers
station expansion
rare guests
Cloudy cosmetics
audio settings
paper messages
```

Test:

```text
old save
→ new build
→ migration
→ no lost progression
```

Ngoài ra test:

```text
missing fields
corrupted JSON
partial save
invalid values
future version
quota/storage failure
```

SaveSystem phải fail gracefully.

Không để corrupted save làm game crash boot.

---

# Bổ sung sau Phase 6 — Sổ Công Thức (Recipe Book)

**✅ Đã làm (2026-09-03):** phát hiện thực tế khi chơi thử — lời gợi ý của khách chỉ nói **tên món** cần pha (vd. "hãy pha một ly Cool Drizzle"), nhưng không có chỗ nào trong game nói rõ **2 nguyên liệu nào** tạo ra món đó. Người chơi buộc phải đoán mò giữa 5 loại nguyên liệu. Đây là khoảng trống legibility thật, không phải thiết kế "khám phá" có chủ đích.

Xử lý bằng cách thêm nút "📖" nhỏ ngay phía trên bát trộn (đúng chỗ người chơi đang nhìn khi phân vân) — bấm vào mở panel "Sổ Công Thức" liệt kê cả 5 công thức: tên món, khách phù hợp, và 2 nguyên liệu cần (vừa chấm màu khớp màu nguyên liệu nổi ngoài màn hình, vừa tên chữ) — không cần điều hướng qua Journal hay menu khác.

Files:

```text
src/systems/WeatherSystem.ts   — thêm getAllRecipes()
src/ui/RecipeBookUI.ts         — panel mới, theo đúng pattern PaperBoatUI/DecorationShopUI (Container toggle/hide)
src/scenes/StationScene.ts     — instantiate + nút 📖 phía trên bát trộn (drawRecipeBookButton)
```

Không phá nhịp khám phá lần đầu — sổ công thức phải chủ động mở ra xem (không tự động hiện), giữ đúng tinh thần "gợi ý khi cần, không nhồi nhét" của Pass 27. `tsc`/`vitest` (105/105)/`lint` sạch, verify browser thật xác nhận mở/đóng panel đúng, hiển thị đủ 5 công thức, không console error.

---

# PHASE 7 — RELEASE QA

# Pass 31 — Full Production QA

Đây là gate cuối.

Không thêm feature.

Chạy:

```text
npm test
npm run lint
npm run build
```

Sau đó actual production gameplay test.

Regression MVP:

```text
Start
↓
Cloudy
↓
Guest
↓
Ingredients
↓
Craft
↓
Soothe
↓
Crystal
↓
Decoration
↓
Photo
↓
Journal
↓
Save
↓
Reload
```

Expanded loop:

```text
Guest
↓
Relationship
↓
Emotional progression
↓
Multiple memories
↓
Journal decoration
↓
Station expansion
↓
Rare guest
↓
Cloudy customization
```

Social/cozy loop:

```text
Butterflies
↓
Paper message
↓
Wind
↓
Recipient
```

Platform:

```text
desktop
mobile
YouTube Playables
```

Final QA phải kiểm tra actual pointer interactions.

Không được kết luận:

```text
tests pass
→ game done
```

mà phải:

```text
tests pass
+
build pass
+
manual interaction pass
+
save/reload pass
+
platform pass
=
release candidate
```

---

# PRODUCT DIRECTION CHECKPOINT (2026-09-03)

Trước khi vào bất kỳ pass Post-MVP nào bên dưới — checkpoint này **không code**, chỉ xác định hướng, quyết định bởi người dùng sau khi thảo luận về đề xuất mở rộng roadmap (Pass 32-40) từ một nhận xét bên ngoài.

```text
Core fantasy:
"I want to create a place where everyone can rest."

Core loop:
Guest → Understand → Soothe → Remember

Long-term:
Relationships → Memories → World → Story

Tone:
Warm / Quiet / Safe / Empathetic

Never:
Score
HP
Lose state
Energy
Streak
Aggressive FOMO
Forced monetization
```

Mỗi feature mới từ đây trở đi phải trả lời được câu hỏi:

> **Feature này làm người chơi cảm thấy mình đang xây dựng một nơi để nghỉ ngơi tốt hơn, hay chỉ khiến họ có thêm thứ để grind?**

Nếu là vế 2 → bỏ.

Nguyên tắc bao trùm: đừng để việc thêm pass mới làm game phình thành "nhiều hệ thống để giữ chân người chơi". Nền móng hiện tại đã rõ: **guest → empathy → interaction → memory → world-building**. Mọi mở rộng sau này nên làm vòng lặp đó **sâu hơn**, không phải **nhiều hơn**.

---

# POST-MVP (sau Pass 31, chưa bắt đầu code)

Danh sách này thay thế đề xuất "Pass 32-40" ban đầu — đã bỏ bớt/gộp/hoãn theo Product Direction Checkpoint ở trên. Ưu tiên: **P0 = nên làm, P1 = nghiên cứu sau, P2 = chưa quyết, Không cần = đã loại bỏ.**

| Việc | Đánh giá | Ưu tiên |
| --- | --- | --- |
| Cloudy's Origin Story | Gắn kết toàn bộ mechanic đã có lại với nhau | **P0** |
| Rare Weather Events | Tái dùng gần như nguyên vẹn pattern của `RareGuestSystem` | **P0** |
| Sky Archive | Chỉ là 1 màn hình UI tổng hợp dữ liệu đã có, không cần hệ thống mới | **P0** |
| World Memory / Story Integration | Mở rộng Journal/Memory hiện tại, không tạo hệ thống song song | **P1** |
| Async Paper Boat (multiplayer thật) | Ý tưởng rất hay nhưng đổi hẳn tầng kiến trúc (cần backend) | **P1**, tách thành Future Experiment riêng |
| Monetization | Product decision, chưa xác định game này có thương mại hóa hay không | **P2 — chưa quyết** |
| "Retention Balancing" (pass riêng) | Dễ mâu thuẫn với triết lý cozy — đã gộp vào Pass 27 thay vì tách riêng | **Không cần** |

## Pass 32 — Cloudy's Origin Story (P0, creative design trước, code sau)

**Chưa bắt đầu — đang chờ trả lời các câu hỏi sáng tạo sau (Claude không tự bịa mythology):**

```text
Cloudy là ai?
Cloudy sinh ra từ đâu?
Ai xây trạm?
Vì sao người chủ cũ rời đi?
Cloudy có biết quá khứ của mình không?
Người chơi biết câu chuyện ngay từ đầu hay khám phá dần?
Kết thúc câu chuyện là gì?
```

Cách kể ưu tiên (đã quyết): không cutscene dài, không exposition trực tiếp —

```text
Memory Fragment
    ↓
Journal
    ↓
hình ảnh / câu ngắn
    ↓
người chơi tự ghép câu chuyện
```

Lý do làm pass này: hiện mỗi guest đã có story arc riêng (Guest → emotional story → memories → journal), nhưng Cloudy — nhân vật trung tâm mà người chơi gắn bó nhất — thì chưa có câu chuyện của chính mình. Đây là câu hỏi "vì sao người chơi muốn tiếp tục chăm trạm này", không chỉ là thêm lore.

## Pass 33 — World Memory / Story Integration (P1)

Không tạo `MemoryFragmentSystem` độc lập (sẽ trùng lặp với Journal/PhotoMoment/Memory đã có ở Pass 16/17, dẫn tới 4 khái niệm "memory" chồng chéo). Thay vào đó mở rộng model hiện tại theo 3 nhóm, vẫn đi qua chung hạ tầng Journal/Memory:

```text
Memory
├── Guest Memory   (đã có — "Sun lần đầu đến trạm...")
├── World Memory   (mới — "Ngày xưa nơi này từng có một khu vườn...")
└── Cloudy Memory  (mới — "Mình từng nghe tiếng chuông này...", nuôi Pass 32)
```

## Pass 34 — Rare Weather Events (P0)

Tái dùng pattern điều kiện của `RareGuestSystem` (Pass 22) cho hiện tượng thời tiết thay vì guest. Ví dụ Meteor Shower: điều kiện (Stargazing Corner mở + Moon đã ghé đủ số lần + đang đêm) → hiện tượng đặc biệt → ambient riêng + ingredient/potion đặc biệt + photo moment riêng + memory riêng. Kết nối lại nhiều hệ thống đã có (Weather, Guest, Photo, Journal, Decoration, Rare Guest) mà không cần gameplay system hoàn toàn mới.

Quan trọng: hiện tượng hiếm nhưng **có thể quay lại** (VD lặp lại theo chu kỳ vài tháng), không phải "chỉ cuối tuần này, bỏ lỡ là mất luôn" — soft FOMO, không phải hard FOMO, đúng triết lý cozy.

## Pass 35 — Sky Archive (P0)

Meta UI layer tổng hợp mọi thứ đã unlock (guest đã gặp, memory đã mở, weather đã pha, rare guest đã gặp, khu vực trạm đã mở, số lần Cloudy xuất hiện dạng đặc biệt...) thành 1 màn hình "bộ sưu tập". Mục tiêu: người chơi thấy "mình đã tạo ra cả một thế giới" thay vì chỉ thấy 1 con số crystal. Không cần hệ thống gameplay mới — chỉ đọc dữ liệu đã có từ các system hiện tại.

## Future Experiment — Async Paper Boat (không nằm trong roadmap chính)

Ý tưởng: nhận một lời tử tế → gửi một lời tử tế khác đi, giữa người chơi thật với nhau (đúng "signature mechanic" mà Pass 20 gốc kỳ vọng). Nhưng đổi hẳn tầng kiến trúc — toàn bộ game hiện tại 100% client-side (chỉ `localStorage`, không network) — cần thêm:

```text
Client → API → Message Queue/DB → Moderation → Message Pool → Client khác
```

cộng rate limit, spam protection, message validation, report/moderation, anonymous ID. Đây là một dự án riêng (cần backend), chỉ nên bắt đầu sau khi core single-player đã chứng minh là fun — không nhét vào roadmap chính.

## Product Decision — Commercialization? (chưa quyết)

Chưa xác định game này là portfolio/passion project (→ bỏ nhánh này) hay sản phẩm thương mại (→ mới cần Monetization Design → Cosmetic Shop → Commercial QA). Nếu commercial: nguyên tắc đã thống nhất trước là **"Pay for expression, not progression"** — chỉ bán cosmetic (Cloudy skin, phụ kiện, giấy journal, filter ảnh, gói decoration...), tuyệt đối không bán energy/premium currency/faster crafting/skip waiting/paid happiness — giữ đúng triết lý cozy kể cả khi thương mại hóa.

---

# Lộ trình ưu tiên cuối cùng

| Priority    | Pass | Mục tiêu              | Trạng thái |
| ----------- | ---- | --------------------- | ---------- |
| **P0**      | 15   | Inventory/Mixer       | ✅ hệ thống |
| **P0**      | 16   | Emotional Progression | ✅ hệ thống + nội dung (4-5→4) |
| **P0**      | 17   | Journal 2.0           | ✅ hệ thống + nội dung (4-5→4) |
| **P1**      | 18   | Journal Decoration    | ✅ |
| **P1**      | 19   | Butterfly Messengers  | ✅ |
| **P1**      | 20   | Paper Boat            | ✅ |
| **P2**      | 21   | Station Expansion     | ✅ |
| **P2**      | 22   | Rare Guests           | ✅ |
| **P2**      | 23   | Cloudy Cosmetics      | ✅ |
| **P3**      | 24   | Audio                 | ✅ |
| **P3**      | 25   | Game Feel             | ✅ |
| **P3**      | 26   | Asset Pipeline        | ✅ |
| **P4**      | 27   | Balance               |
| **P4**      | 28   | Mobile QA             |
| **P4**      | 29   | YouTube Playables     |
| **P4**      | 30   | Save Migration        |
| **Release** | 31   | Final QA              |

---

# Một số rule xuyên suốt Pass 15–31

Claude nên bị ràng buộc bởi những nguyên tắc này:

```text
1. Không rewrite architecture đang chạy tốt.

2. Không overengineer.

3. Không dùng Behavior Tree nếu FSM đủ.

4. EventBus cho domain event,
   không dùng EventBus cho mọi method call.

5. Systems giữ independent khỏi Phaser nếu có thể.

6. Content phải data-driven.

7. SaveProvider luôn async.

8. Không lưu base64 screenshot vào save.

9. Mỗi interactive feature phải actual pointer QA.

10. Không coi screenshot là bằng chứng interaction hoạt động.

11. Mỗi pass có test + production build.

12. Mỗi pass commit riêng.

13. Không phá save cũ.

14. Không thêm mechanics gây áp lực.

15. Emotional progression quan trọng hơn số lượng guest.

16. Mọi mở rộng sau Pass 31 phải làm vòng lặp
    guest → empathy → interaction → memory → world-building
    sâu hơn, không phải nhiều hơn — không thêm pass mới
    chỉ để "có thêm hệ thống giữ chân người chơi".
    (Xem PRODUCT DIRECTION CHECKPOINT gần cuối file.)
```

Và xét theo trạng thái hiện tại thì **Claude nên bắt đầu từ Pass 15 → 16 → 17, không nên nhảy ngay sang Bướm/Cực Quang/Sao Chổi**. Ba pass này sẽ biến MVP hiện tại từ một game “đã có đầy đủ hệ thống” thành một game bắt đầu có **chiều sâu và lý do để người chơi quay lại**.

---

# CHECKPOINT — Pass 15–17 hoàn thiện hệ thống (2026-09-03)

**Cập nhật (2026-09-03, lần 2):** Pass 15/16/17 giờ đã xong cả hệ thống lẫn nội dung — Claude tự thiết kế nội dung theo yêu cầu của người dùng ("tự thiết kế theo ý bạn"). Mỗi guest: 10 câu thoại (2/stage × 5 stage), 4 chapter/4 memory theo mạch cảm xúc riêng, 3 chapter đầu tự mở theo stage lúc đang dỗ khách, chapter 4 gắn Photo Moment. Đã verify lại bằng browser thật sau khi thêm nội dung — phát hiện và sửa thêm 2 bug layout thật (card đè hàng dưới, tiêu đề chapter đè nhau) trong lúc verify.

Nội dung hiện ở mức 4 memory/guest — thấp trong khoảng "4-5" của spec gốc, chưa có 5 chapter/6-stage narrative đầy đủ như ví dụ Sun trong Plan. Có thể mở rộng thêm nếu muốn, nhưng đã đủ để chơi được trọn vẹn progression loop.

Trước khi qua Pass 18, còn 1 việc đáng cân nhắc:

```text
Nên tag một baseline mới, ví dụ v0.2.0-core-depth,
trước khi bắt đầu Pass 18 (Journal Decoration).
```

---

# CHECKPOINT — Phase 3 hoàn thiện, đầy đủ không rút gọn (2026-09-03, cập nhật lần 2)

Sau khi báo cáo xong lần đầu, được yêu cầu làm lại đầy đủ Pass 19/20 — bỏ hết phần đã cố tình đơn giản hóa trước đó thay vì để nguyên. Đã bổ sung:

```text
Pass 19: Cloudy playHappyBounce() thật khi Bướm đến (không chỉ text),
         cơ chế "chạm để nghe chuyện" thật (3 story ở stories.json,
         trigger khi tap lúc không có potion — tận dụng tap "chết"
         trước đó, không chặn soothe thật).

Pass 20: Reward giờ gồm crystal + trust ngẫu nhiên cho 1 guest
         (GuestSystem.addTrust mới, +3, có toast riêng) + sparkle
         hình ảnh khi thả thuyền — thay vì chỉ 1 crystal cố định.
```

Bonus phát hiện khi verify đầy đủ luồng dỗ Bướm qua browser: nút "CHẾ TẠO" của Weather Mixer nằm ngoài canvas (y=726 > 720) — không bấm được ở độ phân giải chuẩn, ảnh hưởng cả Pass 15. Đã sửa vị trí, verify lại xác nhận bấm được.

Tổng cộng session này thêm: 1 system mới (`PaperBoatSystem`), 1 method mới trên `GuestSystem` (`addTrust`), 1 guest mới (`butterfly`, tái sử dụng kiến trúc cũ), 2 UI mới (`PaperBoatUI`, decoration mode trong `JournalScene`), 4 file data mới (`stickers.json`, `messages.json`, `stories.json`), mở rộng save schema thêm `journalLayout`/`paperBoatSentCount`. 66/66 test pass, build sạch, verify browser thật nhiều vòng — gồm cả reload trang thật để xác nhận sticker lưu đúng qua localStorage, và toàn bộ chuỗi pha chế→dỗ→story cho Bướm.

Điểm còn lại, có chủ đích không làm (đã ghi rõ lý do trong từng pass ở trên, không phải bỏ sót):

```text
1. Pass 20 không thêm "small memory" reward — tránh trùng lặp
   với hệ thống memory của Pass 16/17.

2. Nav bar StationScene giờ có 6 icon. "🌾 Thu hoạch" vẫn là
   placeholder "đang phát triển"; "⚒️ Nâng cấp" đã được dùng
   thật cho Pass 21 (Mở rộng trạm) ở Phase 4 bên dưới.

3. Nên tag baseline mới, ví dụ v0.3.0-content-social,
   trước khi qua Phase 4 (Pass 21-23: Station Expansion,
   Rare Guests, Cloudy Cosmetics).
```

---

# CHECKPOINT — Phase 4 hoàn thiện (2026-09-03)

Pass 21/22/23 đã xong, đầy đủ không rút gọn ngay từ đầu (áp dụng bài học từ Phase 3). Phase này có phụ thuộc thật giữa các pass nên làm tuần tự 21→22→23 thay vì song song.

Tổng cộng thêm: 4 system mới (`StationAreaSystem`, `DayNightSystem`, `CloudyCosmeticsSystem`, `RareGuestSystem`), 2 guest mới (`aurora`, `comet`, đánh dấu `rare: true` để loại khỏi vòng spawn ngẫu nhiên), 2 UI mới (`StationAreaShopUI`, `CloudyCosmeticsShopUI`), `Cloudy.ts` được viết lại để nhận shape/accessory (`src/entities/CloudyShapes.ts` mới), `DecorationSystem` thêm `requiredAreaId` gating, 2 data file mới (`areas.json`, `cloudyCosmetics.json`). 87/87 test pass, `tsc`/lint/build sạch.

**3 bug thật phát hiện khi verify bằng browser** (xem chi tiết ở ghi chú Phase 4 phía trên): rare guest lọt vào vòng spawn ngẫu nhiên, mua cosmetic không tự mặc, guest thường cướp chỗ rare guest do đua timer — cả 3 đều là loại lỗi chỉ lộ ra khi thực sự bấm thử trong browser, không phải khi đọc code hay chạy unit test.

**Lưu ý phát hiện ngoài lề, không phải do tôi:** khi kiểm tra git status cuối phiên, thấy `src/Plan.md` và toàn bộ code từ đầu dự án đã được commit tự động vào git (24 commit local, chưa push lên `origin/main`, commit message dạng "feat: ..." mô tả đúng từng pass) — có vẻ môi trường của bạn có hook tự commit sau mỗi thay đổi. Tôi không tự ý commit gì (đúng nguyên tắc chỉ commit khi được yêu cầu) — chỉ báo lại để bạn biết, phòng khi đây không phải hành vi bạn mong đợi.

Trước khi qua Phase 5 (Pass 24-26: Audio, Game Feel, Asset Pipeline), nên tag baseline mới, ví dụ `v0.4.0-world-progression`.

---

# CHECKPOINT — Phase 5 hoàn thiện (2026-09-03)

Pass 24/25/26 đã xong. Khác các Phase trước — đây là polish/architecture pass, không tạo tính năng mới cho người chơi thấy ngay, nên "hoàn thiện" nghĩa là review có hệ thống + sửa đúng chỗ thiếu, không phải liệt kê tính năng đã thêm.

Tổng cộng: `AudioSystem` viết lại hoàn toàn theo kiến trúc bus (MASTER→MUSIC/AMBIENCE/SFX) + 4 ambience layer theo ngữ cảnh + 4 SFX mới, UI `AudioSettingsUI` mới (4 slider kéo được). 5 chỗ game-feel thiếu thật được sửa (Guest tap feedback, Ingredient collect animation, Inventory count pop, Paper Boat fold pop, Sticker pop-in) — đã rà toàn bộ danh sách 15 hệ thống trong Plan, phần còn lại xác nhận đã đủ tốt chứ không bỏ sót. `AssetRegistry.ts` mới làm điểm swap art kiến trúc, wire vào `Guest.ts`/`Decoration.ts`, xác nhận zero thay đổi hình ảnh hôm nay (đúng ý "chỉ chuẩn bị architecture").

93/93 test pass, `tsc`/lint/build sạch, verify browser xác nhận không có console error qua toàn bộ luồng tương tác (âm thanh tự thân không verify được qua screenshot, đã ghi rõ giới hạn này).

Phase 1-6 (Pass 1-30) giờ đã xong toàn bộ — Pass 27 (Economy & Cozy Pacing review + Paper Boat rework), Pass 28 (Mobile & Touch QA trên 5 viewport), Pass 29 (YouTube Playables `PlatformAdapter`), Pass 30 (Save Migration `normalizeSaveData`) đều đã có mục "✅ Đã làm" chi tiết ở phần tương ứng phía trên. Còn lại: Phase 7 (Pass 31: Final QA release gate) — pass cuối, không thêm feature, chỉ chạy full regression + production gameplay test thật. Nên tag baseline mới, ví dụ `v0.6.0-balance`, trước khi qua Phase 7.
