# Báo cáo QA — Cozy Player Experience Roadmap

Ngày kiểm tra: 2026-09-24. Nhánh `feature/update-background`, chưa commit.
Phương pháp: đọc code + `tsc`/`eslint`/`vitest` (147 test pass) + chạy trình duyệt thật (Playwright, 1280x720, save được seed). Không có console error hay request lỗi trong mọi lượt chạy.

## Kết luận

Roadmap **chưa xong**. Logic (Task 1, 2, 3, 5, 6, 7) hoạt động. Phần **giao diện Nhật ký (Task 4) hỏng**, và có vài lỗi hiển thị/lưu trữ nhỏ hơn ở Lưu Trữ.

| Task | Trạng thái | Ghi chú |
|---|---|---|
| 1 Guest loop clarity | ✅ | Code + test ổn. Chưa QA từng stage bằng trình duyệt. |
| 2 Craft/delivery feedback | ✅ (code) | Chưa QA pha sai → sửa → đúng trên trình duyệt. |
| 3 Onboarding | ✅ (một phần) | Save sạch → welcome → spawn khách → bước `FIND_INGREDIENT` được lưu và giữ sau reload, không hiện lại welcome. Chưa chạy hết các bước sau (craft → giao → xem). |
| 4 Cloudy Origin Story | ❌ | Dữ liệu + wiring ổn, nhưng Nhật ký hiển thị sai (mục 1–3). |
| 5 Rare Weather | ✅ | Xem chi tiết bên dưới. Còn 1 điểm hardcode. |
| 6 Sky Archive | 🟡 | Có bộ lọc, chạy đúng. Lỗi chữ đè + công thức không lưu. |
| 7 World Memory | ✅ (code) | Category/provenance có. Còn hiện enum thô. |

## Lỗi cần sửa (theo độ ưu tiên)

### 1. Thẻ ký ức trong Nhật ký không hiện — cao nhất
`JournalScene.ts` `createCard()` dòng 319:

```ts
const card = this.chapterContent.add(this.add.container(x, y));
```

`Container.add()` trả về **chính container cha** (`chapterContent`), không phải container con. Hậu quả:
- `card` thực chất là `chapterContent`. Front/back/hint/📸 của mọi thẻ bị add vào gốc (0,0) chồng lên nhau, nằm ngoài vùng mask → **không thấy thẻ nào** (đã xác nhận bằng screenshot: chỉ thấy tiêu đề chương + chấm, không có thẻ mint/khoá).
- `setSize/setInteractive/on('pointerdown')` gắn vào cả `chapterContent`. `flipCard` sẽ tween `scaleX` của **cả danh sách**.

Sửa: tạo container riêng rồi add, ví dụ
```ts
const card = this.add.container(x, y);
this.chapterContent.add(card);
```

### 2. Nhật ký: vị trí đầu bị cắt bởi mask
Mask bắt đầu ở `viewportTop = SAFE_ZONE_MARGIN + 82`, nhưng header khách nằm ở `rowY - 55` và tiêu đề chương ở `rowY - 42`; với `rowStartY = SAFE_ZONE_MARGIN + 120` thì cả hai nằm **trên** đường mask ở scroll = 0. Vừa mở đã mất tên khách đầu tiên và tiêu đề chương đầu (đã chụp: hàng đầu bị cắt sát mép). Cần tăng `rowStartY` (hoặc hạ `viewportTop`) để header nằm trong viewport.

### 3. Nhật ký: chồng chữ / header sai
- Header khách lấy tên từ `guestSystem.getAllDefinitions()`; "cloudy" không phải khách nên hiện thô `cloudy` (đè lên mô tả chương). Dùng `chapter.guestName` khi không tìm thấy.
- Chiều cao thẻ 130, khoảng cách hàng 110 → các hàng thẻ chồng nhau 20px, và thẻ chạm tiêu đề/chấm chương (thẻ đặt tại `rowY + 50`, cao 130 → đỉnh ở `rowY - 15`). Header khách của hàng kế (`rowY + 230 - 55`) nằm trong vùng thẻ hàng trước (tới `rowY + 225`). Cần chỉnh lại `rowHeight` (≥ ~290 với 2 hàng thẻ) hoặc dùng 1 hàng.
- Sau khi sửa mục 1, kiểm tra lại: mask không chặn input, nên thẻ nằm ngoài viewport vẫn có thể nhận click (đã thử bấm "← Quay lại" khi cuộn giữa chừng, vẫn hoạt động, nhưng hiện chưa có thẻ nên chưa phản ánh đúng). Nên bỏ qua pointer nằm ngoài viewport trong handler của thẻ.

