# 經彩青春協奏曲｜高中版分支互動遊戲

高中版「月經教育 x 概念運用」，採補習班四名同學（予晴、柏宇、子涵、怡庭）的群體議題討論。

## 劇本與評量狀態
- 劇本來源：2026-10-18《高中版網格劇本・雙通關審議稿》（教師審議稿）。
- 13 個情境節點、39 個四字行為選項、27 條完整路徑，結局皆提供「討論收束、做得好的地方、可以改進的地方」。
- 審議稿暫定通關：**AAB、CBA**；其餘 25 條仍可完整體驗及查看回饋。
- 這是審議階段的通關設定，**不代表正式的教學評量標準**。

## 開啟網站
- 首頁：https://kaoelvmpvm.github.io/jingcai-branching-story-game-sh/
- 教師版劇本網格：https://kaoelvmpvm.github.io/jingcai-branching-story-game-sh/story-grid.html

若 GitHub Pages 尚未啟用，請至 Settings → Pages → Build and deployment → Source 選 **GitHub Actions**；儲存後在 Actions 重新執行 Deploy senior-high branching game。連結僅在部署成功後有效。

## 程式結構
- `index.html`：首頁、三次選擇、結局與回饋介面
- `assets/app.js`：互動流程、上一頁、確認、回饋
- `assets/style.css`：高中版藍紫色響應式設計
- `data/story.js`：完整 13 節點與 27 結局資料。需要改劇本優先改此檔
- `story-grid.html`：教師檢視及 CSV 下載
- `tests/story.test.cjs`：完整分支與結局一致性驗證
- `.github/workflows/deploy.yml`：CI 與 GitHub Pages

## 圖像素材
現階段未製作高中版人物與劇情插圖，13 個情境均保留「劇情圖片」佔位。日後可直接上傳 `images/S0.webp`、`images/A1.webp`、`images/AA2.webp` 等共 13 張對應檔案，不必修改程式即可顯示。**國小版圖像和第一幕影片未移植**，以免內容錯置。

## 驗證
執行 `node --test tests/story.test.cjs`。網站為純靜態 HTML/CSS/JavaScript，不需要安裝 Node 套件即可開啟（驗證腳本使用 Node 標準函式庫）。
