Dưới đây là **toàn bộ roadmap từ Pass 1 đến Pass 31**, mình đã gom lại thành một lộ trình thống nhất, bao gồm cả MVP đã làm xong, các feature còn thiếu theo mô tả game gốc, và các findings kỹ thuật đã rút ra trong quá trình QA.

# Tổng quan roadmap

```text
PHASE 1 — MVP FOUNDATION                 Pass 1–14   ✅ DONE
PHASE 2 — CORE GAME DEPTH                Pass 15–17  ✅ DONE (hệ thống + nội dung — xem ghi chú trạng thái trong từng pass)
PHASE 3 — CONTENT & SOCIAL INTERACTION   Pass 18–20
PHASE 4 — WORLD PROGRESSION              Pass 21–23
PHASE 5 — PRESENTATION & GAME FEEL       Pass 24–26
PHASE 6 — BALANCE & PLATFORM             Pass 27–30
PHASE 7 — RELEASE QA                     Pass 31
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

# PHASE 3 — CONTENT & SOCIAL INTERACTION

# Pass 18 — Journal Decoration

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

# Pass 19 — Butterfly Messengers

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

# Pass 20 — Paper Boat & Wind Messages

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

# PHASE 4 — WORLD PROGRESSION

# Pass 21 — Station Expansion

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

# Pass 22 — Rare Guest System

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

# Pass 23 — Cloudy Cosmetics

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

# PHASE 5 — PRESENTATION & GAME FEEL

# Pass 24 — Audio & Ambience

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

# Pass 25 — Full Game Feel Polish

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

# Pass 26 — Visual Asset Pipeline

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

# Pass 27 — Content & Economy Balancing

Review:

```text
Happiness income
Decoration prices
Cosmetic prices
Station expansion costs
Ingredient spawn rate
Guest visit pacing
Rare guest conditions
Memory unlock pacing
```

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

---

# Pass 28 — Mobile & Touch QA

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

# Lộ trình ưu tiên cuối cùng

| Priority    | Pass | Mục tiêu              | Trạng thái |
| ----------- | ---- | --------------------- | ---------- |
| **P0**      | 15   | Inventory/Mixer       | ✅ hệ thống |
| **P0**      | 16   | Emotional Progression | ✅ hệ thống + nội dung (4-5→4) |
| **P0**      | 17   | Journal 2.0           | ✅ hệ thống + nội dung (4-5→4) |
| **P1**      | 18   | Journal Decoration    | |
| **P1**      | 19   | Butterfly Messengers  |
| **P1**      | 20   | Paper Boat            |
| **P2**      | 21   | Station Expansion     |
| **P2**      | 22   | Rare Guests           |
| **P2**      | 23   | Cloudy Cosmetics      |
| **P3**      | 24   | Audio                 |
| **P3**      | 25   | Game Feel             |
| **P3**      | 26   | Asset Pipeline        |
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
