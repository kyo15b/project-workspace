# 背景色選項

## 目前使用
- `0xe5e5e5` - 淺灰色 (跟原圖相近)

## 其他選項
- `0xe8e8e8` - 更淺的灰色
- `0xf5f5f5` - 幾乎白色的灰
- `0xdcdcdc` - 稍暗的灰色
- `0xf0f0f0` - 原本的顏色

## 修改方法
在 body-model-viewer.component.ts 第396行修改：
```typescript
this.scene.background = new THREE.Color(0xe5e5e5);
```