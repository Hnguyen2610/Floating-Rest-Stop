# Cozy Player Experience Roadmap

> **Mục tiêu:** Làm cho vòng chơi hiện tại dễ hiểu, giàu phản hồi và có động lực cảm xúc dài hạn hơn mà không biến game thành game grind.
>
> **Triết lý giữ nguyên:** `Guest -> Understand -> Soothe -> Remember -> World-building`

## Phạm vi

Roadmap này ưu tiên trải nghiệm người chơi trước khi thêm số lượng nội dung mới.

Không thêm:

- điểm số, HP, lose state hoặc streak;
- energy, forced waiting hoặc FOMO;
- currency mới chỉ để kéo dài thời lượng chơi;
- hệ thống multiplayer/backend trong giai đoạn này;
- guest mới trước khi vòng chơi hiện tại đủ rõ.

## Thứ tự thực hiện

```text
P0  Độ rõ vòng chơi + phản hồi tức thì
    |
P0  Onboarding một lượt chơi hoàn chỉnh
    |
P1  Cloudy Origin Story
    |
P1  Rare Weather Events
    |
P1  Sky Archive
    |
P2  World Memory mở rộng
```

Mỗi task phải hoàn thành theo thứ tự, có test phù hợp, typecheck và build trước khi chuyển task tiếp theo.

## Trạng thái triển khai

- **Task 1 — Guest loop clarity:** ✅ code đã đủ. Hint có trạng thái màu, tiến trình `1/5`, 5 nhãn hành động, toast `PEACEFUL` và test mapping stage/progress. Còn browser QA.
- **Task 2 — Craft and delivery feedback:** ✅ code đã đủ phần plan. Mixer sai giữ nguyên slot để sửa, gỡ từng slot hoàn lại kho, slot có highlight, món bay về khách và có test remove/refund path.
- **Task 3 — First-session onboarding:** ✅ code đã làm. Tutorial theo dõi event thật, lưu được bước qua reload và highlight kho/mixer/khách. Còn browser QA save sạch + reload giữa bước.
- **Task 4 — Cloudy Origin Story:** 🟡 nội dung + wiring đã làm, Journal đã cuộn được và hiện đủ hàng. Còn browser QA layout/thẻ trên desktop và mobile.
- **Task 5 — Rare Weather Events:** ✅ Mưa Sao Băng có điều kiện, hiệu ứng, audio, photo moment, world memory, recipe đặc biệt và lặp lại sau visit mới. Còn browser QA.
- **Task 6 — Sky Archive:** ✅ scene, progression counts, observed stages, unlock provenance và filter `Tất cả / Đã mở / Chưa mở` đã có. Còn mobile/browser QA.
- **Task 7 — World Memory Integration:** ✅ Journal có category fallback cho memory khách, category Cloudy/world rõ ràng và metadata truy ngược hành động mở khóa.

---

## Task 1 — Làm rõ vòng chơi của khách

**Ưu tiên:** P0  
**Mục tiêu:** Người chơi luôn biết khách đang ở trạng thái nào, cần gì và bước kế tiếp là gì.

### Hiện trạng cần xử lý

- Hint đã có trạng thái cảm xúc nhưng nội dung dài dễ chật trong panel nhỏ.
- Năm stage cảm xúc chưa được trình bày như một tiến trình trực quan.
- Sau thao tác đúng, phản hồi chính vẫn phụ thuộc nhiều vào text.

### Thay đổi đề xuất

1. Tách GuestHintUI thành ba lớp thông tin:
   - tên khách;
   - trạng thái hiện tại + tiến trình `1/5`;
   - một câu hướng dẫn ngắn.
2. Hiển thị trạng thái bằng màu lấy từ `EmotionMeta.color`.
3. Thêm trạng thái hành động rõ ràng:
   - `Đang cần được giúp đỡ`
   - `Đang dịu lại`
   - `Đã thả lỏng`
   - `Gần bình yên`
   - `Đã bình yên, sắp rời đi`
4. Rút gọn dialogue khi cần để không vượt chiều cao panel.
5. Khi khách đạt `PEACEFUL`, hiển thị thông báo riêng trước khi bắt đầu departure timer.

### Files dự kiến

- `src/ui/GuestHintUI.ts`
- `src/scenes/StationScene.ts`
- `src/systems/EmotionSystem.ts` nếu cần thêm helper stage metadata

### Tiêu chí hoàn thành

- Không có text bị cắt hoặc chồng trong panel ở canvas chuẩn và mobile.
- Player có thể hiểu bước tiếp theo mà không cần mở Recipe Book.
- Mỗi lần chuyển stage có ít nhất một feedback trực quan hoặc âm thanh.
- Guest vẫn chỉ có một emotion active tại một thời điểm.

### Kiểm thử

- Test mapping intensity -> stage label/progress.
- Browser QA: spawn từng guest, đưa qua ít nhất hai stage và xác nhận hint cập nhật.
- `npx tsc --noEmit && npx vitest run && npm run build`

---

