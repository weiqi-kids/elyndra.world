# Magic Campus Chat

這是一個使用 [React](https://react.dev/)、[Vite](https://vitejs.dev/) 與 [Tailwind CSS](https://tailwindcss.com/) 打造的多欄位聊天介面，採用 TypeScript 與 [shadcn/ui](https://ui.shadcn.com/) 的 UI 元件。

## 功能特色

- 側邊欄導覽不同區域
- 對話列表含未讀徽章
- 訊息區與輸入框
- 響應式排版並支援行動抽屜

## 開始使用

安裝 Node.js 18 或以上版本後，請執行：

```bash
npm install
```

啟動開發伺服器：

```bash
npm run dev
```

預設服務網址為 `http://localhost:5173`。

## 建置

建立正式版本：

```bash
npm run build
```

可在本機預覽：

```bash
npm run preview
```

若需將應用程式部署於子目錄，建置時可設定 `BASE` 環境變數：

```bash
BASE=/my-subdir/ npm run build
```

## 授權

本專案以 MIT 授權條款釋出，詳見 [LICENSE](./LICENSE)。
