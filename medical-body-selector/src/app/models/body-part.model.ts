export interface BodyPart {
  id: string;
  name: string;
  chineseName: string;
  englishName: string;
  meshName: string;
  value: string | number;
  category: BodyPartCategory;
  subCategory?: string;
  anatomicalCode?: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  children?: BodyPart[];
  parent?: string;
  isVisible: boolean;
  isClickable: boolean;
}

export enum BodyPartCategory {
  HEAD = '頭部',
  NECK = '頸部',
  CHEST = '胸部',
  ABDOMEN = '腹部',
  BACK = '背部',
  ARMS = '手臂',
  HANDS = '手部',
  LEGS = '腿部',
  FEET = '足部',
  REPRODUCTIVE = '生殖系統',
  INTERNAL_ORGANS = '內臟器官',
  SKELETAL = '骨骼系統',
  MUSCULAR = '肌肉系統',
  NERVOUS = '神經系統',
  VASCULAR = '血管系統'
}

export interface BodyPartGroup {
  id: string;
  name: string;
  chineseName: string;
  category: BodyPartCategory;
  parts: BodyPart[];
  isExpanded: boolean;
  color: string;
}

export interface AnatomicalMapping {
  chineseName: string;
  englishName: string;
  category: BodyPartCategory;
  subCategory?: string;
  anatomicalCode: string;
  description?: string;
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female'
}

export interface ModelConfig {
  gender: Gender;
  modelPath: string;
  bodyParts: BodyPart[];
}