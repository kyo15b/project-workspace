# 醫療身體部位選擇器

這是一個基於Angular 13和Three.js的醫療網頁應用程式，支援男性和女性3D人體模型的互動式身體部位選擇功能。

## 功能特點

- 🏥 醫療級身體部位選擇
- 👫 支援男性和女性人體模型
- 🎯 點擊「部位」按鈕顯示3D人體模型
- 🖱️ 滑鼠互動選擇身體部位
- 📊 返回對應的身體部位數值
- 📱 響應式設計，支援多種設備
- 💾 選擇資料匯出功能

## 技術架構

- **前端框架**: Angular 13
- **3D渲染**: Three.js
- **模型格式**: glTF/GLB
- **樣式**: SCSS
- **狀態管理**: RxJS

## 專案結構

```
src/
├── app/
│   ├── components/
│   │   ├── body-model-viewer.component.*     # 3D模型檢視器組件
│   │   └── body-part-list.component.*        # 身體部位列表組件
│   ├── services/
│   │   ├── model-loader.service.ts           # 模型載入服務
│   │   └── body-part-selection.service.ts    # 身體部位選擇服務
│   ├── models/
│   │   └── body-part.model.ts                # 資料模型定義
│   └── app.*                                 # 應用程式根組件
├── assets/
│   └── models/
│       ├── male-body.glb                     # 男性人體模型
│       └── female-body.glb                   # 女性人體模型
└── styles.scss                              # 全域樣式
```

## 模型轉換步驟

### 1. 將.blend文件轉換為glTF/GLB格式

#### 方法一：使用Blender內建匯出功能
```bash
1. 開啟Blender
2. 載入.blend文件 (model-2025-07-02(MaleBody).blend 或 model-2025-08-11(FemaleBody).blend)
3. 選擇 File > Export > glTF 2.0 (.glb/.gltf)
4. 選擇GLB格式（二進位，檔案較小）
5. 設定匯出選項：
   - Include: Selected Objects（如果只要特定物件）
   - Transform: +Y Up（Angular/Three.js標準）
   - Geometry: Apply Modifiers
   - Animation: 根據需要選擇
6. 匯出為 male-body.glb 和 female-body.glb
```

#### 方法二：使用Blender命令列
```bash
blender --background model-2025-07-02\(MaleBody\).blend --python-expr "
import bpy
bpy.ops.export_scene.gltf(
    filepath='male-body.glb',
    export_format='GLB',
    export_apply=True,
    export_yup=True
)
"

blender --background model-2025-08-11\(FemaleBody\).blend --python-expr "
import bpy
bpy.ops.export_scene.gltf(
    filepath='female-body.glb',
    export_format='GLB',
    export_apply=True,
    export_yup=True
)
"
```

### 2. 優化模型檔案
```bash
# 使用gltf-pipeline優化（可選）
npm install -g gltf-pipeline

# 壓縮模型
gltf-pipeline -i male-body.glb -o male-body-optimized.glb --draco.compressionLevel 10
gltf-pipeline -i female-body.glb -o female-body-optimized.glb --draco.compressionLevel 10
```

## 安裝和運行

### 1. 安裝相依套件
```bash
npm install
```

### 2. 放置模型檔案
將轉換後的模型檔案放置到：
- `src/assets/models/male-body.glb`
- `src/assets/models/female-body.glb`

### 3. 啟動開發伺服器
```bash
ng serve
```

應用程式將在 http://localhost:4200 上運行

### 4. 建置正式版本
```bash
ng build --prod
```

## 使用方式

1. **選擇性別**: 點擊「男性」或「女性」按鈕
2. **顯示模型**: 點擊「部位」按鈕載入3D人體模型
3. **選擇部位**: 
   - 滑鼠懸停在身體部位上會顯示高亮效果
   - 點擊身體部位進行選擇
   - 右側列表會顯示所有可選部位
4. **查看結果**: 選擇後會顯示對應的身體部位資訊和返回值
5. **匯出資料**: 可將選擇結果匯出為JSON檔案

## 身體部位映射

### 男性模型部位
- 頭部 (HEAD_001)
- 胸部 (CHEST_001)
- 腹部 (ABDOMEN_001)
- 左手臂 (LEFT_ARM_001)
- 右手臂 (RIGHT_ARM_001)
- 左腿 (LEFT_LEG_001)
- 右腿 (RIGHT_LEG_001)

### 女性模型部位
- 頭部 (HEAD_F001)
- 胸部 (CHEST_F001)
- 腹部 (ABDOMEN_F001)
- 左手臂 (LEFT_ARM_F001)
- 右手臂 (RIGHT_ARM_F001)
- 左腿 (LEFT_LEG_F001)
- 右腿 (RIGHT_LEG_F001)
- 生殖系統 (REPRODUCTIVE_F001)

## API介面

### 選擇事件
```javascript
// 監聽身體部位選擇事件
window.addEventListener('bodyPartSelected', (event) => {
  console.log('選擇的部位:', event.detail);
  // event.detail 包含：
  // {
  //   id: string,
  //   name: string,
  //   chineseName: string,
  //   value: string,
  //   category: string,
  //   timestamp: string
  // }
});
```

### 程式化控制
```typescript
// 注入服務
constructor(
  private bodyPartSelection: BodyPartSelectionService,
  private modelLoader: ModelLoaderService
) {}

// 取得選擇資料
const selectionData = this.bodyPartSelection.getSelectionData();
const selectionValues = this.bodyPartSelection.getSelectionValues();

// 切換模型
await this.modelLoader.switchGender(Gender.FEMALE);

// 程式化選擇
this.bodyPartSelection.selectBodyPart(bodyPart);
```

## 自訂設定

### 修改身體部位配置
編輯 `src/app/services/model-loader.service.ts` 中的 `getMaleBodyConfig()` 和 `getFemaleBodyConfig()` 方法來自訂身體部位映射。

### 樣式客製化
修改各組件的SCSS檔案來調整視覺外觀。

### 新增身體部位類別
在 `src/app/models/body-part.model.ts` 中的 `BodyPartCategory` 枚舉新增類別。

## 瀏覽器支援

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 注意事項

1. **模型檔案大小**: GLB檔案可能較大，建議使用CDN或進行壓縮
2. **記憶體使用**: 3D模型會消耗較多記憶體，在移動裝置上需注意效能
3. **網路連線**: 首次載入模型需要下載檔案，建議提供載入進度提示
4. **瀏覽器相容性**: 確保目標瀏覽器支援WebGL

## 開發指南

### 新增身體部位
1. 在模型配置中新增部位定義
2. 確保模型中對應的mesh名稱正確
3. 更新身體部位類別（如需要）
4. 測試選擇和高亮功能

### 效能優化
- 使用LOD（細節層次）模型
- 實施視椎體剔除
- 優化材質和紋理
- 壓縮模型檔案

## 授權條款

請根據您的專案需求設定適當的授權條款。