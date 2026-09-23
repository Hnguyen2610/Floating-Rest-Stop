Dưới đây là **toàn bộ roadmap từ Pass 1 đến Pass 31**, mình đã gom lại thành một lộ trình thống nhất, bao gồm cả MVP đã làm xong, các feature còn thiếu theo mô tả game gốc, và các findings kỹ thuật đã rút ra trong quá trình QA.

# Tổng quan roadmap

```text
PHASE 1 — MVP FOUNDATION                 Pass 1–14   ✅ DONE
PHASE 2 — CORE GAME DEPTH                Pass 15–17  ✅ DONE (hệ thống + nội dung — xem ghi chú trạng thái trong từng pass)
PHASE 3 — CONTENT & SOCIAL INTERACTION   Pass 18–20  ✅ DONE (xem ghi chú trạng thái trong từng pass)
PHASE 4 — WORLD PROGRESSION              Pass 21–23  ✅ DONE (xem ghi chú trạng thái trong từng pass)
PHASE 5 — PRESENTATION & GAME FEEL       Pass 24–26  ✅ DONE (xem ghi chú trạng thái trong từng pass)
PHASE 6 — BALANCE & PLATFORM             Pass 27–30  ✅ DONE (xem ghi chú trạng thái trong từng pass)
PHASE 7 — RELEASE QA                     Pass 31     ✅ DONE (2 bug thật tìm thấy + đã sửa, xem ghi chú)
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

**🐛 Bug thật phát hiện qua chơi thử (2026-09-17):** người dùng báo "chả thấy bé sao nhút nhát đâu để chế tạo" — mở Sổ Công Thức lúc Bé Sao Nhút Nhát đang là khách hiện tại, nhưng sổ không có dòng nào nhắc đến cô ấy. Nguyên nhân: `RecipeBookUI` chỉ lặp qua `weatherSystem.getAllRecipes()` (5 công thức) — Bé Sao Nhút Nhát dùng `treatment.type === 'direct'` (vuốt nhẹ, không pha chế) nên chưa từng có công thức nào gán cho cô, đúng theo thiết kế dữ liệu (`recipes.json` chỉ có 5 entry cho 5 khách còn lại), nhưng hệ quả là sổ công thức **bỏ sót hoàn toàn** vị khách duy nhất không dùng công thức — người chơi mở đúng chỗ được hướng dẫn "muốn biết làm gì thì mở sổ này ra" mà vẫn không tìm được câu trả lời cho riêng khách này.

Sửa: `RecipeBookUI` giờ lặp thêm qua `guestSystem.getAllDefinitions().filter(treatment.type === 'direct')`, vẽ thêm 1 dòng riêng cho mỗi khách kiểu này — tên hành động (map tĩnh `DIRECT_TREATMENT_LABELS['gentle_polish'] = '🤍 Vuốt nhẹ nhàng'`, ở tầng hiển thị thôi, không đụng vào `GuestTreatment` type), "Dành cho: <tên khách>", và thay vì chấm màu nguyên liệu thì hiện thẳng câu hướng dẫn hành động (lấy từ `definition.needHint`, tách phần sau dấu " — " — data đã có sẵn, không cần thêm field mới). `PANEL_HEIGHT` đổi từ hằng số cố định (400, vừa đúng 5 dòng) sang tính động theo tổng số dòng thật (`HEADER_HEIGHT + totalRows * ROW_HEIGHT + BOTTOM_MARGIN`) — để dễ mở rộng nếu sau này có thêm khách/công thức mà không phải nhớ sửa hằng số tay.

Verify: `tsc`/`vitest` (112/112)/`lint` sạch. Playwright thật: spawn Bé Sao Nhút Nhát (phím debug `3`), mở Sổ Công Thức — xác nhận hiện đủ 6 dòng (5 công thức cũ + 1 dòng mới "🤍 Vuốt nhẹ nhàng — Dành cho: Bé Sao Nhút Nhát — hãy vuốt thật nhẹ nhàng, đừng vội"), panel giãn cao đúng, không tràn/đè lên UI khác, 0 console error.

---

# Bổ sung sau Pass 31 — Polish icon nguyên liệu + Mây Bông "thật" hơn

**✅ Đã làm (2026-09-03):** theo yêu cầu trực tiếp sau khi xem screenshot thật — icon nguyên liệu trước đó chỉ là hình tròn phẳng + 1 chấm highlight nhỏ, Mây Bông là khối blob mượt hoàn toàn phẳng.

`src/entities/ingredientGlyph.ts` (mới) — tách logic vẽ icon riêng theo từng loại nguyên liệu (giọt sương, tia nắng, xoáy gió, cầu vồng, lấp lánh sao) vốn trước đây CHỈ tồn tại trong `WeatherMixerUI` (icon nhỏ trong bát trộn) ra thành hàm dùng chung `drawIngredientGlyph(graphics, id, scale)` — `WeatherMixerUI.ts` giờ gọi lại đúng hàm này (không đổi hình dạng/kích thước cũ trong bát trộn), và `FloatingIngredient.ts` dùng CÙNG glyph đó ở scale lớn hơn cho quả cầu nổi ngoài trạm — nghĩa là hình nguyên liệu đang nổi giờ khớp trực quan với hình sẽ hiện trong bát trộn khi thả vào, không chỉ là màu giống nhau.

`FloatingIngredient.ts` — quả cầu giờ có bóng đổ mềm bên dưới, kỹ thuật "sphere shading" (vòng tròn màu đậm hơn full-size vẽ trước, vòng tròn màu chính nhỏ hơn đè lên lệch góc trên-trái, để lộ viền đậm ở dưới-phải) tạo cảm giác khối cầu 3D thay vì hình tròn phẳng, viền mỏng cùng tông đậm hơn, glyph riêng từng loại vẽ trắng ở giữa, và lớp bóng sáng (highlight ellipse + 1 chấm sáng nhỏ) phủ trên cùng cho cảm giác "quả cầu thuỷ tinh" thay vì sơn phẳng.

`Cloudy.ts` (`redraw()`) — thêm 4 lớp vẽ mới, tất cả vẫn bám theo đúng điểm mesh sống của SoftBodyMesh (nên vẫn biến dạng đúng theo vật lý squish/kéo có sẵn từ Pass 23, không đụng vào physics):

```text
1. Bóng dưới thân — cùng silhouette, dịch xuống + tint tím nhạt → cảm giác khối tròn có trọng lượng
2. Cụm "phồng" (puff) rải theo viền trên của mesh — silhouette bớt trơn/giống quả trứng, giống mây thật hơn
3. Viền mỏng, rất nhạt (alpha 0.1) — giữ silhouette rõ trên nền trời sáng
4. Highlight góc trên-trái — gợi ý ánh sáng chiếu từ trên xuống, thêm chiều sâu
```

Cả 2 shape khác (`cotton_candy`, `heart`) đều dùng chung `redraw()` nên tự động thừa hưởng — đã verify bằng browser thật cả 3 shape (mặc định, mua Mây Trái Tim) vẫn nhận diện đúng hình dạng, không bị lớp phồng làm biến dạng quá đà.

`tsc`/`vitest` (108/108)/`lint` sạch. Verify browser thật: icon nguyên liệu nổi ngoài trạm rõ ràng có glyph riêng biệt + độ bóng; icon trong bát trộn (đã refactor dùng chung hàm) không đổi hình dạng/kích thước so với trước; Mây Bông có 2 lớp "phồng" rõ ở viền trên + bóng dưới thân, không còn phẳng như khối trứng; không console error.

**⚠️ Đã bị thay thế hoàn toàn bởi mục dưới đây** — sau khi xem thêm 1 ảnh mẫu (screenshot game "vẽ tay") thật sự chi tiết, người dùng xác nhận vẽ-bằng-code (Phaser Graphics) không bao giờ đạt được độ chi tiết đó, dù polish thêm bao nhiêu. Quyết định chuyển sang dùng ảnh minh hoạ thật (do người dùng nhờ Gemini tạo theo prompt mình soạn) — xem mục "Bổ sung — Chuyển sang ảnh minh hoạ thật" ngay sau đây. Phần code `drawIngredientGlyph`/`FloatingIngredient` sphere-shading/`Cloudy.redraw()` phồng-mây ở trên đã bị GỠ BỎ hoàn toàn (không phải giữ song song) — giữ lại mục này chỉ để ghi nhận đã thử hướng "cải thiện trong giới hạn code" trước khi xác nhận giới hạn đó thật sự không đủ.

---

# Bổ sung — Chuyển hẳn sang ảnh minh hoạ thật (thay vẽ-bằng-code)

**✅ Đã làm (2026-09-03):** Không có công cụ tạo ảnh trong bộ công cụ hiện tại (đã kiểm tra, không có), nên đã soạn bộ prompt chi tiết (style neo dùng chung + prompt riêng từng ảnh) để người dùng tự nhờ Gemini tạo, rồi gửi lại 20 ảnh JPG nền trắng. Quy trình xử lý + tích hợp:

**1. Tách nền** — ảnh JPG nền trắng phẳng, nhưng thân Mây Bông cũng gần trắng/kem nên không thể "xoá mọi pixel trắng" (sẽ ăn vào chính nhân vật). Dùng kỹ thuật flood-fill từ 6 điểm mép/góc ảnh (Python + Pillow, `ImageDraw.floodfill` với ngưỡng màu 28) — chỉ xoá vùng trắng THỰC SỰ NỐI LIỀN với viền ngoài, dừng lại đúng tại viền nét đậm (#5b4a63), giữ nguyên mọi vùng trắng/kem bị "khoanh vùng" bên trong (thân mây, viền tròn nav icon dù cũng gần trắng). Verify bằng cách ghép ảnh đã tách nền lên nền xanh da trời thật của game — xác nhận cắt sạch, không viền trắng sót, không ăn vào nhân vật.

**2. Tổ chức file** — `public/assets/{ingredients,nav,cloudy/{default,cotton_candy,heart},accessories}/*.png`. 4 ảnh biểu cảm Mây Bông (idle/happy/poke/sleepy) ban đầu bị Gemini trả về với vùng crop khác nhau mỗi ảnh (do sparkle/hiệu ứng mỗi biểu cảm lan ra khác nhau) — nếu dùng thẳng sẽ làm Mây Bông "nhảy" kích thước/vị trí mỗi lần đổi trạng thái; đã tính chung 1 bounding-box (hợp của cả 4 ảnh) rồi crop cả 4 theo đúng khung đó, đảm bảo cùng kích thước canvas → vị trí neo (origin) nhất quán khi đổi texture.

**2 shape mới** (Mây Kẹo Bông, Mây Trái Tim) hiện chỉ có 1 dáng "idle" (chưa có đủ 4 biểu cảm như shape mặc định) — chấp nhận có chủ đích cho v1, xem cơ chế fallback bên dưới.

**3. Icon nguyên liệu + icon nav** (`FloatingIngredient.ts`, `WeatherMixerUI.ts`, `BottomNavUI.ts`) — thay hẳn phần vẽ-bằng-code (Graphics) bằng `scene.add.image()`, scale theo `frame.width` để không phụ thuộc kích thước gốc từng ảnh. `BottomNavUI`'s `NavItem` thêm field `iconKey?: string` — có ảnh thì dùng ảnh, không có thì fallback về emoji cũ (`icon`) — không ép mọi nav item phải có ảnh (vd. "Thu hoạch" vẫn đang coming-soon).

**4. Mây Bông — viết lại hoàn toàn `Cloudy.ts` từ soft-body mesh sang sprite:**

```text
Trước: SoftBodyMesh biến dạng sống theo mesh point khi kéo/chạm (Pass 23)
Sau:   Phaser.GameObjects.Image, đổi texture theo trạng thái + tween co-giãn đơn giản
```

Đây là quyết định đã hỏi người dùng trước khi làm (ảnh hưởng vật lý/cơ chế kéo-thả đã có) — người dùng chọn: dùng ảnh cho dáng mặc định, đồng thời tạo luôn prompt bổ sung cho 2 shape còn thiếu + 3 phụ kiện để tích hợp trọn vẹn một lần thay vì làm 2 đợt.

Cơ chế texture key: `` `cloudy-${shapeId}-${expression}` `` (expression: idle/happy/poke/sleepy) — có texture thì dùng, không có thì tự fallback về `${shapeId}-idle` (xử lý đúng trường hợp cotton_candy/heart chỉ có 1 dáng). `playHappyBounce()`/`playTouchReaction()`/`scheduleNextBlink()` giữ nguyên TÊN và Ý NGHĨA như code cũ, chỉ đổi bên trong: thay vì méo mesh thật, giờ đổi texture + tween scale ngắn (giống hệt kiểu tween co-giãn container đã có sẵn từ trước, không phải kỹ thuật mới). `showExpression()` dùng 1 timer dùng chung để tự huỷ+thay timer cũ mỗi lần gọi — đảm bảo gọi chồng (vd. bị chạm giữa lúc đang chạy happy-bounce) luôn kết thúc đúng ở idle, không bị kẹt biểu cảm.

Phụ kiện (mũ, kẹp sao, nơ) giờ là `Phaser.GameObjects.Image` riêng, chồng lên theo % kích thước hiện tại của sprite Mây Bông (`ACCESSORY_PLACEMENT`, toạ độ tương đối theo width/height chứ không phải số px cứng) — nên vẫn đặt đúng chỗ dù đổi qua shape khác có tỉ lệ khác. `setShape()` gọi lại `redrawAccessories()` để phụ kiện luôn tính lại theo kích thước sprite mới.

Vì Mây Bông không còn dùng `SoftBodyMesh`/`CloudyShapes.ts` nữa (chỉ `LittleStarGuest.ts` còn dùng `SoftBodyMesh` cho tương tác "vuốt nhẹ"), đã **xoá hẳn `src/entities/CloudyShapes.ts`** (không còn nơi nào gọi tới) thay vì để lại code chết.

Files:

```text
public/assets/**                          — 20 ảnh PNG đã tách nền (nguyên liệu, nav, Mây Bông × 6 dáng, phụ kiện)
src/scenes/PreloadScene.ts                — preload toàn bộ texture mới
src/entities/FloatingIngredient.ts        — Image thay Graphics
src/ui/WeatherMixerUI.ts                  — Image thay Graphics cho icon trong bát trộn
src/ui/BottomNavUI.ts                     — NavItem.iconKey, fallback về emoji
src/scenes/StationScene.ts                — truyền iconKey cho 6 nav item
src/entities/Cloudy.ts                    — viết lại hoàn toàn: sprite thay soft-body mesh
src/entities/CloudyShapes.ts              — XOÁ (không còn dùng)
src/core/AssetRegistry.ts                 — sửa lại comment cũ về Cloudy (đã lỗi thời)
src/entities/ingredientGlyph.ts           — XOÁ (thay bằng ảnh thật, không cần glyph vẽ tay nữa)
```

**Verify browser thật (quan trọng nhất cho lần này):** cả 3 trạng thái biểu cảm Mây Bông (idle/chạm-poke/vui-happy, kích hoạt qua tương tác thật: tap Mây Bông, cho Bướm đến) hiện đúng ảnh + tween, tự trở lại idle đúng lúc; mua Mây Trái Tim (💎 8, qua đúng luồng shop thật) → Mây Bông đổi hẳn sang ảnh trái tim; mở khoá Mũ Hoàng Hôn (qua đúng điều kiện thật: trust Mặt Trăng ≥40 rồi rời đi) → trang bị → mũ hiện đúng vị trí, đúng tỉ lệ, không lệch. `tsc`/`vitest` (108/108, không giảm)/`lint`/`build` sạch xuyên suốt. Không console error ở bất kỳ bước nào.

**Chưa làm, có chủ đích:** phụ kiện Kẹp Sao Nhỏ + Nơ Cầu Vồng chưa verify bằng browser thật (điều kiện mở khoá — chụp ảnh Sao Chổi/Cực Quang — phức tạp hơn để dựng lại trong 1 lượt test nhanh), nhưng dùng chung code path với Mũ Hoàng Hôn đã verify nên rủi ro thấp. Mây Kẹo Bông chưa test trực tiếp (điều kiện mở khoá là memory chương 4 của bất kỳ khách nào — sâu, khó dựng nhanh) nhưng cũng dùng chung `setShape()` đã verify qua Mây Trái Tim. Guest (Mặt Trời, Mặt Trăng...) vẫn CHƯA đổi sang ảnh — ngoài phạm vi yêu cầu lần này ("mây và icon"), có thể làm sau nếu người dùng muốn.

## Bổ sung tiếp — Thiết kế lại thanh điều hướng dưới (thẻ mây thay icon tròn nhỏ)

**✅ Đã làm (2026-09-03):** người dùng gửi lại đúng ảnh mẫu ban đầu, chỉ ra riêng phần thanh nav dưới cùng: "không muốn icon nhỏ nhỏ nữa, muốn giống ảnh luôn". Đây là đổi bố cục/kích thước component, không chỉ đổi hình — viết lại `BottomNavUI.ts`:

```text
Trước: hình tròn 48px, icon 30px, nhãn chữ 10px bên dưới
Sau:   thẻ hình mây (bo góc lớn + 2 cụm "phồng" nhỏ ở cạnh trên, giống kỹ thuật puff
       đã dùng cho Mây Bông), 76px, icon 46px, nhãn chữ 11px có wordWrap, có bóng đổ mềm
```

Không tạo ảnh mới cho khung thẻ — dùng lại 6 icon minh hoạ đã có (đã đẹp sẵn), chỉ thiết kế lại KHUNG chứa bằng Phaser Graphics (bo góc + 2 vòng tròn nhỏ ở mép trên để có silhouette hơi gợi hình mây, giống hệt kỹ thuật puff đã dùng ở `Cloudy.ts`, giữ nhất quán ngôn ngữ hình ảnh giữa 2 nơi) — tránh phải quay lại nhờ Gemini tạo thêm 6 ảnh khung nút mới.

Vì thẻ to hơn (76px so với 48px cũ), đã dịch cả hàng nav lên (`y: GAME_HEIGHT-50` thay vì `-26`) để không tràn khỏi màn hình, và dịch panel Trang Trí lên theo (`GAME_HEIGHT-130` thay vì `-96`) để không bị chồng lên hàng nav mới cao hơn — phát hiện + sửa trong lúc verify, không phải đoán trước.

**Lưu ý kỹ thuật (tự sửa 1 lỗi trước khi verify):** lúc đầu viết hit-area rect lệch (`Rectangle(-half,-half,...)`), suy luận lại đúng quy ước hit-test của Container đã dùng nhất quán trong toàn bộ codebase này (toạ độ hit-test tính từ góc trên-trái của `setSize()`, không phải tâm container) — sửa lại thành `Rectangle(0,0,CARD_SIZE,CARD_SIZE)` trước khi test, và xác nhận cả 6 nút bấm đúng qua browser thật.

`tsc`/`vitest` (108/108)/`lint`/`build` sạch. Verify browser thật: cả 6 thẻ hiện đúng ảnh+nhãn, bấm đúng cả 6 (Nhật ký mở Journal, Trang trí/Gửi lời nhắn mở đúng panel không bị hàng nav mới đè lên), không console error.

**⚠️ Bố cục 1 hàng ở trên đã được điều chỉnh tiếp ngay sau đó** — xem mục "Chia 2 cụm trái/phải" bên dưới.

## Bổ sung tiếp nữa — Chia 2 cụm trái/phải (thay vì 1 hàng dài)

**✅ Đã làm (2026-09-03):** người dùng phản hồi thêm: "chia đều các button đi, không làm giống ảnh hơn được à" — ảnh mẫu chia nav thành 2 cụm riêng (trái + phải quanh khu pha chế), không phải 1 hàng dài dồn về bên trái. Đã hỏi lại bằng 3 phương án cụ thể (preview trực quan) — người dùng chọn đúng phương án chia 2 cụm.

Không cần sửa `BottomNavUI.ts` — component đã nhận `(scene, x, y, items[])` và tự xếp hàng ngang từ đó, nên chỉ cần gọi **2 lần** ở `StationScene.drawBottomNav()` với 2 nhóm item + 2 vị trí khác nhau, thay vì 1 lần với cả 6 item:

```text
Cụm trái (x=64, y=GAME_HEIGHT-50)  — Nhật ký, Trang trí, Mở rộng trạm
                                      (nhóm "menu/tuỳ chỉnh trạm", giống tinh thần
                                      cụm trái của ảnh mẫu — nhật ký/thu hoạch/trang trí)
Cụm phải (x=900, y=GAME_HEIGHT-50) — Gửi lời nhắn, Thu hoạch, Mây Bông
                                      (đặt sát bên trái bát trộn — khu vực "hành động
                                      đang chơi", giống tinh thần cụm phải của ảnh mẫu
                                      nằm cạnh khu pha chế)
```

Vị trí cụm phải (x=900) được tính để nút cuối cùng dừng lại trước bát trộn (mép trái bát trộn ≈ x=1144) với khoảng hở ~20px, không chồng lấn.

`tsc`/`vitest` (108/108)/`lint`/`build` sạch. Verify browser thật: 2 cụm hiện tách biệt rõ ràng, không chồng lên bát trộn/nút CHẾ TẠO; test đủ cả 6 nút ở cả 2 cụm (Nhật ký round-trip Journal, Trang trí/Mở rộng trạm/Mây Bông toggle đúng, Gửi lời nhắn mở đúng panel) — không console error.

---

# Bổ sung — Hoàn thiện luồng làm việc song song (kế hoạch 23 task, 2026-09-04)

**Bối cảnh:** phát hiện một phiên làm việc khác (dùng `superpowers:writing-plans`, kế hoạch tại `docs/superpowers/plans/2026-09-04-*`) đã chạy song song trên cùng repo, xây tiếp trên nền các file/asset của phiên này. Người dùng yêu cầu "hoàn thiện luồng kia". Đã đọc toàn bộ 23 task, xác nhận nhiều task dựa trên giả định sai về codebase thật (không có physics engine, `Platform.ts` là singleton function không phải class để inject, atlas/husky/e2e-qua-jsdom không phù hợp quy mô/kiến trúc hiện tại) — đã hỏi lại phạm vi, người dùng chọn "làm thêm task hợp lý, bỏ task sai giả định".

## ✅ Sửa bug thật trong phần đã "xong" trước đó (2026-09-08)

**1. `Guest.ts` — animation nháy mắt sai cả timing lẫn mục tiêu, cộng rò rỉ listener:**
```text
Trước: tween scaleY lặp vô hạn (repeat:-1) với delay:3000 nhưng KHÔNG có
       repeatDelay — Phaser chỉ áp delay cho lần đầu, sau đó lặp lại ngay
       lập tức không nghỉ → sau 3s đầu, cả THÂN khách co-giãn liên tục mỗi
       ~400ms mãi mãi, không phải "nháy mắt mỗi 3 giây".
       destroy() gọi .off('pause', () => {...}) bằng hàm ẩn danh MỚI, không
       khớp hàm đã .on() ở constructor → không gỡ được gì, rò rỉ 2 listener
       trên scene.events mỗi lần khách bị destroy (rất thường xuyên — mỗi
       lượt khách rời đi).
Sau:   dùng đúng pattern đã có sẵn và đã verify trong Cloudy.ts — tween 1 lần
       + delayedCall tự lên lịch lại (2.5-4.5s ngẫu nhiên giữa các lần),
       target CHỈ 2 mắt (đã lưu lại reference leftEye/rightEye, trước đây
       addFace() chỉ tạo biến local rồi bỏ), named handler cho pause/resume
       để destroy() gỡ đúng listener đã đăng ký.
```
Trong lúc verify bằng browser thật (Journal round-trip khi khách vẫn đang ở giữa lượt ghé — kịch bản người chơi thật hoàn toàn có thể gặp), phát hiện thêm 1 bug MỚI do chính fix này gây ra: StationScene tái dùng lại CÙNG MỘT instance qua các lần `scene.start()` (không tạo instance mới), nên `activeGuestEntity` có thể giữ reference "cũ" trỏ đến 1 entity đã bị Phaser tự destroy khi scene tắt — gọi `.destroy()` lần 2 lên nó trước đây vốn an toàn (Phaser tự bỏ qua), nhưng code MỚI truy cập `this.scene.events` mà không kiểm tra null nên crash thật (`Cannot read properties of undefined`). Đã sửa bằng cách bọc `if (this.scene)` trước khi truy cập — khớp đúng mức độ phòng vệ mà phần còn lại của destroy() (base Phaser) vốn đã có.

**2. `ParticleEffect.ts` — dùng sai API Phaser:**
```text
scene.add.particles('sparkle').createEmitter(...) — API Phaser ≤3.55.
Project dùng Phaser 3.90: add.particles(x, y, texture, config) trả thẳng về
emitter, không còn .createEmitter(). Code cũ không hề compile được.
```
Viết lại đúng API 3.90, thêm `emitting: false` (chỉ nổ 1 lần qua `.explode()`, không tự phun liên tục).

**3. Hiệu ứng sparkle không hiện được (bug thứ 2, phát hiện qua browser thật, không phải chỉ đọc code):** dù đã sửa API, chụp màn hình ngay lúc hiệu ứng nổ cho thấy **không có gì hiển thị** — texture sparkle gốc chỉ là 1 chấm tròn trắng phẳng 8px, kết hợp `blendMode: ADD` trên nền trời pastel sáng gần như trắng → cộng-màu-trắng-lên-nền-sáng gần như vô hình. Đã tạo lại texture (ngôi sao 4 cánh lấp lánh, giống glyph "star_dust" nguyên liệu) và đổi `blendMode` sang `NORMAL` — verify lại bằng browser thật, giờ thấy rõ.

**4. `Game.ts` — dùng sai API hoàn toàn:** `game.add.text(...)` — `Phaser.Game` (đối tượng top-level) không có `.add`, đó là API của `Scene`. Code này không hề compile được. Đã gỡ bỏ hoàn toàn cách tiếp cận "vẽ UI ngay trong Game.ts" — xem mục 5 để biết hướng thay thế.

**5. Gộp lại "Save Status UI" (Task 13) — 2 chỗ trùng lặp, đều sai:** `Game.ts` (lỗi mục 4) và `SaveStatusUI.ts` (lỗi TypeScript: property chưa khởi tạo, gán `number` cho field cần `string`) cùng làm một việc. Đã thiết kế lại theo đúng pattern eventBus đã dùng nhất quán suốt codebase này: `SaveSystem.saveNow()` giờ emit `save:started`/`save:completed`/`save:failed` (3 event mới trong `EventBus.ts`), `SaveStatusUI` (viết lại, sửa hết lỗi TS) lắng nghe và tự quản lý cleanup theo đúng pattern DESTROY-event đã dùng cho 6 UI khác ở Pass 31.

**Quyết định thiết kế khác với kế hoạch gốc:** kế hoạch gốc muốn hiện "Saving.../Saved!" mỗi lần lưu — nhưng game này tự động lưu sau GẦN NHƯ MỌI hành động (nhặt crystal, khách rời đi, mở khoá trang trí...), nên sẽ hiện liên tục mỗi 1-2 giây lúc chơi bình thường — đúng kiểu "làm phiền" mà nguyên tắc "Subtle > Flashy, không gây áp lực" (đã chốt từ đầu dự án) muốn tránh. Đổi thành: **chỉ hiện khi lưu THẤT BẠI** (`save:failed`) — lưu thành công thì im lặng (đúng như game đã hoạt động ổn định từ Pass 30 đến giờ), chỉ báo khi thật sự có vấn đề đáng để người chơi biết.

## ✅ Hoàn thiện phần dở dang (Task 1 — màu phụ kiện)

6 ảnh phụ kiện đổi màu đã được tạo file nhưng **chưa hề nối vào** `cloudyCosmetics.json`/shop UI (chỉ preload, không thể mặc được) — VÀ khi kiểm tra trực tiếp, phát hiện 2 trong 6 ảnh (`sunset_hat_pink.png`, `sunset_hat_mint.png`) **không hề được đổi màu thật** — giống hệt bản gốc, có thể do lần chạy `recolor_asset.py` trước đó bị sai tham số hoặc không hoàn tất. Tự chạy lại `recolor_asset.py` (đã verify script logic đúng) cho cả 6 ảnh, so sánh trước/sau bằng mắt xác nhận đúng màu đích. Nối vào hệ thống thật:

```text
CloudyCosmeticsSystem.ts — thêm purchaseAccessory(id), mirror purchaseShape()
                            đã có — phụ kiện gốc (3 cái) vẫn CHỈ mở qua điều
                            kiện đặc biệt (trust/rare-guest-photo) như cũ,
                            biến thể màu (6 cái) mua trực tiếp bằng crystal
                            (5💎/cái) — không cần sở hữu bản gốc trước.
cloudyCosmetics.json      — thêm 6 entry phụ kiện màu mới, cost:5
Cloudy.ts                 — ACCESSORY_PLACEMENT thêm 6 id mới, dùng chung vị
                            trí với phụ kiện gốc (cùng món, chỉ đổi màu)
CloudyCosmeticsShopUI.ts  — describeAccessoryCost()/tryAccessory() giờ mirror
                            đúng logic shape (hiện giá, mua khi chưa mở, lắc
                            khi không đủ tiền)
```

Verify browser thật: mở shop thấy đủ 9 phụ kiện (3 gốc "Chưa có" + 6 biến thể "💎 5"), mua Mũ Hoàng Hôn (Hồng) → Cloudy đội đúng mũ màu hồng (không phải màu cam gốc).

## ✅ Task hợp lý làm thêm (bỏ task sai giả định — xem lý do ở tin nhắn trả lời người dùng)

```text
Task 9  — Touch hitbox: HappinessCrystal/PhotoMomentIcon 44px→48px (khớp
          chuẩn tối thiểu); Guest/Decoration/FloatingIngredient/BottomNavUI
          đã ≥48px sẵn từ trước, không cần sửa.
Task 10 — HapticFeedback.ts mới (navigator.vibrate, no-op nếu không hỗ trợ),
          gắn vào Guest tap + Cloudy poke — 2 tương tác "chạm" rõ nhất,
          không lạm dụng khắp nơi.
Task 3  — (bổ sung) glow effect khi nhặt Happiness Crystal, dùng chung
          ParticleEffect đã sửa.
Task 8  — PerformanceMonitor.ts mới, CHỈ hiện qua phím debug 'P' (đã có sẵn
          cơ chế `if (!import.meta.env.DEV) return` cho mọi phím debug —
          không xuất hiện trong bản production).
```

Files mới/sửa còn lại: `create_sparkle.py` (viết lại khớp đúng ảnh sparkle mới), xoá 3 file backup thừa (`Guest.ts.backup`, `.bak2`, `StationScene.ts.backup` — bản build trước khi sửa, không còn giá trị).

**Bỏ có giải thích (task sai giả định hoặc mâu thuẫn hướng đi đã chốt):**

```text
Task 4  Texture atlas       — ~20 ảnh nhỏ, chưa tới ngưỡng cần atlas
Task 5  Lazy loading        — tải hiện tại đã nhanh (1 JSON nhỏ + vài chục PNG)
Task 6  Physics timestep    — game KHÔNG dùng Phaser physics engine ở đâu cả
Task 7  Object pooling      — HappinessCrystal chỉ spawn khi dỗ khách thành
                               công thật, tần suất quá thấp để cần pooling
Task 11 Tooltip hệ thống    — trùng GuestHintUI đã có (gợi ý theo ngữ cảnh)
Task 12 Achievement toast   — mâu thuẫn "Never: Score/HP" đã chốt ở
                               PRODUCT DIRECTION CHECKPOINT
Task 14 Scalable UI/font    — phạm vi quá lớn (chạm gần mọi Text trong game)
Task 15 Extract utilities   — không có logic lặp lại rõ ràng đáng tách ra
Task 18 ESLint Phaser rules — suy đoán, không có plugin thật phù hợp
Task 19 Husky pre-commit    — thêm tooling/dependency mới không ai yêu cầu
Task 20 DI cho Platform.ts  — trái kiến trúc singleton function đã chọn từ
                               Pass 29, không có lý do thật để đổi
Task 21 Tách entities/systems/services — không tìm thấy vi phạm cụ thể nào
Task 22 Test coverage rộng  — đã tăng test cho code mới/sửa (111/111, từ 108)
                               thay vì ép coverage % không có mục tiêu rõ
Task 23 E2E qua jsdom       — jsdom không chạy được Phaser/WebGL, không khả
                               thi kỹ thuật; e2e thật của dự án này vốn đã là
                               Playwright + browser thật (đã dùng xuyên suốt)
```

`tsc`/`vitest` (111/111, tăng từ 108)/`lint`/`build` sạch xuyên suốt. Verify browser thật nhiều vòng: nháy mắt khách đúng nhịp + đúng vị trí, sparkle rõ khi dỗ khách thành công, glow rõ khi nhặt crystal, mua/mặc phụ kiện màu đúng, phím debug 'P' hiện FPS, Journal round-trip 3 lần liên tiếp (kể cả khi khách đang giữa lượt ghé) không còn crash, reload giữ đúng state.

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

**✅ Đã làm (2026-09-03):** chạy đủ `npm test` (108/108, tăng từ 105 do 3 test mới thêm khi sửa bug bên dưới), `npm run lint`, `npm run build` — sạch cả 3. Sau đó chơi thật qua Playwright (không phải chỉ screenshot) đi hết cả 3 vòng lặp:

```text
Regression MVP:  Start → Cloudy (poke) → Guest (Sun) → Ingredients (kéo-thả thu thập)
                 → Craft (Cool Drizzle) → Soothe (3 lần) → Crystal → Decoration (Wind Chime)
                 → Photo → Journal → Save (localStorage) → Reload (state giữ nguyên)
Expanded loop:   2 lượt ghé Mặt Trời (visitCount 2, trust 8) → Station expansion (Tea Corner)
                 → Cloudy customization (Mây Trái Tim) → Aurora/Comet render + tương tác được
Social/cozy loop: Bướm → dỗ 3 lần → Paper Boat nhận lời nhắn đến → xác nhận → gấp → thả
```

Trong lúc chạy vòng lặp này, phát hiện và sửa **2 bug thật** (không phải feature mới — đúng phạm vi "gate cuối, không thêm feature, chỉ xác nhận đúng"):

**Bug 1 — Chụp ảnh khoảnh khắc bỏ qua điều kiện mở khoá chương:** `PhotoMomentSystem.capture()` gọi thẳng `journalSystem.unlockMemory()` mà không kiểm tra chương chứa memory đó đã "accessible" chưa (yêu cầu `requiredVisitCount`/`requiredTrustLevel`/`requiredSuccessfulTreatments`). Hậu quả thực tế: chỉ cần khách đạt PEACEFUL ở **lượt ghé đầu tiên**, đã có thể chụp ảnh và mở khoá luôn chương cuối (vd. chương 4 của Mặt Trời, vốn yêu cầu 6 lượt ghé + trust 40 + 3 lần trị liệu thành công) — phá hoàn toàn nhịp "Multiple memories" mà Expanded loop yêu cầu, và mâu thuẫn với chính review pacing đã ghi ở Pass 27. Sửa: thêm `JournalSystem.canUnlockMemory()`, dùng nó để chặn từ 2 phía — `StationScene.checkPhotoMoment()` không hiện icon ảnh nếu chương chưa accessible (không lãng phí lượt chụp), và `unlockMemory()` tự nó cũng từ chối unlock nếu chương chưa accessible (phòng vệ kép). Verify: bug tái hiện được bằng browser thật trước khi sửa (screenshot cho thấy chương 4 hiện "Hoàn thành" ngay lượt 1), sau khi sửa chương 4 đúng là vẫn khoá. Thêm 3 test mới (`JournalSystem.test.ts`, `PhotoMomentSystem.test.ts`) khoá lại hành vi đúng.

**Bug 2 — Rò rỉ event listener khi rời/quay lại StationScene (crash thật):** 6 class UI (`WeatherMixerUI`, `CrystalCounter`, `InventoryUI`, `StationAreaShopUI`, `DecorationShopUI`, `CloudyCosmeticsShopUI`) đăng ký listener thẳng vào `eventBus` singleton trong constructor nhưng **không bao giờ gỡ** khi bị destroy. Mỗi lần người chơi vào Journal rồi quay lại Station (một thao tác điều hướng hoàn toàn bình thường, không phải edge case) — StationScene cũ bị Phaser destroy toàn bộ GameObject, nhưng listener cũ trên `eventBus` singleton vẫn còn nguyên, tích luỹ thêm mỗi vòng. Phát hiện thật qua Playwright: sau đúng 1 lần Journal↔Station, nhấn phím debug `B` (nhặt 30 crystal liên tiếp) → crash `Cannot read properties of null (reading 'glTexture')` trong `CrystalCounter`; pha chế tiếp → crash `Cannot read properties of undefined (reading 'add')` trong `WeatherMixerUI`. Cả hai đều vì listener "chết" (thuộc container đã bị destroy, `this.scene` đã null) vẫn bị gọi. Sửa theo đúng pattern đã có sẵn trong `FloatingIngredient.ts` (lắng nghe `Phaser.GameObjects.Events.DESTROY` trên chính GameObject/panel để tự gỡ listener) — áp dụng cho cả 6 file. Verify: lặp lại đúng chuỗi thao tác gây crash trước khi sửa (tái hiện được), sau khi sửa chạy lại nguyên chuỗi + mở rộng thêm rất nhiều thao tác khác — 0 console error.

**Phát hiện, chưa sửa (cần quyết định thiết kế, không phải bug máy móc):** mọi recipe đều có `soothingValue: 30` cố định, nhưng độ rộng dải cảm xúc lại thu hẹp dần khi khách bình tĩnh hơn (`relaxed` rộng 20, `content` rộng 15, `peaceful` rộng 10 theo `emotions.json`). Với khách có trust đã tích luỹ đủ cao (giảm intensity khởi điểm), bước nhảy cố định 30 điểm có thể **nhảy qua** hẳn một dải cảm xúc hẹp mà không bao giờ "đứng" đúng vào đó — nghĩa là memory nào gắn `unlockedAtStage` đúng dải đó có thể **không bao giờ** tự nhiên mở khoá được cho khách đã quen (trust cao). Đã xác nhận bằng browser thật: lượt ghé thứ 2 của Mặt Trời (trust=8) nhảy thẳng CALMING → CONTENT → PEACEFUL, bỏ qua hẳn RELAXED/`SUN_UNEASY`, nên `sun_chapter_2`'s memory vẫn khoá dù chương đã accessible. Đây là vấn đề cân bằng nội dung (số liệu `soothingValue`/độ rộng dải, hoặc chọn cơ chế unlock khác cho các chương giữa), không phải lỗi code — cố tình **không tự sửa** vì đây là quyết định thiết kế, không nằm trong phạm vi "gate cuối, không thêm feature" của Pass 31.

**Chưa test được (giới hạn đã biết):** nhánh YouTube Playables thật (không có môi trường nhúng thật để chạy, đã ghi nhận từ Pass 29). Desktop + mobile (5 viewport, dùng lại phương pháp touch-event thật từ Pass 28) đã test đầy đủ, bao gồm cả Sổ Công Thức mới thêm sau Pass 30 — không lỗi ở viewport nào.

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

Phase 1-7 (Pass 1-31) giờ đã xong toàn bộ. Pass 27-30 (Balance, Mobile QA, YouTube Playables, Save Migration) và Pass 31 (Final QA release gate — chạy full regression thật qua cả 3 vòng lặp, phát hiện + sửa 2 bug thật: photo-moment bỏ qua điều kiện mở khoá chương, và rò rỉ eventBus listener gây crash sau khi vào/ra Journal) đều đã có mục "✅ Đã làm" chi tiết ở phần tương ứng phía trên. Ngoài ra còn bổ sung Sổ Công Thức (Recipe Book) sau khi phát hiện gap UX thật lúc chơi thử. MVP + toàn bộ Post-MVP core loop giờ đã là release candidate — nên tag baseline mới, ví dụ `v1.0.0`, trước khi cân nhắc bất kỳ Pass Post-MVP nào (32+) theo Product Direction Checkpoint bên dưới.

---

# Chuẩn bị phát hành (2026-09-17)

Người dùng xác nhận muốn đưa game vào "sẵn sàng phát hành" (`muốn làm sẵn sàng phát hành`). 3 quyết định phạm vi được hỏi trực tiếp qua AskUserQuestion:

- **Nền tảng phát hành:** Cả web lẫn YouTube Playables (kiến trúc `PlatformAdapter` đã có sẵn từ Pass 29 cho cả hai).
- **Art nhân vật khách (Sun/Moon/Little Star/Butterfly/Aurora/Comet):** Cần nâng cấp lên ảnh minh hoạ thật **trước khi** phát hành — cùng lý do đã áp dụng cho Cloudy/nav/ingredient trước đó (art vẽ-bằng-code không đạt chất lượng phát hành).
- **Độ phủ cảm xúc:** 5 ảnh/khách × 6 khách = 30 ảnh — phủ đủ toàn bộ 5 giai đoạn cảm xúc dùng chung (DISTRESSED→CALMING→RELAXED→CONTENT→PEACEFUL, đúng thứ tự tệ nhất→bình yên nhất theo `STAGE_EMOTION_BY_GUEST` trong `GuestSystem.ts`) thay vì chỉ làm 1 ảnh đại diện/khách — lựa chọn đầy đủ nhất trong các phương án được đưa ra.

## ✅ Tích hợp 30 ảnh minh hoạ khách vào game

Người dùng tự tạo prompt Gemini và lưu 30 ảnh vào `public/assets/guests/<guest>/` (đặt tên theo nhãn cảm xúc tiếng Việt, vd. `căng thẳng.png`, `ảnh gốc.png`). Xử lý và tích hợp:

**Xử lý ảnh (Python + Pillow, giống kỹ thuật đã dùng cho Cloudy/nav/ingredient trước đó):** flood-fill xoá nền từ 7 điểm neo (4 góc + 3 điểm giữa cạnh) với ngưỡng màu 28 — chỉ xoá pixel nền *liên thông* với các điểm neo đó nên giữ nguyên đúng phần nội dung gần-trắng nằm bên trong viền nét vẽ (quầng sáng mềm của Aurora/Comet ở trạng thái `peaceful`) mà không cần ảnh nguồn có sẵn kênh alpha. Sau đó crop theo bbox, resize còn tối đa 700px cạnh dài (Lanczos), lưu theo tên tiếng Anh đúng quy ước 5 giai đoạn (`distressed/calming/relaxed/content/peaceful.png`), xoá file gốc tên tiếng Việt. Verify: soi trực tiếp vài ảnh (Sun distressed/peaceful, Butterfly distressed, Comet peaceful) + composite thử lên nền xanh da trời để xác nhận không viền trắng sót lại quanh quầng sáng Aurora/Comet.

**`src/core/AssetRegistry.ts`** — `REGISTERED_ASSETS` (trống từ Pass 26, chủ đích chỉ chuẩn bị kiến trúc) giờ được điền tự động từ bảng `GUEST_EMOTION_STAGES` (guest → thư mục + 5 emotion id theo đúng thứ tự DISTRESSED→PEACEFUL) nhân với `STAGE_FILENAMES`. Thêm `getAllRegisteredAssets()` để `PreloadScene` lặp qua thay vì phải hardcode 30 dòng `this.load.image()`.

**`src/scenes/PreloadScene.ts`** — thêm 1 vòng lặp `getAllRegisteredAssets().forEach(...)` gọi `this.load.image(asset.key, asset.texturePath)` cho mọi asset đã đăng ký có `texturePath` — asset mới đăng ký sau này (guest thêm, decoration thật, ...) tự động được preload, không cần sửa file này nữa.

**`src/entities/Guest.ts`** — kiến trúc swap ảnh thật/procedural (`resolveEmotionAsset`/`hasLoadedTexture`, làm từ Pass 26) đã có sẵn nhưng còn 2 khoảng trống khiến ảnh thật sẽ hiển thị sai nếu bật lên nguyên trạng, sửa cả hai:
- **Thiếu scale ảnh:** `renderVisual()` gán texture thật vào `spriteImage` nhưng chưa từng gọi `.setScale()` — ảnh nguồn tới 700px sẽ hiển thị to gấp nhiều lần kích thước nhân vật đúng. Thêm `GUEST_SPRITE_TARGET_WIDTH = 150` (áng chừng bằng vùng nhân vật procedural cũ, vd. tia nắng Mặt Trời toả tới bán kính ~60) và `setScale(GUEST_SPRITE_TARGET_WIDTH / spriteImage.width)` — cùng pattern width-based đã dùng ở `Cloudy.ts`/`FloatingIngredient.ts`.
- **Mắt procedural chồng lên ảnh thật:** `addFace()` luôn vẽ 2 ellipse mắt bất kể có ảnh thật hay không — ảnh minh hoạ đã có mắt/biểu cảm riêng nên bị chồng mắt giả lên trên. Đổi thứ tự constructor (`addFace()` trước `renderVisual()` để mắt tồn tại trước khi cần ẩn/hiện), `renderVisual()` giờ tự `setVisible(false)` cho `leftEye`/`rightEye` khi dùng ảnh thật và `setVisible(true)` khi fallback procedural — đổi theo từng lần cảm xúc thay đổi (`updateEmotion()` gọi lại `renderVisual()`), không phải chỉ lúc khởi tạo. `scheduleNextBlink()` cũng được sửa để bỏ qua tween nháy mắt (nhưng vẫn tự lên lịch lại) khi mắt đang ẩn, tránh lãng phí tween chạy trên object vô hình.

**Sửa 1 test cũ sai giả định:** `AssetRegistry.test.ts` có test khẳng định `guest.sun.stressed` (SUN_STRESSED, giai đoạn CALMING của Sun) trả về entry *không có* `texturePath` — đúng khi registry còn trống, nhưng giờ sai vì registry đã có 30 entry thật. Sửa: đổi sang key chưa từng đăng ký thật (`guest.sun.nonexistent_stage`) để test đúng ý ban đầu ("fallback khi chưa đăng ký"), thêm test mới xác nhận 2 entry đã đăng ký (`SUN_STRESSED`, `COMET_BRILLIANT`) trả về đúng `texturePath`.

**Verify:** `tsc --noEmit`/`npx vitest run` (112/112, tăng từ 111 do test mới)/`npm run lint`/`npm run build` sạch cả 4. Playwright thật (chạy `npm run dev`, không chỉ đọc code): dùng phím debug có sẵn (`1`-`6` spawn từng khách, `Q` rời khách) spawn lần lượt cả 6 khách — xác nhận cả 6 hiện đúng ảnh minh hoạ giai đoạn DISTRESSED (soi zoom từng ảnh, đúng nhân vật + đúng biểu cảm buồn/căng thẳng ban đầu, không lệch scale, không mắt giả chồng lên), 0 console error/page error. Riêng Bé Sao Nhỏ (khách duy nhất dùng tương tác `rub` qua kéo-thả chuột thay vì cần pha chế công thức) — mô phỏng nhiều lượt vuốt để đẩy cảm xúc từ DISTRESSED tới PEACEFUL trong 1 lượt ghé, xác nhận ảnh chuyển từ vẻ lo lắng sang vẻ tự tin lấp lánh đúng lúc `currentEmotion` đổi, scale/vị trí giữ ổn định suốt quá trình đổi ảnh nhiều lần liên tiếp. Không test riêng từng ảnh còn lại trong số 30 ảnh (CALMING/RELAXED/CONTENT của các khách khác) qua browser vì cơ chế render dùng chung 1 đường code (`renderVisual()`) cho mọi giai đoạn của mọi khách — đã xác nhận đúng ở 2 đầu (DISTRESSED lúc spawn, PEACEFUL sau khi dỗ xong) là đủ tin cậy cho phần còn lại; toàn bộ 30 file đã xác nhận tồn tại đúng tên/đúng đường dẫn trước đó.

**Chưa làm (nằm ngoài phạm vi khách hàng art, thuộc phần còn lại của "chuẩn bị phát hành"):** chuẩn bị build/deploy cho web (GitHub Pages/itch.io — chưa kiểm tra `index.html` metadata, chưa có config build riêng), và bản build riêng cho YouTube Playables (thêm script SDK — việc **nộp** qua Google để có môi trường thật kiểm thử nhánh `YouTubePlayablesPlatformAdapter` nằm ngoài khả năng tự làm thay, đã ghi nhận từ Pass 29).

---

## ✅ Build config cho 2 nền tảng phát hành (web + YouTube Playables, 2026-09-17)

**Vấn đề phát hiện:** `dist/index.html` build ra trước đó dùng đường dẫn asset tuyệt đối từ gốc domain (`src="/assets/index-xxx.js"`, do Vite mặc định `base: '/'`) — chạy đúng nếu host ở domain gốc, nhưng **vỡ hoàn toàn** nếu host ở 1 thư mục con (GitHub Pages project site dạng `user.github.io/ten-repo/`, hoặc thư mục mà itch.io gán riêng cho từng game) vì trình duyệt sẽ tìm asset ở `domain-gốc/assets/...` thay vì `domain-gốc/ten-repo/assets/...`. Đã grep toàn bộ `src/` xác nhận code game không tự dùng đường dẫn tuyệt đối nào (`load.json`/`load.image` đều dùng đường dẫn tương đối như `'data/guests.json'`) nên sửa an toàn, chỉ cần đổi 1 chỗ cấu hình.

**`vite.config.ts`** — thêm `base: './'` (đường dẫn asset tương đối, áp dụng cho mọi lần build) — portable cho cả GitHub Pages project site, itch.io, lẫn nhúng trong YouTube Playables (không biết trước mount path). Đồng thời thêm plugin `injectPlayablesSdk` dùng `transformIndexHtml` để chèn thẻ `<script src="https://www.youtube.com/game_api/v1">` (URL đã verify từ Pass 29) — nhưng **chỉ khi build ở `--mode playables`**, tránh phải duy trì 2 file `index.html` gần giống hệt nhau (giữ DRY). Thẻ SDK được chèn **ngay trước** thẻ `<script type="module">` của game (không phải cuối `<head>`) — cố ý, vì script thường chạy đồng bộ đúng vị trí lúc parse HTML còn script `type="module"` luôn bị hoãn tới sau khi parse xong toàn trang, nên thứ tự này đảm bảo `window.ytgame` tồn tại trước khi `Game.ts`'s `initPlatformAdapter()` đọc nó, bất kể thứ tự khác trong `<head>` sau này thay đổi thế nào.

**`package.json`** — thêm script `build:playables` (`tsc --noEmit && vite build --mode playables`, output riêng `dist-playables/`) cạnh `build` cũ (`dist/`, không có thẻ SDK). Dùng `--mode` có sẵn của Vite thay vì set biến môi trường thủ công (`VITE_TARGET=...`) — tránh phải thêm dependency `cross-env` chỉ để 1 script chạy được trên cả PowerShell lẫn bash.

**`eslint.config.js`** — thêm `dist-playables` vào danh sách `ignores` (cạnh `dist` cũ) — thiếu bước này khiến `npm run lint` cố lint luôn bundle đã minify, ra hơn 4000 lỗi giả từ 1 dòng code nén.

**`.gitignore`** — thêm `dist-playables`.

**`README.md`** — trước đó chỉ có đúng 1 dòng tiêu đề, không có gì. Viết lại đầy đủ: lệnh dev/test/build, giải thích 2 bản build khác nhau đúng 1 chỗ (thẻ SDK), hướng dẫn deploy GitHub Pages/itch.io, ghi chú việc nộp YouTube Playables cần môi trường thật của Google (không tự làm thay được).

**Verify:** `tsc`/`vitest` (112/112)/`lint`/`npm run build`/`npm run build:playables` sạch cả 5. Xác nhận bằng cách đọc trực tiếp `dist/index.html` (đường dẫn `./assets/...`, không có thẻ SDK) và `dist-playables/index.html` (có đúng 1 thẻ SDK, đúng thứ tự trước script module) — không phải đoán, đọc file build ra thật. Playwright thật qua `vite preview` phục vụ `dist/` — 0 console error, 0 page error, 0 request lỗi, game render đầy đủ (Cloudy, nav, mixer). Quan trọng nhất: **giả lập đúng kịch bản rủi ro thật** — copy `dist/` vào 1 thư mục con (`/subpath-test/repo-name/`), serve bằng static server riêng, mở đúng URL có subpath — game vẫn render đầy đủ, 0 request lỗi, xác nhận `base: './'` thật sự giải quyết đúng vấn đề GitHub Pages project site (không chỉ đọc HTML mà đoán là đúng).

**Chưa làm — cần quyết định của người dùng trước khi làm tiếp (không phải giới hạn kỹ thuật):** chọn host web cụ thể (GitHub Pages hay itch.io hay khác) và có muốn tự động hoá deploy qua GitHub Actions không — 2 câu hỏi này ảnh hưởng tới hạ tầng dùng chung (CI, secrets, domain công khai) nên chủ động hỏi lại thay vì tự quyết.

**→ Người dùng chọn (2026-09-17): GitHub Pages + tự động qua GitHub Actions.**

## ✅ GitHub Actions auto-deploy lên GitHub Pages (2026-09-17)

**`.github/workflows/deploy.yml`** (mới) — trigger khi push lên `main` (+ `workflow_dispatch` để chạy tay từ tab Actions khi cần). Job `build`: checkout → setup-node (`lts/*`, cache npm) → `npm ci` → `npm run lint` → `npm test` → `npm run build` → upload `dist/` làm Pages artifact. Job `deploy` (phụ thuộc `build` qua `needs`): `actions/deploy-pages@v4`. Dùng cách deploy chính thức hiện tại của GitHub (Pages source = "GitHub Actions", quyền `id-token: write`/`pages: write`) thay vì cách cũ push lên nhánh `gh-pages` — không cần Personal Access Token, không cần thêm secret nào, chỉ dùng `GITHUB_TOKEN` mặc định. Lint + test chạy trước build nên 1 PR làm hỏng game sẽ chặn deploy tự động thay vì đẩy bản lỗi lên production — cùng tinh thần "tests pass + build pass" đã áp làm gate ở Pass 31, giờ áp dụng liên tục thay vì chỉ lúc release thủ công.

**`README.md`** — cập nhật mục GitHub Pages: giải thích luồng tự động, và bước bật 1 lần thủ công bắt buộc (repo Settings → Pages → Source → "GitHub Actions") — bước này cần quyền admin trên GitHub, không thể tự làm thay qua Bash/git được, ghi rõ để người dùng tự bật.

**Verify:** `.github/workflows/deploy.yml` parse hợp lệ (test bằng PyYAML — 1 điểm khác biệt vô hại đã xác nhận: PyYAML theo YAML 1.1 đọc key `on:` thành boolean `true` do quirk lịch sử, nhưng GitHub tự xử lý `on:` như 1 keyword riêng nên không ảnh hưởng thực tế, đây là hiện tượng đã biết rộng rãi chứ không phải lỗi file). `tsc`/`vitest` (112/112)/`lint`/`npm run build` chạy lại sạch cả 4 sau khi thêm workflow (không có gì trong code bị ảnh hưởng, thuần thêm file mới). **Chưa/không thể verify:** workflow chạy thật trên GitHub Actions — cần push lên `main` thật + người dùng tự bật Pages source trong Settings (quyền admin, ngoài khả năng tự làm thay); tự làm việc này thay người dùng (push lên `main`, đổi Settings) là hành động ảnh hưởng hạ tầng dùng chung nên không tự ý làm, chỉ chuẩn bị sẵn để người dùng merge khi sẵn sàng.

**Cập nhật (2026-09-17):** repo ban đầu private nên GitHub Pages miễn phí bị chặn ("Upgrade or make this repository public to enable Pages") — hỏi lại người dùng, chọn chuyển repo sang Public (tự làm trong Settings, không tự đổi visibility thay). Sau khi người dùng merge PR vào `main`, kiểm tra qua `gh run view --json` xác nhận cả 2 job (`build`: lint+test+build, `deploy`) đều `"conclusion":"success"`. Verify thêm bằng Playwright thật trên URL production (`https://hnguyen2610.github.io/Floating-Rest-Stop/`, lấy qua `gh api repos/.../pages`) — không chỉ tin status "success" của Actions, mà mở đúng URL live: 0 console error, 0 page error, 0 request lỗi, game render đầy đủ. Deploy tự động lên GitHub Pages **hoàn tất, đã chạy thật, đã xác nhận bằng browser thật trên production.**

---

## 🐛 Bug thật phát hiện qua phản hồi người test (2026-09-17)

Người dùng gửi lại 2 nhận xét từ một người test khác (chat screenshot):

1. *"nhân vật đứng xa nhau quá" / "nhân vật hơi cứng kiểu ít tương tác với nhau"* — Mây Bông và khách đứng cách nhau khá xa, cảm giác tĩnh, ít tương tác.
2. *Chi tiết hơn về lỗi pha chế:* kéo 2 "Mảnh Cầu Vồng" (sai công thức) vào bát trộn, ấn "CHẾ TẠO" → báo sai, nhưng nguyên liệu **không biến mất khỏi bát**, cũng không biết cách gỡ ra để đổi nguyên liệu khác — *"như kiểu ko sửa dc luôn"*.

### ✅ Đã sửa — Bát trộn "kẹt" sau khi chế tạo sai (bug mất nguyên liệu)

**Nguyên nhân thật (đọc code xác nhận, không chỉ theo lời tả):** `WeatherSystem.tryCraft()` khi không khớp công thức nào chỉ `return false`, **không dọn** `mixerContents` — nguyên liệu nằm lì trong bát. Cách gỡ từng cái ra (chạm vào icon nguyên liệu trong bát → `removeFromMixer(index)`) có tồn tại trong code nhưng **không hề trả nguyên liệu về kho** (`IngredientSystem`) — chạm vào coi như mất luôn, chứ không phải "gỡ ra để đổi". Council: `WeatherMixerUI` constructor nhận sẵn tham số `_ingredientSystem` (đặt tên gạch dưới = cố tình đánh dấu không dùng) — có vẻ được truyền vào từ trước để làm đúng việc này nhưng chưa từng nối dây.

Sửa 2 chỗ trong `src/ui/WeatherMixerUI.ts`:
- Bỏ dấu `_` (nhận thật, lưu làm field `private ingredientSystem`).
- `handleCraft()`: khi `tryCraft()` trả `false`, trả từng nguyên liệu đang có trong bát về kho (`ingredientSystem.collect(id)`) rồi `weatherSystem.clearMixer()` — bát tự dọn sạch để chơi lại ngay, đúng kỳ vọng của người test ("nó sai" thì nguyên liệu phải biến đi), thay vì bắt người chơi tự biết cách gỡ.
- Tap-để-gỡ từng ô (dùng khi muốn đổi 1 nguyên liệu trước khi ấn chế tạo) cũng sửa để gọi `ingredientSystem.collect(removed)` — không còn mất nguyên liệu khi gỡ tay nữa.

**Verify:** `tsc`/`vitest` (112/112)/`lint`/`build` sạch. Playwright thật tái hiện đúng kịch bản: phím debug `X` nạp thẳng "Nắng Ấm + Mảnh Cầu Vồng" vào bát (cặp không khớp công thức nào — đảm bảo sai), chụp ảnh trước/sau khi ấn CHẾ TẠO — xác nhận bát trống trở lại **và** kho đồ ở góc trái tăng đúng +1 Nắng Ấm +1 Mảnh Cầu Vồng (không mất, không bug ẩn), 0 console error.

### ✅ Đã sửa — Khoảng cách nhân vật + cử chỉ tương tác (2026-09-17)

Hỏi lại người dùng mức độ muốn sửa — chọn **"Xích lại gần + thêm cử chỉ tương tác nhẹ"** (không chỉ đổi toạ độ).

**Xích lại gần:** 4 chỗ trong `StationScene.ts` từng lặp lại `GAME_WIDTH * 0.24` / `GAME_HEIGHT * 0.42` làm mốc neo khách (vị trí spawn khách trong `handleGuestArrived`, `GuestHintUI`, điểm rơi `HappinessCrystal`, điểm rơi `PhotoMomentIcon`) — gộp thành 2 field dùng chung `guestAnchorX`/`guestAnchorY`, và đổi `guestAnchorX` từ `0.24` lên `0.37` (khoảng cách ngang tới Mây Bông giảm từ 333px xuống ~166px). Gộp thành field chung còn có tác dụng phụ: từ giờ đổi vị trí khách chỉ cần sửa 1 chỗ, không phải nhớ đồng bộ 4 nơi như trước (rủi ro thật nếu chỉ đổi 1-2 chỗ mà quên chỗ còn lại — icon rơi/hint box sẽ lệch khỏi khách).

**Cử chỉ tương tác nhẹ:** `Cloudy.ts` thêm `playGlanceAtGuest(towardLeft: boolean)` — nghiêng nhẹ ±5° rồi về lại 0° (`Sine.easeOut` → `Sine.easeInOut`, tổng ~640ms). Chỉ tween `angle`, **không đụng `x`/`y`** — vì `update()` của Cloudy gán lại `this.x`/`this.y` từ `baseX`/`baseY` mỗi frame (trôi nổi lên xuống/qua lại), tween nhắm vào 2 thuộc tính đó sẽ bị ghi đè ngay frame sau, mất tác dụng ngay lập tức (đã tự phát hiện khi đọc lại `update()` trước khi viết, không phải sau khi test lỗi). Không có ảnh minh hoạ hướng nhìn riêng (chỉ có idle/happy/poke/sleepy) nên dùng nghiêng thân thay cho đổi hướng mắt — đơn giản, không cần thêm ảnh mới. `StationScene.ts` thêm 1 timer lặp mỗi 9s, chỉ kích hoạt khi đang có khách (`guestSystem.getCurrentGuest()`), hướng nghiêng tính từ vị trí khách thật (`guestAnchorX < GAME_WIDTH/2`) — không hardcode, tự đúng nếu sau này đổi layout.

**Verify:** `tsc`/`vitest` (112/112)/`lint`/`build` sạch. Playwright thật: spawn khách, chụp ảnh xác nhận khoảng cách mới gần hơn rõ rệt, hint box không đè lên Mây Bông; đợi qua mốc 9s, chụp ảnh thứ 2 xác nhận Mây Bông đang nghiêng người về phía khách (so sánh trực quan với ảnh đầu) — cử chỉ chạy đúng, không lỗi console.

---

# ✅ Hướng dẫn chơi cho người mới (2026-09-17)

Người dùng yêu cầu thêm hướng dẫn chơi. Hỏi lại kiểu hướng dẫn muốn làm — chọn **"Hiện 1 lần khi mở game lần đầu + nút ❓ mở lại sau"** (không phải gợi ý-theo-từng-bước phức tạp hơn, không phải chỉ-có-nút-bấm-thụ-động).

**Phạm vi nội dung:** cố tình chỉ giải thích **vòng lặp chính** (khách đến → đọc ô chữ cần gì → pha đúng 2 nguyên liệu → CHẾ TẠO → chạm vào khách) + trỏ tới Sổ Công Thức (📖) cho chi tiết công thức/khách dùng vuốt tay — không liệt kê hết mọi hệ thống (trang trí, mở rộng trạm, Mây Bông shop, nhật ký...), vì các nút đó đã tự giải thích qua nhãn chữ + khám phá dần, nhồi hết vào 1 bảng đầu game sẽ vi phạm đúng tinh thần "gợi ý khi cần, không nhồi nhét" mà Sổ Công Thức đã theo.

**Vì sao đi qua SaveProvider thay vì `localStorage` trực tiếp:** cờ "đã xem hướng dẫn chưa" cần đúng-1-lần-duy-nhất trên mỗi người chơi, không phải mỗi phiên — nhưng game này chạy trên cả web (localStorage qua `LocalSaveProvider`) lẫn YouTube Playables (cơ chế lưu hoàn toàn khác qua `YouTubePlayablesSaveProvider`, xem Pass 29) — ghi thẳng `localStorage` sẽ **không hoạt động trên Playables**, đúng loại lỗi ẩn chỉ lộ ra khi nộp thật. Nên cờ này đi qua đúng kiến trúc `SaveData`/`normalizeSaveData()`/`SaveSystem` sẵn có, giống mọi state khác.

Files:

```text
src/systems/TutorialSystem.ts (mới)      — seen/markWelcomeSeen()/restoreHasSeenWelcome(), model theo DayNightSystem
                                            (system nhỏ nhất có thể, không viết thêm gì thừa cho đúng 1 boolean)
src/systems/TutorialSystem.test.ts (mới) — 3 test: mặc định chưa xem, đánh dấu xem + chỉ emit event 1 lần dù gọi 2 lần,
                                            khôi phục từ save
src/ui/WelcomeGuideUI.ts (mới)           — panel Container theo đúng pattern RecipeBookUI (backdrop/title/close/toggle),
                                            nhưng nội dung cố định (không phải danh sách sinh từ data) nên không cần
                                            vòng lặp render nhiều dòng
src/core/EventBus.ts                     — thêm 'tutorial:seen': undefined
src/services/save/SaveProvider.ts        — SaveData thêm hasSeenTutorial: boolean
src/services/save/saveMigration.ts       — normalizeSaveData() default hasSeenTutorial: false
src/services/save/saveMigration.test.ts  — cập nhật 2 test toEqual đầy đủ trường (default-save, well-formed-passthrough)
src/systems/SaveSystem.ts                — thêm tutorialSystem vào SaveableSystems, gather/apply/autosave-trigger
src/systems/SaveSystem.test.ts           — thêm tutorialSystem vào fixture dùng chung, assert cả 2 chiều save/restore
src/core/GameSystems.ts                  — khởi tạo + expose tutorialSystem
src/scenes/StationScene.ts               — instantiate WelcomeGuideUI, nút ❓ mới (drawHelpButton, cạnh cụm
                                            mute/settings/day-night góc trên phải), tự show() nếu chưa từng xem
```

**Verify:** `tsc`/`vitest` (115/115, tăng từ 112 — 3 test mới)/`lint`/`build` sạch cả 4. Playwright thật, đủ 4 bước của đúng kịch bản người chơi mới: (1) vào game lần đầu (localStorage trống) → bảng tự hiện đúng nội dung; (2) bấm "Bắt đầu thôi!" → đóng lại, về gameplay bình thường; (3) đợi qua debounce autosave rồi **reload trang thật** → bảng **không** tự hiện lại (xác nhận cờ đã lưu đúng qua SaveProvider, không phải chỉ đóng tạm trong phiên); (4) bấm nút ❓ → mở lại đúng bảng đó bất cứ lúc nào. 0 console error xuyên suốt cả 4 bước.

---

# ✅ Full màn hình (web + điện thoại xoay ngang) (2026-09-18)

Người dùng yêu cầu "thiết kế full màn hình cho web và cho cả điện thoại xoay ngang". Đi qua đầy đủ quy trình brainstorming (spec → duyệt → làm thẳng, người dùng chọn bỏ qua bước viết plan riêng: *"làm luôn giúp tôi, không cần viết plan"*) — spec đầy đủ ở `docs/superpowers/specs/2026-09-18-fullscreen-responsive-design.md`. Tóm tắt quyết định qua 2 câu hỏi:

1. **"Full màn hình" nghĩa là gì:** lấp đầy tuyệt đối, chấp nhận crop rìa tuỳ máy (không phải chỉ co giãn giữ tỉ lệ kiểu cũ).
2. **Điện thoại đang dọc:** hiện overlay nhắc xoay ngang, không thiết kế layout dọc riêng.

## Đổi cơ chế scale — `Phaser.Scale.FIT` → `ENVELOP`

`src/core/Game.ts` đổi 1 dòng config — giữ nguyên độ phân giải nội bộ 1280×720 (không đụng vào bất kỳ toạ độ pixel nào có sẵn trong hàng chục file), chỉ đổi cách Phaser co giãn: `ENVELOP` phóng canvas phủ kín khung nhìn thật, cắt bớt trục thừa ra thay vì để viền trống như `FIT`.

## Vùng an toàn (safe zone) — kéo UI rìa vào 80px

Thêm `SAFE_ZONE_MARGIN = 80` vào `GameConfig.ts`. Vì `ENVELOP` cắt theo tỉ lệ máy thật (điện thoại ngang hiện đại thường *rộng hơn* 16:9 → cắt trên/dưới; máy tính bảng/cửa sổ hẹp thường *hẹp hơn* → cắt trái/phải), rà lại và dời **mọi** UI từng nằm sát rìa khung 1280×720 vào trong ít nhất 80px:

```text
src/scenes/StationScene.ts — Title, CrystalCounter, cụm nút mute/settings/
                              day-night/help (❓ mới từ pass trước), nút
                              Sổ Công Thức, WeatherMixerUI, InventoryUI,
                              cả 2 cụm BottomNavUI
src/scenes/JournalScene.ts — Title, nút "← Quay lại", nút "🎀 Trang trí",
                              dải sticker dưới cùng, VÀ (phát hiện qua
                              Playwright thật, không phải chỉ đọc code)
                              lưới chương/thẻ ký ức: leftMargin cũ
                              (GAME_WIDTH*0.1=128) không tính tới việc thẻ
                              ký ức đầu tiên còn lệch trái thêm 50px nữa
                              (nửa bề rộng thẻ) — ảnh chụp thật cho thấy
                              thẻ "01 Lần Ghé Đầu Tiên" bị cắt mất một
                              phần dù con số 128 tưởng chừng đã đủ margin;
                              sửa thành SAFE_ZONE_MARGIN+100. Tương tự
                              rowStartY cũ (115) đặt tên khách ở y=60,
                              đè lên đúng chỗ nút back/title mới dời tới
                              — sửa thành SAFE_ZONE_MARGIN+120
```

## Vượt phạm vi tỉ lệ mục tiêu — `ScaleClamp` (phát hiện + sửa qua test thật)

Spec ban đầu chấp nhận "ngoài dải [1.5, 2.2] có thể crop vào phần đệm, nhưng nút bấm vẫn phải bấm được". **Test thật bằng Playwright lộ ra điều này không đúng như kỳ vọng:** giả lập iPad ngang (1024×768, tỉ lệ 1.33) cho thấy `ENVELOP` cắt tới ~160px mỗi bên — gấp đôi ngân sách 80px — và **mất hẳn cả nút** (nút "Nhật ký" biến mất hoàn toàn, cụm mute/settings/day-night/help biến mất hoàn toàn), không phải chỉ mất viền đệm quanh nút như dự tính.

Sửa bằng `src/ui/ScaleClamp.ts` (mới) — vì Phaser không có sẵn chế độ "envelop nhưng giới hạn mức crop tối đa", tự kẹp kích thước phần tử `#app` (cha của canvas) về đúng dải tỉ lệ mà mức crop không bao giờ vượt quá 80px (`MIN_RATIO=1.56`, `MAX_RATIO=2.2` — 2 số này giải trực tiếp từ công thức "crop mỗi bên = 80px" cho từng hướng, không phải số áng chừng). `ENVELOP` vẫn phủ kín đúng như thiết kế, chỉ là phủ kín cái khung ĐÃ ĐƯỢC KẸP đó — máy có tỉ lệ ngoài dải sẽ thấy 1 viền màu nền rất mỏng ở 2 bên thay vì cắt mất nút, giống hệt tinh thần `FIT` cũ nhưng hẹp hơn nhiều. `index.html` thêm `display:flex;align-items:center;justify-content:center` cho `body` để canh giữa khung đã kẹp. `Game.ts` gọi `installScaleClamp()` ngay sau khi tạo `game`, cùng chỗ với `installOrientationGuard()`.

## Overlay "xoay ngang điện thoại" — `OrientationGuard`

`src/ui/OrientationGuard.ts` (mới) — module độc lập, KHÔNG gắn vào `Platform.ts`/`PlatformAdapter` sẵn có (xoay màn hình là mối quan tâm khác hẳn vòng đời pause/resume mà hệ thống đó mô hình hoá, và YouTube Playables không có khái niệm tương đương cho "hãy xoay máy"). Theo dõi `matchMedia('(pointer: coarse)')` (đúng thiết bị cảm ứng thật, không nhầm với cửa sổ desktop bị co hẹp) **và** `matchMedia('(orientation: portrait)')` cùng lúc — cả 2 đúng thì phủ 1 overlay HTML/CSS thuần (không phải Phaser GameObject, nên hoạt động bất kể scene nào đang chạy) + gọi `game.loop.sleep()`; hết đúng 1 trong 2 thì ẩn + `wake()`.

**Giới hạn đã biết, chấp nhận:** `game.loop.sleep()/wake()` không đếm tham chiếu — nếu tab bị ẩn (Platform's onPause) ĐỒNG THỜI máy đang dọc, `OrientationGuard` và `Platform` có thể giẫm lên nhau (1 bên gọi `wake()` trong khi bên kia vẫn muốn ngủ). Cùng kiểu đơn giản hoá đã chấp nhận ở các chỗ gọi `sleep()/wake()` khác có sẵn trong code — không tự ý làm phức tạp hơn (thêm cơ chế đếm tham chiếu) cho 1 tình huống hiếm (vừa ẩn tab vừa đang cầm máy dọc cùng lúc).

## CSS/HTML bổ sung

`index.html`: `viewport-fit=cover` vào meta viewport (để iOS Safari cho phép nội dung tràn tới sau notch/thanh home thay vì tự chừa viền), `padding: env(safe-area-inset-*)` cho `#app` (phòng vệ tiêu chuẩn, không có tác dụng gì trên máy không notch nên không rủi ro).

**Verify:** `tsc`/`vitest` (115/115)/`lint`/`npm run build`/`npm run build:playables` sạch cả 5. Playwright thật qua ma trận 5 kích thước màn hình (iPhone SE ngang 667×375, iPhone 14 ngang 844×390, laptop 1366×768, iPad ngang 1024×768, ultra-wide 2560×1080) + 2 test cảm ứng riêng (dọc máy thật → overlay hiện + `sleep()`; xoay ngang → overlay ẩn + `wake()`; cửa sổ desktop hẹp/dọc giả — xác nhận **không** hiện overlay nhầm). Không chỉ chụp ảnh — còn bấm thật vào từng nút đã dời vị trí (Sổ Công Thức, Nhật ký) trên 2 viewport đại diện (iPhone 14 ngang, iPad ngang đã kẹp tỉ lệ) và xác nhận đúng hành vi (mở đúng panel/chuyển đúng scene), không chỉ nhìn thấy đúng vị trí. Chính pha test-thật-bằng-ảnh-chụp này phát hiện ra 2 vấn đề thật không thấy được nếu chỉ tính toán bằng tay (mất nút hoàn toàn ở iPad ngang trước khi có `ScaleClamp`; thẻ ký ức + tên khách đầu tiên bị cắt/đè trong Journal) — đúng tinh thần xuyên suốt cả phiên làm việc: verify bằng browser thật, không chỉ tin vào suy luận trên giấy.

---

# Nâng cấp visual (2026-09-18) — bắt đầu chuỗi 4 đợt

Người dùng: *"tôi muốn làm game đẹp hơn nữa, game này rất quan trọng visual"*. Rà lại code xác nhận 5 mảng còn "vẽ bằng code" (chưa lên ảnh minh hoạ): nền tảng mây (3 ellipse phẳng), 5 món trang trí (kiến trúc swap đã có sẵn từ trước nhưng chưa từng có ảnh đăng ký), 2 icon nhặt được (pha lê, máy ảnh), khung UI (panel/nút), và hiệu ứng thời tiết theo công thức (field `visualEffect` tồn tại trong data nhưng chưa từng được code nào đọc — hiệu ứng thực tế hiện tại giống hệt nhau cho mọi công thức). Người dùng chọn làm **cả 4** — tách thành 4 đợt tuần tự thay vì 1 đặc tả gộp (mỗi mảng khác hẳn nhau về phong cách/rủi ro/effort, giống cách khách và Cloudy từng được tách thành 2 đợt riêng trước đó): (1) nền tảng mây, (2) trang trí + icon nhặt, (3) khung UI, (4) hiệu ứng thời tiết.

## Đợt 1 — Nền tảng mây: brainstorm xong, đang chờ ảnh

Đi qua brainstorming: chọn "đảo nhỏ trôi nổi (cỏ/gỗ/đá) trên nền mây" (không phải mây thuần), chọn "to hơn, chiếm nhiều màn hình hơn" so với ellipse cũ (420×140). Đã viết prompt Gemini đưa cho người dùng (đính kèm `cloudy/default/idle.png` làm ảnh tham chiếu phong cách) — **đang chờ người dùng tạo ảnh**, chưa có file thật.

**✅ Đã chuẩn bị kiến trúc code trước khi có ảnh** (cùng cách đã làm với Guest/Decoration/Cloudy — viết code sẵn sàng nhận ảnh, không chờ ảnh xong mới viết code):

- `StationScene.ts` `drawPlatform()` — check `this.textures.exists('platform')`, có thì `add.image()` (scale theo `PLATFORM_TARGET_WIDTH = 640`, ~1.5x kích thước ellipse cũ theo đúng yêu cầu "to hơn"), không thì fallback 3 ellipse cũ y nguyên. Chưa cần qua `AssetRegistry` vì chỉ có 1 platform duy nhất (không phải nhiều biến thể như khách/trang trí).
- **Phát sinh thêm khi đang làm đợt này:** người dùng yêu cầu bổ sung "làm cho cả ngày/đêm" cho nền tảng — xem mục ngày/đêm bên dưới, `drawPlatform()` đã có sẵn `platformTextureKey()` chọn `platform-night` nếu tồn tại và đang là đêm, nên khi có đủ 2 ảnh (ngày + đêm) chỉ cần thả file + đăng ký preload, không cần sửa code lần nữa.

## ✅ Ngày/đêm chuyển theo giờ thật (2026-09-18)

Người dùng yêu cầu thêm: *"sẽ chuyển ngày đêm theo giờ hiện tại"* — đảo ngược hẳn quyết định thiết kế cũ ở Pass 21 (nút ☀️/🌙 thủ công, lý do ban đầu: "no time pressure"). Hỏi lại 2 điểm trước khi sửa (ảnh hưởng thật đến gameplay, không chỉ đổi giao diện):

1. **Nút bật ngày/đêm thủ công:** người dùng chọn **bỏ hẳn**, hoàn toàn theo giờ thật.
2. **Điều kiện Aurora yêu cầu đang là đêm** (`RareGuestSystem.isAuroraAvailable()`): người dùng chọn **giữ nguyên** — gặp Aurora vẫn cần quay lại đúng lúc trời tối thật (giống Animal Crossing), không nới lỏng điều kiện.

**`src/systems/DayNightSystem.ts`** — viết lại hoàn toàn: bỏ `toggle()`/`restoreIsNight()`, `isNight()` giờ tính từ đồng hồ thật (`new Date().getHours()`, khung giờ `DAY_START_HOUR=6`/`NIGHT_START_HOUR=18` mới thêm vào `GameConfig.ts` — giờ cố định đơn giản, không phải sunrise/sunset theo vị trí địa lý vì quá dư thừa cho 1 game cozy). Đồng hồ được tiêm qua constructor (`now: () => Date`, mặc định `() => new Date()`) để test được xác định (không phụ thuộc giờ thật lúc chạy CI). Thêm `refresh()` — so sánh với giá trị lần trước, chỉ bắn `daynight:changed` khi thật sự đổi (không bắn liên tục mỗi lần gọi). Thêm `debugCycleOverride()` dev-only (phím tắt `N`, đã có sẵn gate `import.meta.env.DEV` từ trước) — cycle qua đêm → ngày → về giờ thật, để dev xem trước cả 2 giao diện mà không cần chỉnh đồng hồ hệ điều hành thật.

**Dọn `isNight` khỏi save data** — vì giờ luôn tính lại từ đồng hồ thật, không còn là trạng thái cần lưu nữa (khác hẳn ý nghĩa cũ khi nó là lựa chọn thủ công của người chơi): xoá field `isNight` khỏi `SaveProvider.ts`/`saveMigration.ts`/`SaveSystem.ts` (gather/apply/autosave-trigger) và toàn bộ test liên quan — save cũ có sẵn field này trong localStorage vẫn đọc được bình thường (`normalizeSaveData` chỉ đọc field nó biết, field lạ bị bỏ qua an toàn, không cần bước migrate).

**`StationScene.ts`** — bỏ hẳn `drawDayNightToggle()` và field `dayNightButton` (nút ☀️/🌙 vật lý biến mất khỏi UI); nút ❓ dời vào giữa ô trống nút để lại (từ `GAME_WIDTH-142` sang `GAME_WIDTH-126`) cho cụm góc trên phải không bị lệch. Thêm timer lặp mỗi 60s gọi `dayNightSystem.refresh()`, và lắng nghe `daynight:changed` (`handleDayNightChanged`) để `redrawSky()` + `updatePlatformForDayNight()` + `syncAmbience()` — phiên chơi để mở xuyên qua mốc 6h/18h thật sẽ tự cập nhật, không cần tải lại trang.

**Verify:** `tsc`/`vitest` (116/116, tăng từ 115)/`lint`/`build` sạch. `DayNightSystem.test.ts` viết lại hoàn toàn dùng đồng hồ giả (`atHour(h)` helper) — test đúng biên giờ (5h59 vs 6h vs 17h59 vs 18h), test `refresh()` chỉ bắn event khi thật sự đổi (không bắn trùng), test cycle debug override. Playwright thật: phím `N` cycle qua cả 3 trạng thái (đêm ép buộc → sky chuyển navy đậm; ngày ép buộc → sky pastel; về giờ thật → khớp đúng giờ thật lúc chạy test), chụp ảnh xác nhận màu sky đổi đúng ở cả 3 bước, cụm nút góc trên phải không còn khoảng trống nơi nút cũ từng đứng, 0 console error.

## ✅ Đợt 1 hoàn tất — Tích hợp ảnh nền tảng mây (ngày + đêm) (2026-09-18)

Người dùng gửi 2 ảnh (`platform_day.png`, `platform_night.png`) đúng theo prompt đã viết — chất lượng đúng như mong đợi (đảo cỏ/đá/gỗ trên nền mây, bản đêm có đom đóm phát sáng), khớp phong cách Mây Bông.

**Xử lý ảnh:** cùng kỹ thuật flood-fill xoá nền đã dùng xuyên suốt (ngưỡng màu 28, 7 điểm neo góc/cạnh) — verify riêng bằng composite thử lên nền xanh da trời (ngày) và xanh navy (đêm) để xác nhận không viền trắng quanh các đốm sáng nhỏ (rủi ro cao nhất, giống bài học từ quầng sáng Aurora/Comet trước đây). Resize còn tối đa 900px cạnh dài (rộng hơn mức 700px dùng cho khách, vì đây là background lớn nhất). Lưu vào `public/assets/platform/{day,night}.png`.

**Tích hợp:** `PreloadScene.ts` thêm 2 dòng `this.load.image('platform', ...)`/`this.load.image('platform-night', ...)` trực tiếp (không qua `AssetRegistry`, đúng như đã thiết kế từ đầu vì chỉ có 1 platform). Không cần sửa gì thêm ở `StationScene.ts` — kiến trúc `drawPlatform()`/`platformTextureKey()`/`updatePlatformForDayNight()` đã viết sẵn từ lúc làm hệ thống ngày/đêm, chỉ cần thả file đúng tên là chạy được ngay (đúng đề bài đặt ra: chuẩn bị kiến trúc trước, điền ảnh sau).

**Verify:** `tsc`/`vitest` (116/116)/`lint`/`build`/`build:playables` sạch cả 5. Playwright thật: ảnh đảo hiện đúng cả bản ngày lẫn đêm (ép qua phím debug `N`), Mây Bông + khách (thử với Mặt Trời) đứng tự nhiên trên mặt cỏ của đảo — không cần chỉnh lại toạ độ Cloudy/khách/nav như đã lo trước đó, `PLATFORM_TARGET_WIDTH=640` khớp vừa vặn với bố cục hiện có ngay từ lần thử đầu. 0 console error.

**Còn lại của chuỗi 4 đợt nâng cấp visual (lúc đó):** (2) trang trí + icon nhặt được, (3) khung UI, (4) hiệu ứng thời tiết riêng từng công thức — chưa bắt đầu.

---

## ✅ Đợt 2 hoàn tất — Trang trí + icon nhặt được (2026-09-18)

Hỏi phạm vi trước: 5 trang trí có cần biến thể ngày/đêm không — người dùng chọn **chỉ đèn đom đóm** có bản đêm phát sáng (4 món còn lại dùng chung 1 ảnh). Tổng 8 ảnh: 4 trang trí đơn + đèn đom đóm ngày/đêm + 2 icon nhặt được (pha lê hạnh phúc, icon khoảnh khắc). Viết 8 prompt Gemini, đính kèm `platform/day.png` làm ảnh tham chiếu phong cách (vật thể, không phải nhân vật, nên dùng ảnh đảo thay vì ảnh Mây Bông). Tạo sẵn `public/assets/decorations/` và `public/assets/collectibles/` để người dùng lưu thẳng vào.

**🐛 Bug thật phát hiện khi xử lý ảnh — khoen/dây treo trong suốt bị lộ thành trắng đặc:** 3 ảnh có khoen dây treo (chuông gió, đèn đom đóm ngày + đêm) đều có phần trong khoen là 1 vùng trắng **kín hoàn toàn** (bị bao quanh bởi nét viền, không chạm rìa ảnh) — flood-fill xoá nền seed từ góc/cạnh ảnh (kỹ thuật dùng xuyên suốt) **đúng theo thiết kế không đụng tới** vùng kín này, coi nó là nội dung chứ không phải nền. Nhưng khác với các trường hợp trước (thân Mây Bông, quầng sáng Aurora/Comet) vốn có màu sắc/shading rõ ràng, vùng khoen ở đây thực chất là (255,255,254) — trùng y hệt màu nền — nên khi ghép lên nền tối (ban đêm) nó lộ ra thành 1 khối trắng đặc bất thường, giống lỗi cắt ảnh chứ không phải dây treo màu nhạt có chủ đích.

Sửa: viết script quét từng ảnh tìm điểm ảnh trắng đục còn sót (đặc điểm nhận diện: alpha>0 và gần trắng tuyệt đối — sau lượt xoá nền đầu tiên, CHỈ còn đúng vùng khoen thoả điều kiện này, không lẫn với highlight bóng loáng hợp lệ ở chỗ khác của ảnh) để tự tìm toạ độ seed, rồi flood-fill lần 2 từ chính giữa vùng đó với ngưỡng màu cao hơn (45 thay vì 28, vì vùng khoen có gradient nội bộ nhẹ khiến ngưỡng thấp chỉ xoá được 1 mảnh nhỏ chứ không hết cả vùng — phát hiện qua debug thực tế, không đoán trước được). Verify lại bằng composite lên nền tối cho cả 3 ảnh — khoen dây giờ trong suốt đúng.

**Tích hợp:**
```text
src/core/AssetRegistry.ts    — thêm bảng DECORATION_FILES đăng ký 5 trang trí; resolveDecorationAsset()
                                 thêm tham số isNight (mặc định false) — thử key "<id>.night" trước nếu có
                                 đăng ký (chỉ firefly_lantern), không thì rơi về key ngày/dùng chung như cũ
src/entities/Decoration.ts   — thêm tham số constructor isNight (quyết định 1 lần lúc đặt trang trí, KHÔNG
                                 tự cập nhật khi ngày/đêm đổi giữa phiên chơi — trang trí đặt 1 lần và hiếm
                                 khi vẽ lại, khác hẳn sky/platform vốn vẽ lại mỗi lần daynight:changed) +
                                 setScale theo TARGET_WIDTH riêng từng món (70-110px)
src/scenes/StationScene.ts   — placeDecoration() truyền dayNightSystem.isNight() vào Decoration
src/entities/HappinessCrystal.ts, PhotoMomentIcon.ts — thêm nhánh texture-swap (check scene.textures.exists,
                                 có thì dùng ảnh + setScale, không thì fallback Graphics cũ) — cùng pattern
                                 trực tiếp như platform/Cloudy (không qua AssetRegistry, vì chỉ 1 ảnh cố định
                                 mỗi loại, không có biến thể cần tra theo id)
src/scenes/PreloadScene.ts   — thêm 2 dòng load trực tiếp cho 2 collectible; trang trí tự nạp qua
                                 getAllRegisteredAssets() có sẵn, không cần sửa gì thêm
```

**🐛 Bug thật thứ 2 phát hiện qua Playwright — chuông gió che khuất kho nguyên liệu:** ảnh trang trí thật to hơn nhiều so với hình vẽ-bằng-code cũ (chuông gió: 56px → 125px cao) — vị trí đặt cũ (`slotX: 0.08, slotY: 0.3` trong `decorations.json`, giữ nguyên từ thời hình nhỏ) giờ đè kín 3/5 dòng của `InventoryUI` (góc trên trái). Đây là xung đột vị trí đã tồn tại tiềm ẩn từ trước (ngay cả hình nhỏ cũ cũng hơi chồng lên vùng đó) nhưng chỉ thật sự lộ rõ khi hình đủ to — sửa bằng cách dời `slotX` từ 0.08 lên 0.16 trong data (không đụng code), đã tính toán + xác nhận lại bằng ảnh chụp không còn chồng chéo. Rà lại toạ độ 4 trang trí còn lại (đèn đom đóm, võng, bàn trà, chong chóng) so với mọi UI cố định khác — không phát hiện xung đột nào thêm.

**Verify:** `tsc`/`vitest` (119/119, tăng từ 116 — thêm test cho decoration night-variant resolve)/`lint`/`build`/`build:playables` sạch cả 5. Playwright thật: seed sẵn `localStorage` với toàn bộ khu vực/trang trí đã mở khoá (tránh phải bấm mua từng món qua UI) — xác nhận cả 5 trang trí hiện đúng ảnh, đúng vị trí, không chồng UI; ép đêm qua phím `N` xác nhận đèn đom đóm chuyển đúng sang bản phát sáng, 4 món còn lại giữ nguyên (đúng thiết kế). Pha lê hạnh phúc: dàn dựng chuỗi pha chế + dỗ khách thật (không phải mock) tới đúng lúc `guest:relaxed` bắn ra, chụp ảnh đúng khung hình rơi xuống — xác nhận đúng hình kim cương ảnh thật, không phải hình thoi vẽ-bằng-code cũ. Icon khoảnh khắc: xác nhận bằng code review rằng dùng đúng pattern đã verify với pha lê (không tự thấy được trong game vì icon này gắn với `sun_memory_4`/chương 4, cần 6 lượt ghé + trust 40 — đúng hành vi đã cố ý gate chặt từ Pass 31, không phải thiếu sót lần này). 0 console error xuyên suốt toàn bộ quá trình test.

**Còn lại của chuỗi 4 đợt nâng cấp visual (lúc đó):** (3) khung UI, (4) hiệu ứng thời tiết riêng từng công thức — chưa bắt đầu.

---

## ✅ Đợt 3 hoàn tất — Khung UI qua kỹ thuật 9-slice (2026-09-18)

Hỏi hướng làm trước: mở rộng phong cách "thẻ mây" của `BottomNavUI` bằng code (nhanh, an toàn) hay tạo ảnh nền panel thật qua kỹ thuật 9-slice (đẹp/nhất quán hơn nhưng lần đầu dùng 9-slice trong dự án, rủi ro kỹ thuật cao hơn hẳn). Người dùng chọn **9-slice**.

**Rà code trước khi làm:** 8/9 file UI (`RecipeBookUI`, `WelcomeGuideUI`, `DecorationShopUI`, `StationAreaShopUI`, `CloudyCosmeticsShopUI`, `AudioSettingsUI`, `PaperBoatUI`, `GuestHintUI`) đều tự vẽ `scene.add.rectangle()` phẳng độc lập — xác nhận không file nào dùng biến `backdrop` cho việc gì khác ngoài `.add()` vào container, nên có thể gộp an toàn thành 1 điểm swap chung.

**Kiến trúc chuẩn bị trước khi có ảnh (đúng thứ tự đã làm mọi đợt trước):**
```text
src/ui/PanelBackground.ts (mới) — createPanelBackground(scene, width, height): có texture
                                    'panel-frame' thì trả về Phaser NineSlice (scene.add.nineslice),
                                    không thì fallback rectangle phẳng y hệt code cũ. CORNER_SIZE
                                    (vùng góc không bị kéo giãn) đặt tạm 48, sẽ đo lại từ ảnh thật.
```
Sửa cả 8 file trên để gọi `createPanelBackground(scene, w, h)` thay vì tự vẽ rectangle — refactor thuần, verify bằng Playwright xác nhận **không đổi gì về hình ảnh** (fallback vẫn giống hệt code cũ) trước khi viết prompt, đúng nguyên tắc tách bạch "đổi kiến trúc" và "đổi hình ảnh" thành 2 bước riêng có thể verify độc lập.

**Prompt Gemini:** 1 ảnh vuông duy nhất (không cần nhiều biến thể — dùng lại cho cả 8 panel qua 9-slice, đúng tinh thần tái dùng thay vì tạo ảnh riêng từng panel). Nhấn mạnh trong prompt: *không được có chi tiết trang trí riêng lẻ nào* (không hoa văn/sao/logo đơn lẻ) vì ảnh sẽ bị kéo giãn theo cạnh và ở giữa — bài học rút ra trực tiếp từ việc hiểu cơ chế 9-slice trước khi viết prompt, không phải phát hiện sau khi lỗi.

**Đo thông số thật từ ảnh nhận được (không đoán):** viết script quét pixel-by-pixel để tìm chính xác bán kính bo góc (đường cong góc kết thúc ở y≈30 trên ảnh đã resize 300×300) và độ dày viền (~4-5px) — từ đó chốt `CORNER_SIZE = 36` (30 + đệm 6px), thay cho số 48 đoán tạm ban đầu. Xử lý ảnh: cùng kỹ thuật flood-fill quen thuộc, crop bbox, resize còn 300×300 (đủ nét cho panel lớn nhất trong game ~450px, không cần giữ nguyên 2048×2048 gốc).

**Tích hợp:** `PreloadScene.ts` thêm 1 dòng load cho `panel-frame`. Không cần sửa gì thêm ở 8 file UI — kiến trúc `createPanelBackground()` đã chuẩn bị sẵn tự động nhận ảnh khi có.

**Verify:** `tsc`/`vitest` (119/119)/`lint`/`build`/`build:playables` sạch cả 5. Playwright thật mở đủ cả 8 panel (từ nhỏ nhất — hint box 340×64 — tới lớn nhất — sổ công thức ~380×446) — xác nhận NineSlice co giãn mượt ở mọi kích thước/tỉ lệ khác nhau, góc bo tròn nhất quán, không lỗi vệt nối (seam) hay méo hình ở bất kỳ panel nào, 0 console error.

---

## ✅ Đợt 4 hoàn tất — Hiệu ứng thời tiết riêng từng công thức (2026-09-23)

Đợt cuối trong chuỗi 4 đợt nâng cấp visual — khác hẳn 3 đợt trước: không phải thay ảnh, mà lần đầu tiên field `visualEffect` trong `recipes.json` (`"drizzle"`/`"starlight"`/`"breeze"`/`"aurora"`/`"comet"`) được dùng thật — trước giờ tồn tại trong data nhưng chưa từng có code nào đọc, mọi công thức pha thành công đều chỉ chạy đúng 1 hiệu ứng lấp lánh giống hệt nhau.

**Quyết định phạm vi (tự chọn, không hỏi lại):** tái dùng texture `sparkle.png` sẵn có cho cả 5 hiệu ứng — phân biệt qua màu sắc/hướng chuyển động/blend mode thay vì vẽ 5 ảnh mới, giữ đúng tinh thần "Subtle > Flashy" và tái dùng kiến trúc `ParticleEffect.ts` đã có (`scene.add.particles` + `explode()`, đúng pattern Phaser 3.90 đã dùng cho sparkle/glow trước đó).

**`src/utils/ParticleEffect.ts`** — thêm `createWeatherEffect(scene, x, y, visualEffect)` — dispatcher switch theo đúng giá trị field `visualEffect`, gọi 1 trong 5 method riêng:
```text
drizzle  (Mặt Trời)  — hạt rơi thẳng xuống có trọng lực thật (gravityY:160) — hiệu ứng
                        DUY NHẤT trong 5 cái thật sự "rơi", 4 cái còn lại đều lơ lửng
starlight (Mặt Trăng) — bụi trôi chậm lên trên, lifespan dài nhất (1400ms) — "mơ màng"
breeze   (Bướm)       — hạt quét ngang qua khách (angle hẹp quanh 0°) thay vì toả tròn
aurora   (Cực Quang)  — 2 emitter chồng màu khác nhau, góc toả rộng nhất (200°-340°) —
                        đọc như 1 "dải" quét qua thay vì 1 cụm nổ
comet    (Sao Chổi)   — tốc độ cao nhất, lifespan ngắn nhất (450ms), blend ADD — hiệu
                        ứng DUY NHẤT có glow cộng sáng, còn lại đều NORMAL blend
```
`StationScene.ts` — `handleGuestInteraction()`'s nhánh recipe-tap giờ gọi `createWeatherEffect(this, x, y, recipe.visualEffect)` thay cho `createSparkleEffect` cố định cũ. Nhánh 'direct'/rub (Bé Sao Nhút Nhát) **giữ nguyên** `createSparkleEffect` — không phải công thức thời tiết nên không có `visualEffect` để đọc.

**🐛 Bug thật tự phát hiện và tự sửa trong lúc verify — màu pastel hoà lẫn vào bầu trời:** bản đầu tiên tint theo đúng màu `PALETTE` sẵn có (`skyTop`, `lavender`, `mint` — nhạt, đúng phong cách UI game) nhưng khi test bằng Playwright, **cả 5 hiệu ứng đều "vô hình"** trên ảnh chụp toàn màn hình. Debug có hệ thống trước khi kết luận là lỗi thật: (1) test lại hiệu ứng sparkle CŨ (code không đổi, đã coi là "đã chứng minh hoạt động" từ trước) bằng đúng phương pháp Playwright này — cũng "vô hình" ở ảnh toàn màn hình, chỉ thấy rõ khi crop-zoom kỹ — chứng tỏ vấn đề đầu tiên là phương pháp test (cần zoom), không phải bug; (2) sau khi zoom kỹ, sparkle cũ hiện rõ nhưng cả 5 hiệu ứng mới vẫn không thấy gì ngay cả khi zoom — nghi ngờ thật; (3) làm 1 bản debug "cực đoan" (màu hồng sen chói, scale to gấp 4, alpha 1, lifespan 3s) cho riêng comet — hiện rõ ràng, xác nhận cơ chế particle hoàn toàn đúng, vấn đề chỉ nằm ở lựa chọn màu; (4) thêm `console.log` tạm xác nhận `createWeatherEffect` nhận đúng `visualEffect` mỗi lần gọi — loại trừ khả năng dispatch sai; (5) chụp zoom kỹ ở đúng toạ độ hạt sinh ra — thấy rõ 1 hạt xanh nhỏ đúng màu `drizzle`, xác nhận hiệu ứng có chạy, chỉ là nhỏ + tint pastel gần trùng màu nền trời (đặc biệt `skyTop`/`lavender`/`mint` — đúng những màu cũng dùng để vẽ gradient bầu trời) khiến gần như không phân biệt được ở khoảng cách nhìn thường.

Sửa: thêm bộ màu `VFX_TINT` riêng (bão hoà hơn hẳn `PALETTE` — `waterBlue`/`moonPurple`/`leafGreen`/`emberOrange`), kèm comment giải thích rõ *tại sao* VFX cần màu đậm hơn UI dù cùng 1 game (để không ai vô tình quay lại dùng `PALETTE` nhạt cho hiệu ứng sau này), đổi toàn bộ 4 hiệu ứng từng dùng `SCREEN` blend (dễ bị "tẩy trắng" khi tint nhạt) sang `NORMAL`, tăng scale hạt (0.4-0.6 → 0.65-0.8).

**Verify:** `tsc`/`vitest` (119/119)/`lint`/`build`/`build:playables` sạch cả 5. Playwright thật cho cả 5 công thức (dùng 3 phím debug tạm K/L/O bổ sung cho 3 công thức chưa có phím sẵn — **đã gỡ lại sau khi verify xong**, không phải tính năng chính thức) — xác nhận từng hiệu ứng chạy đúng màu/đúng hướng qua ảnh chụp zoom kỹ ở đúng toạ độ + thời điểm hạt sinh ra (không chỉ ảnh toàn màn hình dễ bỏ sót). Regression cuối cùng sau khi gỡ phím debug tạm: chạy lại đúng luồng chơi thật (Z → CHẾ TẠO → chạm khách) bằng 3 phím debug gốc (Z/V/X) vẫn còn lại — 0 console error.

**✅ Hoàn tất toàn bộ chuỗi 4 đợt nâng cấp visual** (nền tảng mây → trang trí/icon → khung UI 9-slice → hiệu ứng thời tiết) khởi động từ yêu cầu *"tôi muốn làm game đẹp hơn nữa, game này rất quan trọng visual"*.

---

## ✅ Đợt 5 hoàn tất — Đồng bộ 3 chỗ sót lại sau chuỗi 4 đợt (2026-09-23)

Người dùng hỏi "đã xong plan làm game đẹp hơn chưa" — trả lời trung thực là 4 đợt đã định nghĩa sẵn đã xong đúng phạm vi, nhưng chủ động chỉ ra 3 chỗ còn sót không nằm trong phạm vi ban đầu: (1) `CrystalCounter.ts` vẫn vẽ viên kim cương bằng Graphics cũ dù `HappinessCrystal.ts` đã có ảnh thật từ Đợt 2 — lệch phong cách giữa icon tĩnh (thanh trên) và icon bay (lúc nhặt được); (2) từng nút bấm riêng lẻ (✕ đóng, CHẾ TẠO, nút mua trong shop) chưa từng được đụng tới — Đợt 3 chỉ làm khung/panel nền; (3) thẻ chương/thẻ ký ức trong Nhật ký vẫn là hình chữ nhật phẳng viền stroke, không có khung minh hoạ. Người dùng xác nhận sửa cả 3.

**(1) CrystalCounter — sửa nhanh, tái dùng ảnh có sẵn:** `src/ui/CrystalCounter.ts` thêm nhánh kiểm tra `scene.textures.exists('collectible-happiness-crystal')` — có thì dùng đúng ảnh pha lê hạnh phúc đã nạp sẵn từ Đợt 2 (`scene.add.image` + `setScale` về 22px), không thì giữ nguyên hình thoi vẽ tay cũ. Không cần ảnh mới.

**(2)+(3) Kiến trúc chung `Button.ts` — gộp nút bấm + khung thẻ Nhật ký vào 1 điểm swap:**
```text
src/ui/Button.ts (mới) — createButtonBackground(scene, w, h, color?): có texture 'button-frame'
                          thì trả NineSlice, không thì fallback Rectangle phẳng. CORNER_SIZE=14
                          (nhỏ hơn hẳn PanelBackground's 36 — texture này dùng ở mọi tỉ lệ từ nút
                          ✕ 26px vuông tới thẻ Nhật ký 130px cao, góc lớn sẽ tự chồng lên nhau ở
                          kích thước nhỏ nhất).
                          createButton(scene, x, y, label, onClick, options?): nút chữ đầy đủ,
                          tự đo kích thước theo label.
                          createCloseButton(scene, x, y, onClick): nút ✕ 26×26 riêng.
```
Áp dụng cho 8 file: `WeatherMixerUI` (CHẾ TẠO), `WelcomeGuideUI` (✕ + "Bắt đầu thôi!"), `RecipeBookUI` (✕), `PaperBoatUI` (✕ + nút xác nhận + nút gấp giấy — nút gấp có 4 nhãn đổi động nên KHÔNG dùng `createButton()` mà gọi trực tiếp `createButtonBackground()` giữ riêng tham chiếu `Text` để `.setText()` sau), `StationAreaShopUI`/`DecorationShopUI`/`CloudyCosmeticsShopUI` (dòng/badge mua trong shop), `JournalScene` (thẻ chương/thẻ ký ức, dùng thẳng `createButtonBackground()` không qua `createButton()` vì đây không phải nút bấm có label).

**🐛 Giới hạn kỹ thuật thật phát hiện khi porting — NineSlice không có `.setTint()`/`.setFillStyle()`:** `Phaser.GameObjects.NineSlice` chỉ implement `AlphaSingle`/`BlendMode`/`Transform`/... — không có Tint. 3 shop UI vốn đổi màu theo trạng thái khoá/mở/đang dùng bằng `.setFillStyle(color, alpha)` — không còn dùng được nữa. Sửa bằng cách đổi toàn bộ sang chỉ dùng `.setAlpha(alpha)` để phân biệt trạng thái (màu cố định từ lúc tạo), viết type `ButtonBackground` (giao của `GameObject & AlphaSingle & Transform`) làm kiểu trả về chung để gọi được `.setAlpha()`/đọc `.x`/`.y` trên cả 2 nhánh NineSlice và Rectangle mà không cần ép kiểu.

**🐛 Bug thật phát hiện qua Playwright — bản fallback mất viền so với code gốc:** mọi rectangle gốc bị thay thế đều có `.setStrokeStyle(...)` (thẻ Nhật ký: `(2, 0x5b4a63, 0.3)`; dòng shop: `(1, PALETTE.eyeColor, 0.2)`) nhưng nhánh fallback đầu tiên của `createButtonBackground()` chỉ có `scene.add.rectangle(0, 0, width, height, color, 1)` — thiếu hẳn viền. `tsc`/`vitest`/`lint` đều sạch dù có bug này (không phải lỗi kiểu hay logic, chỉ là thiếu 1 lời gọi styling). Chỉ lộ ra qua ảnh chụp Playwright zoom kỹ vào thẻ Nhật ký — thấy khối phẳng bợt, không viền, khác hẳn thẻ gốc. Sửa: thêm `.setStrokeStyle(2, 0x5b4a63, 0.3)` vào cuối nhánh fallback — chuẩn hoá về 1 giá trị viền chung cho mọi call site (giống cách `PanelBackground.ts`'s fallback cũng đã chuẩn hoá 1 kiểu viền chung thay vì giữ nguyên từng giá trị hơi khác nhau ở mỗi nơi).

**Verify:** `tsc`/`vitest` (119/119)/`lint`/`build`/`build:playables` sạch cả 5. Playwright thật: crystal counter (ảnh pha lê đúng cạnh số "20"), welcome guide (✕ + "Bắt đầu thôi!"), mixer (CHẾ TẠO), 3 shop (dòng/badge mua + viền đã khôi phục), sổ công thức (✕), Nhật ký (thẻ chương/ký ức có viền, khôi phục đúng như code gốc) — chụp riêng cả trước và sau khi sửa bug viền để xác nhận khác biệt rõ ràng. 0 console error xuyên suốt.

**Ảnh `button-frame` thật đã nhận và tích hợp (cùng ngày):** người dùng tạo bằng Gemini (đính kèm `panel_frame.png` làm tham chiếu phong cách) và lưu vào `public/assets/ui/button_frame.png`.

**🐛 Bug thật phát hiện trong ảnh gốc — 1 chi tiết lấp lánh trang trí ở góc dưới-phải:** đúng loại lỗi đã dặn trước trong prompt ("không được có chi tiết trang trí riêng lẻ nào" vì 9-slice sẽ kéo giãn nó) nhưng Gemini vẫn vẽ 1 viên kim cương lấp lánh nhỏ, mờ (chỉ chênh ~(236,198,159) so với nền tan (228,173,117) — không thấy rõ bằng mắt thường ở ảnh thu nhỏ, chỉ lộ ra khi quét pixel). Xác nhận đây là vùng cô lập (không dính viền ảnh) bằng kỹ thuật flood-fill-từ-góc giống hệt bài học "khoen dây treo" ở Đợt 2 — vùng nào không nối được tới biên ảnh qua flood-fill thì không phải nền, nhưng ở đây nó cũng không phải nội dung hợp lệ (là lỗi vẽ thừa), nên xử lý khác: đo bounding box (`x[1760,1855] y[1760,1855]` trên ảnh 2048px), vá bằng cách sao chép nguyên 1 vùng nền sạch 130×130 từ toạ độ khác của cùng ảnh (đã quét xác nhận vùng nguồn không dính lỗi trước khi copy) — không cần yêu cầu người dùng tạo lại ảnh.

**Đo thông số thật + chốt kích thước cuối (không đoán):** xoá nền trắng bằng flood-fill từ 4 góc (kỹ thuật quen thuộc), resize thử 300×300 trước — đo được bán kính góc≈27px + viền≈6px (gần bằng tỉ lệ của `panel-frame`, vì Gemini vẽ theo đúng phong cách ảnh tham chiếu, kể cả về tỉ lệ góc bo, không riêng màu sắc) — quá lớn so với yêu cầu (nút ✕ nhỏ nhất chỉ 26px, 2×27 đã vượt quá cả kích thước nút). Resize tiếp xuống 130×130 (tình cờ khớp gần đúng 1:1 với thẻ Nhật ký 130px — ảnh không bị phóng to mất nét ở trường hợp dùng lớn nhất) — đo lại: bán kính≈12px + viền≈2px ≈ 14, khớp đúng giá trị `CORNER_SIZE=14` đã đoán tạm sẵn trong code từ trước, không cần sửa `Button.ts`.

**Tích hợp:** `PreloadScene.ts` thêm 1 dòng `this.load.image('button-frame', 'assets/ui/button_frame.png')`. Không cần sửa gì thêm ở `Button.ts`/8 file UI đã porting trước đó — kiến trúc `createButtonBackground()` tự nhận ảnh khi có, đúng thiết kế.

**Verify riêng biệt trạng thái khoá/mở sau khi có ảnh thật:** vì NineSlice không tint được, lo ngại 2 trạng thái khoá/mở giờ chỉ khác nhau ở alpha (`0.35`/`0.9`) liệu có còn phân biệt được rõ trên nền ảnh thật (khác hẳn lúc fallback màu phẳng dễ so sánh) — seed riêng 1 save có **cả khoá lẫn mở cùng lúc** (lần đầu chỉ test all-unlocked, không đủ để so sánh) để chụp cạnh nhau: xác nhận qua ảnh chụp zoom, dòng khoá rõ ràng nhạt/mờ hơn hẳn dòng đã mở dù cùng 1 texture nâu — alpha vẫn đủ để phân biệt trạng thái, không cần thêm icon khoá phụ trợ nào khác ngoài icon 🔒 sẵn có.

**Verify cuối:** `tsc`/`vitest` (119/119)/`lint` sạch. Playwright thật: thẻ Nhật ký (130px, dùng gần đúng độ phân giải gốc — sắc nét, không seam), nút ✕ (26px, kích thước nhỏ nhất trong toàn game — zoom pixel-level xác nhận góc bo mượt, không lỗi chồng góc dù 2×CORNER_SIZE gần bằng kích thước nút), 3 shop (dòng/badge với cả trạng thái khoá và mở cạnh nhau). 0 console error xuyên suốt.

**✅ Hoàn tất — ảnh `button-frame` thật đã thay hoàn toàn fallback rectangle** ở mọi vị trí trong game.