### 4. Lưu Trữ: chữ đè nhau
`drawSection` dùng `LINE_HEIGHT` cố định (22px) nhưng `wordWrap` cho dòng dài (ví dụ "Dấu vết gần đây", "Đã mở: …", "Chưa mở: …") xuống 2 dòng và đè dòng kế tiếp; panel cũng không cao thêm. Cần tính chiều cao thật của từng dòng (`text.height`) hoặc cắt ngắn nội dung.

### 5. Lưu Trữ: công thức đã khám phá không được lưu
`WeatherSystem.discoveredRecipeIds` chỉ nằm trong session (chú thích trong code cũng nói vậy) và `SaveSystem` không lưu. Đã xác nhận: sau khi xem Mưa Sao Băng (công thức `meteor_glow` được đánh dấu khám phá) rồi reload → Lưu Trữ vẫn "Công thức đã khám phá: 0/6". Trái tiêu chí Task 6 "dữ liệu phản ánh đúng save sau reload" và làm mất phần thưởng recipe của Task 5. Cần thêm vào save/migration (và khôi phục khi load).

### 6. Nhỏ
- Lưu Trữ hiển thị enum thô: "Giúp khách đạt SUN_STRESSED" — lấy từ `getMemoryUnlockAction`. Nên map sang nhãn tiếng Việt (`EmotionSystem` đã có label).
- `StationScene.handleRareWeatherCompleted` (dòng ~444) bỏ qua `eventId` và hardcode `'meteor_shower'`; trái mục tiêu "không hardcode trong StationScene". Nên dùng `eventId` từ payload.
- Ký ức `world_memory_1` không có `photoMomentId` trong `journal.json`, nên thẻ không hiện biểu tượng 📸 dù có photo `meteor_shower_01`.
- `meteor_glow` là công thức thường craft được từ đầu (`star_dust + rainbow_fragment`); "mở khoá" chỉ là đánh dấu khám phá. Cần quyết định có ý định gate không.
- Hai toast liên tiếp trong `handleRareWeatherCompleted` (công thức + ký ức): chưa kiểm tra xem toast sau có ghi đè toast trước không.

## Đã kiểm tra bằng trình duyệt, ổn

- **Rare Weather:** save seed (Góc Ngắm Sao mở, Moon ghé 3 lần) → bấm `N` sang đêm → sự kiện tự chạy, toast "Một ký ức của bầu trời đã được ghi lại trong Nhật ký". Save chứa `rareWeather.completedEventIds = [meteor_shower]`, `lastCompletedVisitCounts.meteor_shower = 3`, `capturedPhotoMoments = [meteor_shower_01]`, `world_memory_1` đã mở. Sau reload Lưu Trữ hiện "Mưa Sao Băng: đã chứng kiến", "Ký ức thế giới 1/1", "Ảnh đã chụp: 1".
- **Lưu Trữ:** bộ lọc `Tất cả → Đã mở → Chưa mở` xoay đúng, số liệu (ký ức, khu vực, cosmetic, tiến trình chào đón) khớp save. Nút Quay lại hoạt động.
- **Nhật ký:** cuộn bằng wheel hoạt động; nút "← Quay lại" vẫn bấm được khi đang cuộn.
- **Tutorial:** save sạch hiện welcome; sau "Bắt đầu thôi!" bước lưu `WAITING_FOR_GUEST` → spawn khách → `FIND_INGREDIENT`; reload giữ nguyên bước, không hiện lại welcome.

## Chưa kiểm tra

- Task 1: từng stage cảm xúc của từng khách trên trình duyệt.
- Task 2: pha sai → sửa → đúng, món bay tới khách.
- Task 3: các bước còn lại của tutorial (craft → giao → xem), reload ở giữa từng bước.
- Task 5: save/reload đúng lúc sự kiện đang chạy; giới hạn particle/audio trên mobile.
- Task 6: bố cục mobile; mở/đóng bằng bàn phím (ESC có trong code, chưa bấm thử).
- Nhật ký: thẻ đã mở lật được, thẻ ở mép mask, bố cục mobile — chỉ kiểm tra được sau khi sửa mục 1.

