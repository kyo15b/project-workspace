# Project Workspace

這是一個多專案工作區，用於管理不同的開發專案，並共用 Claude Code sub agent 配置。

## 專案結構

```
project-workspace/
├── .claude/                    # 共用的 Claude Code sub agent 設定
│   ├── agents/                 # sub agent 配置檔案
│   └── settings.local.json     # 本地設定
├── medical-body-selector/      # 醫療人形圖部位選擇器
│   ├── src/                    # Angular 13 應用程式碼
│   ├── blender-scripts/        # Blender 自動化腳本
│   ├── dist/                   # 建置輸出
│   └── *.blend                 # 3D 模型檔案
├── shared/                     # 共用資源
└── README.md                   # 此檔案
```

## 可用的 Sub Agents

- **PM (Product Manager)** - 產品管理和需求分析
- **SA (System Analyst)** - 系統分析和架構設計  
- **Frontend Engineer** - 前端開發（Angular, React 等）
- **Backend Engineer** - 後端開發和 API 設計
- **Test Engineer** - 測試策略和自動化測試
- **QC Engineer** - 品質控制和程式碼審查
- **Technical Analyst** - 技術分析和金融市場分析

## 專案說明

### Medical Body Selector
- **技術棧**: Angular 13 + Three.js + TypeScript
- **功能**: 3D 人體模型互動選擇器，用於醫療應用
- **特色**: 
  - 3D 身體部位點擊選擇
  - Blender 整合工作流程
  - 響應式設計
  - 橙色高亮選擇效果

## 快速開始

### 醫療身體選擇器
```bash
cd medical-body-selector
npm install
ng serve
# 開啟 http://localhost:4200
```

## Git 管理

每個專案維護自己的版本控制，同時共用 sub agent 設定：

```bash
# 提交特定專案變更
git add medical-body-selector/
git commit -m "feat: update medical project"

# 提交共用設定變更  
git add .claude/
git commit -m "config: update sub agent settings"
```

## 新增專案

要新增新專案：
1. 在根目錄建立新專案資料夾
2. 項目可以使用共用的 `.claude/` 設定
3. 更新此 README.md 檔案

## 開發環境需求

- Node.js 16+
- Angular CLI 13+ (針對 Angular 專案)
- Git
- Claude Code (推薦)

## Sub Agent 使用

在任何子專案中，你都可以使用以下 sub agent：

```bash
# 例如，在醫療專案中使用前端工程師 agent
@frontend-engineer "幫我優化 Three.js 的渲染效能"

# 或使用產品經理 agent 分析需求
@pm "分析醫療應用的使用者需求"
```

## 聯絡資訊

- 開發者: kyo15b
- GitHub: https://github.com/kyo15b