import { Injectable } from '@angular/core';
import { AnatomicalMapping, BodyPartCategory } from '../models/body-part.model';

@Injectable({
  providedIn: 'root'
})
export class AnatomicalMappingService {
  
  private readonly anatomicalMappings: AnatomicalMapping[] = [
    // 頭部系統
    { chineseName: '頭', englishName: 'Head', category: BodyPartCategory.HEAD, anatomicalCode: 'H001' },
    { chineseName: '頭皮', englishName: 'Scalp', category: BodyPartCategory.HEAD, anatomicalCode: 'H002' },
    { chineseName: '額頭', englishName: 'Forehead', category: BodyPartCategory.HEAD, anatomicalCode: 'H003' },
    { chineseName: '眼', englishName: 'Eyes', category: BodyPartCategory.HEAD, anatomicalCode: 'H004' },
    { chineseName: '左眼', englishName: 'Left Eye', category: BodyPartCategory.HEAD, anatomicalCode: 'H004L' },
    { chineseName: '右眼', englishName: 'Right Eye', category: BodyPartCategory.HEAD, anatomicalCode: 'H004R' },
    { chineseName: '鼻', englishName: 'Nose', category: BodyPartCategory.HEAD, anatomicalCode: 'H005' },
    { chineseName: '嘴', englishName: 'Mouth', category: BodyPartCategory.HEAD, anatomicalCode: 'H006' },
    { chineseName: '耳', englishName: 'Ears', category: BodyPartCategory.HEAD, anatomicalCode: 'H007' },
    { chineseName: '左耳', englishName: 'Left Ear', category: BodyPartCategory.HEAD, anatomicalCode: 'H007L' },
    { chineseName: '右耳', englishName: 'Right Ear', category: BodyPartCategory.HEAD, anatomicalCode: 'H007R' },
    
    // 頸部系統
    { chineseName: '頸', englishName: 'Neck', category: BodyPartCategory.NECK, anatomicalCode: 'N001' },
    { chineseName: '頸部', englishName: 'Neck', category: BodyPartCategory.NECK, anatomicalCode: 'N001' },
    { chineseName: '喉嚨', englishName: 'Throat', category: BodyPartCategory.NECK, anatomicalCode: 'N002' },
    
    // 胸部系統
    { chineseName: '胸', englishName: 'Chest', category: BodyPartCategory.CHEST, anatomicalCode: 'C001' },
    { chineseName: '胸部', englishName: 'Chest', category: BodyPartCategory.CHEST, anatomicalCode: 'C001' },
    { chineseName: '乳房', englishName: 'Breast', category: BodyPartCategory.CHEST, anatomicalCode: 'C002' },
    { chineseName: '左乳房', englishName: 'Left Breast', category: BodyPartCategory.CHEST, anatomicalCode: 'C002L' },
    { chineseName: '右乳房', englishName: 'Right Breast', category: BodyPartCategory.CHEST, anatomicalCode: 'C002R' },
    { chineseName: '肋骨', englishName: 'Ribs', category: BodyPartCategory.CHEST, anatomicalCode: 'C003' },
    
    // 腹部系統
    { chineseName: '腹', englishName: 'Abdomen', category: BodyPartCategory.ABDOMEN, anatomicalCode: 'A001' },
    { chineseName: '腹部', englishName: 'Abdomen', category: BodyPartCategory.ABDOMEN, anatomicalCode: 'A001' },
    { chineseName: '肚臍', englishName: 'Navel', category: BodyPartCategory.ABDOMEN, anatomicalCode: 'A002' },
    { chineseName: '腰', englishName: 'Waist', category: BodyPartCategory.ABDOMEN, anatomicalCode: 'A003' },
    { chineseName: '腰部', englishName: 'Waist', category: BodyPartCategory.ABDOMEN, anatomicalCode: 'A003' },
    
    // 背部系統
    { chineseName: '背', englishName: 'Back', category: BodyPartCategory.BACK, anatomicalCode: 'B001' },
    { chineseName: '背部', englishName: 'Back', category: BodyPartCategory.BACK, anatomicalCode: 'B001' },
    { chineseName: '肩膀', englishName: 'Shoulders', category: BodyPartCategory.BACK, anatomicalCode: 'B002' },
    { chineseName: '左肩', englishName: 'Left Shoulder', category: BodyPartCategory.BACK, anatomicalCode: 'B002L' },
    { chineseName: '右肩', englishName: 'Right Shoulder', category: BodyPartCategory.BACK, anatomicalCode: 'B002R' },
    
    // 手臂系統
    { chineseName: '手臂', englishName: 'Arms', category: BodyPartCategory.ARMS, anatomicalCode: 'AR001' },
    { chineseName: '左手臂', englishName: 'Left Arm', category: BodyPartCategory.ARMS, anatomicalCode: 'AR001L' },
    { chineseName: '右手臂', englishName: 'Right Arm', category: BodyPartCategory.ARMS, anatomicalCode: 'AR001R' },
    { chineseName: '上臂', englishName: 'Upper Arm', category: BodyPartCategory.ARMS, anatomicalCode: 'AR002' },
    { chineseName: '左上臂', englishName: 'Left Upper Arm', category: BodyPartCategory.ARMS, anatomicalCode: 'AR002L' },
    { chineseName: '右上臂', englishName: 'Right Upper Arm', category: BodyPartCategory.ARMS, anatomicalCode: 'AR002R' },
    { chineseName: '前臂', englishName: 'Forearm', category: BodyPartCategory.ARMS, anatomicalCode: 'AR003' },
    { chineseName: '左前臂', englishName: 'Left Forearm', category: BodyPartCategory.ARMS, anatomicalCode: 'AR003L' },
    { chineseName: '右前臂', englishName: 'Right Forearm', category: BodyPartCategory.ARMS, anatomicalCode: 'AR003R' },
    { chineseName: '肘', englishName: 'Elbow', category: BodyPartCategory.ARMS, anatomicalCode: 'AR004' },
    { chineseName: '左肘', englishName: 'Left Elbow', category: BodyPartCategory.ARMS, anatomicalCode: 'AR004L' },
    { chineseName: '右肘', englishName: 'Right Elbow', category: BodyPartCategory.ARMS, anatomicalCode: 'AR004R' },
    
    // 手部系統
    { chineseName: '手', englishName: 'Hands', category: BodyPartCategory.HANDS, anatomicalCode: 'H001' },
    { chineseName: '左手', englishName: 'Left Hand', category: BodyPartCategory.HANDS, anatomicalCode: 'H001L' },
    { chineseName: '右手', englishName: 'Right Hand', category: BodyPartCategory.HANDS, anatomicalCode: 'H001R' },
    { chineseName: '手掌', englishName: 'Palm', category: BodyPartCategory.HANDS, anatomicalCode: 'H002' },
    { chineseName: '左手掌', englishName: 'Left Palm', category: BodyPartCategory.HANDS, anatomicalCode: 'H002L' },
    { chineseName: '右手掌', englishName: 'Right Palm', category: BodyPartCategory.HANDS, anatomicalCode: 'H002R' },
    { chineseName: '手指', englishName: 'Fingers', category: BodyPartCategory.HANDS, anatomicalCode: 'H003' },
    { chineseName: '拇指', englishName: 'Thumb', category: BodyPartCategory.HANDS, anatomicalCode: 'H003T' },
    { chineseName: '食指', englishName: 'Index Finger', category: BodyPartCategory.HANDS, anatomicalCode: 'H003I' },
    { chineseName: '中指', englishName: 'Middle Finger', category: BodyPartCategory.HANDS, anatomicalCode: 'H003M' },
    { chineseName: '無名指', englishName: 'Ring Finger', category: BodyPartCategory.HANDS, anatomicalCode: 'H003R' },
    { chineseName: '小指', englishName: 'Little Finger', category: BodyPartCategory.HANDS, anatomicalCode: 'H003L' },
    { chineseName: '手腕', englishName: 'Wrist', category: BodyPartCategory.HANDS, anatomicalCode: 'H004' },
    { chineseName: '左手腕', englishName: 'Left Wrist', category: BodyPartCategory.HANDS, anatomicalCode: 'H004L' },
    { chineseName: '右手腕', englishName: 'Right Wrist', category: BodyPartCategory.HANDS, anatomicalCode: 'H004R' },
    
    // 腿部系統
    { chineseName: '腿', englishName: 'Legs', category: BodyPartCategory.LEGS, anatomicalCode: 'L001' },
    { chineseName: '左腿', englishName: 'Left Leg', category: BodyPartCategory.LEGS, anatomicalCode: 'L001L' },
    { chineseName: '右腿', englishName: 'Right Leg', category: BodyPartCategory.LEGS, anatomicalCode: 'L001R' },
    { chineseName: '大腿', englishName: 'Thigh', category: BodyPartCategory.LEGS, anatomicalCode: 'L002' },
    { chineseName: '左大腿', englishName: 'Left Thigh', category: BodyPartCategory.LEGS, anatomicalCode: 'L002L' },
    { chineseName: '右大腿', englishName: 'Right Thigh', category: BodyPartCategory.LEGS, anatomicalCode: 'L002R' },
    { chineseName: '小腿', englishName: 'Calf', category: BodyPartCategory.LEGS, anatomicalCode: 'L003' },
    { chineseName: '左小腿', englishName: 'Left Calf', category: BodyPartCategory.LEGS, anatomicalCode: 'L003L' },
    { chineseName: '右小腿', englishName: 'Right Calf', category: BodyPartCategory.LEGS, anatomicalCode: 'L003R' },
    { chineseName: '膝', englishName: 'Knee', category: BodyPartCategory.LEGS, anatomicalCode: 'L004' },
    { chineseName: '左膝', englishName: 'Left Knee', category: BodyPartCategory.LEGS, anatomicalCode: 'L004L' },
    { chineseName: '右膝', englishName: 'Right Knee', category: BodyPartCategory.LEGS, anatomicalCode: 'L004R' },
    { chineseName: '臀部', englishName: 'Buttocks', category: BodyPartCategory.LEGS, anatomicalCode: 'L005' },
    
    // 足部系統
    { chineseName: '腳', englishName: 'Feet', category: BodyPartCategory.FEET, anatomicalCode: 'F001' },
    { chineseName: '左腳', englishName: 'Left Foot', category: BodyPartCategory.FEET, anatomicalCode: 'F001L' },
    { chineseName: '右腳', englishName: 'Right Foot', category: BodyPartCategory.FEET, anatomicalCode: 'F001R' },
    { chineseName: '腳掌', englishName: 'Sole', category: BodyPartCategory.FEET, anatomicalCode: 'F002' },
    { chineseName: '左腳掌', englishName: 'Left Sole', category: BodyPartCategory.FEET, anatomicalCode: 'F002L' },
    { chineseName: '右腳掌', englishName: 'Right Sole', category: BodyPartCategory.FEET, anatomicalCode: 'F002R' },
    { chineseName: '腳趾', englishName: 'Toes', category: BodyPartCategory.FEET, anatomicalCode: 'F003' },
    { chineseName: '腳踝', englishName: 'Ankle', category: BodyPartCategory.FEET, anatomicalCode: 'F004' },
    { chineseName: '左腳踝', englishName: 'Left Ankle', category: BodyPartCategory.FEET, anatomicalCode: 'F004L' },
    { chineseName: '右腳踝', englishName: 'Right Ankle', category: BodyPartCategory.FEET, anatomicalCode: 'F004R' },
    
    // 生殖系統
    { chineseName: '生殖器', englishName: 'Reproductive System', category: BodyPartCategory.REPRODUCTIVE, anatomicalCode: 'R001' },
    { chineseName: '骨盆', englishName: 'Pelvis', category: BodyPartCategory.REPRODUCTIVE, anatomicalCode: 'R002' },
    
    // 內臟系統
    { chineseName: '心', englishName: 'Heart', category: BodyPartCategory.INTERNAL_ORGANS, anatomicalCode: 'IO001' },
    { chineseName: '肺', englishName: 'Lungs', category: BodyPartCategory.INTERNAL_ORGANS, anatomicalCode: 'IO002' },
    { chineseName: '左肺', englishName: 'Left Lung', category: BodyPartCategory.INTERNAL_ORGANS, anatomicalCode: 'IO002L' },
    { chineseName: '右肺', englishName: 'Right Lung', category: BodyPartCategory.INTERNAL_ORGANS, anatomicalCode: 'IO002R' },
    { chineseName: '肝', englishName: 'Liver', category: BodyPartCategory.INTERNAL_ORGANS, anatomicalCode: 'IO003' },
    { chineseName: '腎', englishName: 'Kidneys', category: BodyPartCategory.INTERNAL_ORGANS, anatomicalCode: 'IO004' },
    { chineseName: '左腎', englishName: 'Left Kidney', category: BodyPartCategory.INTERNAL_ORGANS, anatomicalCode: 'IO004L' },
    { chineseName: '右腎', englishName: 'Right Kidney', category: BodyPartCategory.INTERNAL_ORGANS, anatomicalCode: 'IO004R' },
    { chineseName: '胃', englishName: 'Stomach', category: BodyPartCategory.INTERNAL_ORGANS, anatomicalCode: 'IO005' },
    { chineseName: '腸', englishName: 'Intestines', category: BodyPartCategory.INTERNAL_ORGANS, anatomicalCode: 'IO006' },
    { chineseName: '膀胱', englishName: 'Bladder', category: BodyPartCategory.INTERNAL_ORGANS, anatomicalCode: 'IO007' }
  ];