## Thứ tự sửa gợi ý

1. Mục 1 (thẻ Nhật ký) → 2 → 3 (bố cục Nhật ký), rồi QA lại Nhật ký với save có ký ức đã mở.
2. Mục 5 (lưu công thức) — chạm save/migration, cần test.
3. Mục 4 và các mục nhỏ.
4. Chạy `npx tsc --noEmit && npx vitest run && npm run lint && npm run build` rồi QA lại các phần "chưa kiểm tra".

---

## Kiểm tra lại (lần 2)

`tsc`, `eslint` sạch; vitest 147 pass; không có console error. Trình duyệt thật:

| Mục cũ | Kết quả |
|---|---|
| 1 Thẻ Nhật ký không hiện | ✅ Đã sửa. Thẻ hiện, lật được, có 📸 cho `world_memory_1`. |
| 2 Hàng đầu bị cắt | ✅ Đã sửa. Tên khách đầu tiên hiện đầy đủ. |
| 3 Header "cloudy" | ✅ Đã sửa (hiện "Mây Bông"). ❌ Bố cục còn lỗi, xem dưới. |
| 4 Chữ đè trong Lưu Trữ | ✅ Đã sửa (dòng dài tự giãn). ❌ Nhưng panel nền biến mất, xem dưới. |
| 5 Công thức không lưu | ❌ Chưa chạy được. Xem dưới. |
| 6 enum thô | ✅ Đã sửa. `handleRareWeatherCompleted` đã dùng `eventId`. |

### Còn lỗi

1. **Công thức vẫn không lưu.** Code lưu/khôi phục đã có (`SaveSystem`, `WeatherSystem`, `saveMigration`), nhưng `weatherSystem` **chưa được truyền vào `SaveSystem`** trong `createGameSystems` ([GameSystems.ts](../../../src/core/GameSystems.ts), khối `new SaveSystem(..., { ..., rareWeatherSystem }, eventBus)`), nên `weatherSystem?.` luôn `undefined`. Đã kiểm chứng: `discoveredRecipeIds` không xuất hiện trong localStorage; sau xem Mưa Sao Băng + reload Lưu Trữ vẫn "0/6". Sửa: thêm `weatherSystem` vào object đó. `SaveSystem.test.ts` cũng chưa có test round-trip cho trường này (nên thêm, và bỏ `?` để lỗi này không im lặng).
2. **Lưu Trữ mất nền panel.** `drawSection` đặt `panel.setDepth(-1)`, thấp hơn `drawBackground()` (depth 0), nên panel trắng nằm sau nền gradient. Chữ vẫn đọc được nhưng hết khung. Đặt background depth thấp hơn (vd. -2) hoặc bỏ `setDepth(-1)`.
3. **Nhật ký còn chồng nhau:**
   - Tên khách (`rowY - 55`) chồng lên tiêu đề chương (`rowY - 42`) cùng cột x.
   - Chương Mây Bông có 5 ký ức → 3 hàng thẻ, khoảng cách 110 < cao 130 nên các thẻ đè nhau, đè chấm tiến độ và đè hint của thẻ khoá.
   - Nên dùng bước hàng ≥ 140 và dời tên khách lên trên tiêu đề chương ít nhất ~30px.
   - Ngoài ra thẻ khoá có biểu tượng 🔒 của chương nằm lệch ở góc phải trên thẻ.
4. Thẻ hiện màu cam thay vì mint/xám (`createButtonBackground` với màu `PALETTE.mint`/`0xd8d8d8`); chưa rõ là chủ ý — nên xem lại.

Vẫn chưa kiểm tra: mobile, các bước tutorial sau `FIND_INGREDIENT`, pha sai trong mixer.

---

## Kiểm tra lại (lần 3)

`tsc`, `eslint` sạch; vitest 147 pass; không có console error.

