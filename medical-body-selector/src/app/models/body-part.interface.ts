// 身體部位介面定義
export interface BodyPart {
  value: string;           // 從 Blender custom property 取得
  displayName: string;     // 中文顯示名稱
  medicalCode?: string;    // 醫療代碼 (可選)
  uuid: string;           // Three.js 物件 UUID
  object3D: any;          // Three.js 物件參考
}

export interface BodyPartClickEvent {
  bodyPart: BodyPart;
  clickPosition: {
    x: number;
    y: number;
    z: number;
  };
  timestamp: Date;
}

export interface ModelLoadProgress {
  loaded: number;
  total: number;
  percentage: number;
}