  private readonly categoryColors: Map<BodyPartCategory, string> = new Map([
    [BodyPartCategory.HEAD, '#FF6B6B'],
    [BodyPartCategory.NECK, '#4ECDC4'],
    [BodyPartCategory.CHEST, '#45B7D1'],
    [BodyPartCategory.ABDOMEN, '#96CEB4'],
    [BodyPartCategory.BACK, '#FFEAA7'],
    [BodyPartCategory.ARMS, '#DDA0DD'],
    [BodyPartCategory.HANDS, '#98D8C8'],
    [BodyPartCategory.LEGS, '#F7DC6F'],
    [BodyPartCategory.FEET, '#BB8FCE'],
    [BodyPartCategory.REPRODUCTIVE, '#F1948A'],
    [BodyPartCategory.INTERNAL_ORGANS, '#85C1E9'],
    [BodyPartCategory.SKELETAL, '#D5DBDB'],
    [BodyPartCategory.MUSCULAR, '#F8C471'],
    [BodyPartCategory.NERVOUS, '#AED6F1'],
    [BodyPartCategory.VASCULAR, '#F5B7B1']
  ]);

  constructor() { }

  /**
   * 根據中文名稱查找解剖映射
   */
  getMappingByChineseName(chineseName: string): AnatomicalMapping | undefined {
    return this.anatomicalMappings.find(mapping => mapping.chineseName === chineseName);
  }