- ✅ **Công thức lưu được:** `discoveredRecipeIds = ["meteor_glow"]` có trong localStorage; sau reload Lưu Trữ hiện "Công thức đã khám phá: 1/6".
- ✅ **Nhật ký:** tên khách không còn đè tiêu đề chương; các hàng thẻ (kể cả chương Mây Bông 5 ký ức) tách nhau, thẻ lật được, có 📸.
- ❌ **Lưu Trữ: panel nay đè lên chữ.** Nền panel hiện nằm **trên** chữ (không còn `setDepth(-1)`, panel được add sau các text), chữ bị mờ gần như không đọc được. Cần đặt panel dưới text (vd. `panel.setDepth(-1)` kèm `background.setDepth(-2)`, hoặc tạo panel trước rồi mới add text).
- 🟡 Nhỏ: gợi ý của thẻ khoá ở hàng trên bị thẻ hàng dưới che một phần (chương Mây Bông); biểu tượng 🔒 của chương vẫn nằm lệch ở góc thẻ; thẻ vẫn màu cam.

---

## QA vòng chơi đầy đủ (lần 4)

Chạy bằng thao tác thật (kéo nguyên liệu, chạm kho, bấm CHẾ TẠO, chạm khách), save sạch, không có console error.

**Đạt:**
- Tutorial đi hết: `WAITING_FOR_GUEST → FIND_INGREDIENT → CRAFT_WEATHER → DELIVER_WEATHER → WATCH_EMOTION → COMPLETE`. Khách Mặt Trời đi qua 5 stage (1/5 Nóng bức → 5/5 Ấm áp và thư thái), hint cập nhật theo từng stage, khách rời đi, `cloudy_memory_1` + `sun_memory_1` được mở, công thức `cool_drizzle` được lưu.
- Reload khi đang ở `DELIVER_WEATHER`: bước tutorial được giữ, không hiện lại welcome.
- Mixer sai (sương sớm + mảnh cầu vồng): bấm CHẾ TẠO không mất nguyên liệu, vẫn nằm trong slot.
- Mobile landscape 844x390: Trạm, Lưu Trữ, Nhật ký đều đọc được, không chồng chữ.

**Lỗi mới:**
1. **Gỡ nguyên liệu khỏi slot mixer không hoạt động** (Task 2 nói làm được). `WeatherMixerUI.ts` ~dòng 213: `icon.setInteractive(new Rectangle(-SLOT_SIZE/2, -SLOT_SIZE/2, SLOT_SIZE, SLOT_SIZE), ...)` trên một `Image`; hit area của Image tính theo toạ độ texture (gốc ở góc trên trái), nên vùng bấm nằm lệch/gần như không có. Đã bấm đúng tâm và các góc slot nhưng nguyên liệu vẫn ở lại. Hệ quả: sau craft sai, người chơi kẹt hai nguyên liệu sai trong mixer (chỉ thoát được khi ghép ra công thức hợp lệ). Sửa: `icon.setInteractive({ useHandCursor: true })` (hoặc Rectangle theo kích thước texture).
2. **Reload giữa `DELIVER_WEATHER`:** khách và bình thuốc không được lưu, nhưng bước tutorial vẫn là `DELIVER_WEATHER`; khách kế tiếp sẽ hiện hướng dẫn "Món đã sẵn sàng…" khi chưa có món. Nên lùi bước về `CRAFT_WEATHER`/`FIND_INGREDIENT` khi restore nếu không có bình thuốc, hoặc lưu bình thuốc.
3. **Hai toast chồng lên nhau** khi craft công thức mới: "Món … gửi món" bị đè bởi "🎉 Công thức mới: Cool Drizzle!" (chữ vỡ thành "Móm 🎉 Công thức mới: Cool Drizzle! ửi món."). Cùng nguyên nhân với hai toast liên tiếp sau Mưa Sao Băng. Cần xếp hàng đợi hoặc offset toast.
4. Nhỏ: Lưu Trữ hiện "Giúp khách đạt trạng thái stressed" (chuỗi thô, chưa dịch); lần chạm khách đầu tiên sau craft đôi khi không giao món (bước vẫn `DELIVER_WEATHER`, chạm lần hai mới giao) — chưa xác định nguyên nhân, có thể do thời điểm chạm ngay lúc bình thuốc còn đang bay.

**Kết luận cập nhật:** vòng chơi cốt lõi (Task 1, 3, 5, 6, 7) đã chạy được end-to-end. Task 2 còn lỗi gỡ slot; nên sửa mục 1–3 trước khi coi roadmap là xong.