## Task 2 — Phản hồi tức thì cho pha chế và giao món

**Ưu tiên:** P0  
**Mục tiêu:** Người chơi cảm nhận rõ nguyên nhân và kết quả của từng thao tác.

### Thay đổi đề xuất

1. Khi kéo nguyên liệu vào mixer:
   - slot sáng lên;
   - chất lỏng trong bát đổi màu theo nguyên liệu;
   - số nguyên liệu trong inventory có animation giảm.
2. Khi công thức đúng:
   - hiển thị tên recipe;
   - hiệu ứng pha chế ngắn;
   - món bay hoặc di chuyển rõ về phía guest;
   - guest đổi biểu cảm ngay.
3. Khi công thức sai:
   - giữ nguyên nguyên liệu để player có thể sửa;
   - cho phép lấy từng nguyên liệu ra và hoàn lại inventory;
   - câu lỗi phải nói rõ cần làm gì tiếp theo.
4. Khi giao đúng món:
   - particle và sound khác với lúc chỉ craft thành công;
   - cập nhật hint ngay trước khi stage mới được render.

### Files dự kiến

- `src/ui/WeatherMixerUI.ts`
- `src/systems/WeatherSystem.ts`
- `src/scenes/StationScene.ts`
- `src/systems/IngredientSystem.ts`
- `src/utils/ParticleEffect.ts`

### Tiêu chí hoàn thành

- Công thức sai không làm mất nguyên liệu.
- Player luôn có cách phục hồi từ mixer sai.
- Craft đúng và giao đúng là hai feedback khác nhau.
- Không tạo quá 12 particle sống cùng lúc trong overlay kéo dài.

### Kiểm thử

- Unit test: add/remove/refund ingredient trong mixer.
- Unit test: recipe đúng, recipe sai, recipe mới phát hiện.
- Browser QA: cố tình thả hai nguyên liệu sai, sửa lại, craft đúng.
- `npx tsc --noEmit && npx vitest run && npm run lint && npm run build`

---

## Task 3 — Onboarding một lượt chơi hoàn chỉnh

**Ưu tiên:** P0  
**Mục tiêu:** Người chơi mới hoàn thành được một vòng `khách -> pha chế -> làm dịu -> rời đi` mà không cần đọc tài liệu ngoài game.

### Flow đề xuất

```text
1. Khách xuất hiện
2. Hint chỉ nhu cầu của khách
3. Ingredient liên quan được highlight nhẹ
4. Player mở mixer và thêm nguyên liệu
5. Recipe đúng được craft
6. Player giao món cho khách
7. Guest chuyển stage rõ ràng
8. Guest vui và rời đi
9. Player nhận crystal + memory feedback
```

### Thay đổi đề xuất

- Chỉ chạy tutorial từng bước ở lần đầu.
- Cho phép bỏ qua tutorial và mở lại bằng Help.
- Không khóa toàn bộ game quá lâu; mỗi bước chỉ highlight mục tiêu kế tiếp.
- Không spawn guest thứ hai trong lúc tutorial đang chạy.
- Kết thúc tutorial bằng một thông báo ngắn về Journal, không mở quá nhiều UI cùng lúc.

### Files dự kiến

- `src/ui/WelcomeGuideUI.ts`
- `src/scenes/StationScene.ts`
- `src/systems/TutorialSystem.ts`
- `src/ui/InventoryUI.ts`
- `src/ui/WeatherMixerUI.ts`

### Tiêu chí hoàn thành

- Save mới có thể hoàn thành lượt đầu mà không bị kẹt.
- Reload giữa tutorial không làm mất trạng thái hoặc tạo guest trùng.
- Tutorial không làm thay đổi luật chơi của lượt bình thường.

### Kiểm thử

- Test tutorial state transitions.
- Browser QA với save sạch và reload giữa từng bước.
- `npx tsc --noEmit && npx vitest run && npm run build`

---

## Task 4 — Cloudy Origin Story

**Ưu tiên:** P1  
**Mục tiêu:** Tạo lý do cảm xúc dài hạn để người chơi tiếp tục chăm sóc trạm.

### Hướng nội dung

Không dùng cutscene dài. Câu chuyện được ghép từ các mảnh nhỏ:

```text
Guest memory / Photo / World event
              |
            Journal
              |
       Cloudy memory fragment
```

### Câu hỏi nội dung cần chốt trước khi code

- Cloudy sinh ra từ đâu?
- Ai đã xây trạm?
- Vì sao người chủ cũ rời đi?
- Cloudy nhớ được điều gì đầu tiên?
- Kết thúc câu chuyện là Cloudy tìm lại ai, hay tự hiểu mình là ai?

### Thay đổi đề xuất

- Thêm 4-6 Cloudy memory fragments.
- Mỗi fragment mở bằng điều kiện đã có: guest stage, photo, area hoặc rare event.
- Journal hiển thị fragment theo thứ tự phát hiện, không ép đọc ngay.
- Mỗi fragment phải liên quan đến hành động người chơi đã làm.

### Files dự kiến

