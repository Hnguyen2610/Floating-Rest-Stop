# Floating Rest Stop — Trạm Dừng Chân Lơ Lửng

Game cozy nhỏ (Phaser 3 + TypeScript + Vite): chăm sóc và làm dịu những vị khách ghé qua trạm dừng chân trôi nổi giữa trời.

## Phát triển

```bash
npm install
npm run dev        # dev server (Vite)
npm test           # vitest
npm run typecheck   # tsc --noEmit
npm run lint
npm run format
```

## Build để phát hành

Game build ra 2 bản khác nhau tuỳ nền tảng — khác nhau đúng 1 chỗ: bản YouTube Playables có thêm thẻ `<script>` nạp SDK `window.ytgame` (bắt buộc theo yêu cầu của YouTube), bản web thường thì không. Cả hai dùng chung 1 `index.html`, khác biệt được `vite.config.ts` tự chèn vào lúc build tuỳ theo `--mode`.

**Bản web thường (GitHub Pages, itch.io, hoặc tự host):**

```bash
npm run build          # -> dist/
```

Dùng `base: './'` (đường dẫn asset tương đối) nên `dist/` chạy đúng dù host ở domain gốc hay dưới 1 thư mục con (vd. GitHub Pages project site `user.github.io/ten-repo/`, hoặc thư mục itch.io gán cho game) — không cần chỉnh sửa gì thêm, chỉ việc copy/deploy nguyên thư mục `dist/`.

- **GitHub Pages:** tự động qua `.github/workflows/deploy.yml` — mỗi lần push lên `main`, workflow chạy lint + test + `npm run build` rồi deploy thẳng `dist/` lên GitHub Pages. Cần bật 1 lần: repo Settings → Pages → Source → chọn "GitHub Actions" (không chọn nhánh `gh-pages` theo kiểu cũ). Có thể chạy tay qua tab Actions → "Deploy web build to GitHub Pages" → "Run workflow" (nhờ `workflow_dispatch`).
- **itch.io:** nén `dist/` thành file `.zip`, upload lên trang "Edit game" trên itch.io, chọn "This file will be played in the browser".

**Bản YouTube Playables:**

```bash
npm run build:playables   # -> dist-playables/
```

Nộp bản build này qua quy trình submit của YouTube Playables (https://developers.google.com/youtube/gaming/playables). Việc nộp/duyệt thật cần môi trường của Google, không tự động hoá được từ đây — nhánh `YouTubePlayablesPlatformAdapter`/`YouTubePlayablesSaveProvider` mới chỉ verify được bằng code review + test, chưa chạy thử trong môi trường nhúng YouTube thật.

## Kiến trúc

Xem `src/Plan.md` — nhật ký thiết kế + quyết định đầy đủ xuyên suốt quá trình làm game, theo từng pass/phase.