  /**
   * 根據英文名稱查找解剖映射
   */
  getMappingByEnglishName(englishName: string): AnatomicalMapping | undefined {
    return this.anatomicalMappings.find(mapping => mapping.englishName === englishName);
  }

  /**
   * 根據解剖代碼查找映射
   */
  getMappingByCode(anatomicalCode: string): AnatomicalMapping | undefined {
    return this.anatomicalMappings.find(mapping => mapping.anatomicalCode === anatomicalCode);
  }

  /**
   * 根據分類獲取所有部位
   */
  getMappingsByCategory(category: BodyPartCategory): AnatomicalMapping[] {
    return this.anatomicalMappings.filter(mapping => mapping.category === category);
  }

  /**
   * 獲取所有可用的分類
   */
  getAllCategories(): BodyPartCategory[] {
    return Object.values(BodyPartCategory);
  }

  /**
   * 獲取分類顏色
   */
  getCategoryColor(category: BodyPartCategory): string {
    return this.categoryColors.get(category) || '#95A5A6';
  }

  /**
   * 模糊搜尋身體部位
   */
  searchBodyParts(searchTerm: string): AnatomicalMapping[] {
    const term = searchTerm.toLowerCase();
    return this.anatomicalMappings.filter(mapping => 
      mapping.chineseName.toLowerCase().includes(term) ||
      mapping.englishName.toLowerCase().includes(term) ||
      mapping.anatomicalCode.toLowerCase().includes(term)
    );
  }

  /**
   * 獲取所有映射
   */
  getAllMappings(): AnatomicalMapping[] {
    return this.anatomicalMappings;
  }

  /**
   * 驗證部位名稱是否存在
   */
  isValidBodyPart(name: string): boolean {
    return this.anatomicalMappings.some(mapping => 
      mapping.chineseName === name || mapping.englishName === name
    );
  }

  /**
   * 將Blender物件名稱標準化
   */
  normalizeBlenderObjectName(objectName: string): string {
    // 移除Blender的數字後綴 (如 "左手.001" -> "左手")
    return objectName.replace(/\.\d+$/, '');
  }

  /**
   * 根據Blender物件名稱獲取標準化的身體部位資訊
   */
  getBodyPartFromBlenderName(blenderName: string): AnatomicalMapping | undefined {
    const normalizedName = this.normalizeBlenderObjectName(blenderName);
    return this.getMappingByChineseName(normalizedName);
  }
}