- `public/data/journal.json`
- `src/systems/JournalSystem.ts`
- `src/scenes/JournalScene.ts`
- `src/entities/Cloudy.ts`
- save types/migration nếu schema cần mở rộng

### Tiêu chí hoàn thành

- Không tạo MemorySystem thứ hai.
- Fragment cũ vẫn đọc được sau migration.
- Người chơi có thể hiểu câu chuyện ngay cả khi mở khóa không theo đúng thứ tự.

---

## Task 5 — Rare Weather Events

**Ưu tiên:** P1  
**Mục tiêu:** Làm thế giới có những khoảnh khắc đáng nhớ mà không tạo FOMO.

### Sự kiện đầu tiên đề xuất: Meteor Shower

Điều kiện ví dụ:

- Stargazing Corner đã mở;
- Moon đã ghé đủ số lần;
- đang là ban đêm;
- không có guest đang ở trạng thái giao món.

Kết quả:

- ambient sky riêng;
- ingredient hoặc recipe đặc biệt;
- photo moment;
- journal/world memory;
- có thể xuất hiện lại theo chu kỳ.

### Kiến trúc

Tái sử dụng pattern của `RareGuestSystem`:

- data-driven definition;
- điều kiện unlock riêng;
- event lifecycle `available -> active -> completed`;
- không hardcode điều kiện trong `StationScene`.

### Files dự kiến

- `src/systems/RareWeatherSystem.ts`
- `src/systems/RareWeatherSystem.test.ts`
- `public/data/rareWeather.json`
- `src/scenes/StationScene.ts`
- `src/utils/ParticleEffect.ts`
- `public/data/photoMoments.json`
- `public/data/journal.json`

### Tiêu chí hoàn thành

- Sự kiện hiếm không cướp lượt của guest đang hoạt động.
- Không có hard FOMO hoặc event mất vĩnh viễn.
- Save/reload trong lúc event active không làm event chạy hai lần.
- Particle/audio có giới hạn cho mobile/WebView.

---

## Task 6 — Sky Archive

**Ưu tiên:** P1  
**Mục tiêu:** Cho người chơi thấy họ đã xây dựng được cả một thế giới, thay vì chỉ nhìn crystal counter.

### Nội dung hiển thị

- guest đã gặp;
- stage cảm xúc đã thấy;
- recipe đã khám phá;
- photo moments;
- journal memories;
- khu vực đã mở;
- rare guests và rare weather events;
- cosmetic của Cloudy.

### Hướng UI

- Một màn hình archive riêng, dùng tab hoặc filter nhỏ.
- Mỗi mục có trạng thái `đã mở khóa / chưa mở khóa`.
- Mục chưa mở chỉ hiển thị gợi ý mềm, không biến thành checklist áp lực.
- Dữ liệu đọc từ các system hiện có, không tạo nguồn dữ liệu song song.

### Files dự kiến

- `src/scenes/SkyArchiveScene.ts`
- `src/ui/SkyArchiveUI.ts` hoặc component tương đương
- `src/core/Game.ts`
- `src/ui/BottomNavUI.ts`

### Tiêu chí hoàn thành

- Archive không làm thay đổi progression logic.
- Dữ liệu phản ánh đúng save hiện tại sau reload.
- Có thể mở/đóng bằng pointer và keyboard.
- Layout đọc được ở desktop và mobile.

---

## Task 7 — World Memory Integration

**Ưu tiên:** P2  
**Mục tiêu:** Kết nối guest memory, Cloudy memory và world memory thành một mạch thống nhất.

### Phạm vi

- Không tạo hệ thống memory độc lập.
- Mở rộng model Journal hiện có với loại memory rõ ràng:
  - `guest`
  - `cloudy`
  - `world`
- Cho phép một hành động mở nhiều kết nối tự nhiên, ví dụ một Meteor Shower mở cả photo và world memory.

### Tiêu chí hoàn thành

- Journal vẫn là nơi đọc memory duy nhất.
- Archive và Journal không hiển thị cùng một nội dung theo hai cách mâu thuẫn.
- Mỗi memory mở khóa phải truy ngược được về hành động đã tạo ra nó.

---

## Release Gate cho roadmap này

Trước mỗi task tiếp theo phải đạt:

- `npx tsc --noEmit`
- `npx vitest run`
- `npm run lint`
- `npm run build`
- browser QA cho luồng pointer chính
- không có console error hoặc request lỗi
- kiểm tra save cũ và reload nếu task chạm vào persistence

## Thứ tự triển khai khuyến nghị

1. Task 1: Guest loop clarity
2. Task 2: Craft and delivery feedback
3. Task 3: First-session onboarding
4. Task 4: Cloudy Origin Story
5. Task 5: Rare Weather Events
6. Task 6: Sky Archive
7. Task 7: World Memory Integration

**Điểm dừng hợp lý:** Sau Task 3 nên chơi thử lại từ save sạch. Nếu vòng chơi đã rõ và có cảm xúc, mới bắt đầu đầu tư vào Cloudy story và rare events.
