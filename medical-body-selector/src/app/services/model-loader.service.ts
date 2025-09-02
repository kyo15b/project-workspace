import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { BodyPart, Gender, ModelConfig } from '../models/body-part.model';

@Injectable({
  providedIn: 'root'
})
export class ModelLoaderService {
  private loader = new GLTFLoader();
  private currentModel$ = new BehaviorSubject<THREE.Group | null>(null);
  private currentGender$ = new BehaviorSubject<Gender>(Gender.MALE);
  private loadingState$ = new BehaviorSubject<boolean>(false);

  constructor() {}

  getCurrentModel(): Observable<THREE.Group | null> {
    return this.currentModel$.asObservable();
  }

  getCurrentGender(): Observable<Gender> {
    return this.currentGender$.asObservable();
  }

  getLoadingState(): Observable<boolean> {
    return this.loadingState$.asObservable();
  }

  async loadModel(gender: Gender): Promise<THREE.Group> {
    this.loadingState$.next(true);
    
    try {
      const modelPath = gender === Gender.MALE 
        ? 'assets/models/male-body.glb' 
        : 'assets/models/female-body.glb';

      const gltf = await new Promise<any>((resolve, reject) => {
        this.loader.load(
          modelPath,
          (gltf) => resolve(gltf),
          (progress) => console.log('Loading progress:', progress),
          (error) => reject(error)
        );
      });

      const model = gltf.scene;
      this.setupModelInteractivity(model);
      
      this.currentModel$.next(model);
      this.currentGender$.next(gender);
      
      return model;
    } catch (error) {
      console.error('Error loading model:', error);
      throw error;
    } finally {
      this.loadingState$.next(false);
    }
  }

  private setupModelInteractivity(model: THREE.Group): void {
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.userData.isBodyPart = true;
        child.userData.originalMaterial = child.material;
        
        // 為每個mesh添加身體部位信息
        this.assignBodyPartData(child);
      }
    });
  }

  private assignBodyPartData(mesh: THREE.Mesh): void {
    const meshName = mesh.name.toLowerCase();
    const bodyPartConfig = this.getBodyPartConfig(meshName);
    
    if (bodyPartConfig) {
      mesh.userData.bodyPart = bodyPartConfig;
    }
  }

  private getBodyPartConfig(meshName: string): BodyPart | null {
    // 根據mesh名稱匹配身體部位配置
    const bodyParts = this.getBodyPartsForCurrentGender();
    return bodyParts.find(part => 
      meshName.includes(part.meshName.toLowerCase()) || 
      part.meshName.toLowerCase().includes(meshName)
    ) || null;
  }

  private getBodyPartsForCurrentGender(): BodyPart[] {
    const currentGender = this.currentGender$.value;
    return this.getModelConfig(currentGender).bodyParts;
  }

  getModelConfig(gender: Gender): ModelConfig {
    if (gender === Gender.MALE) {
      return this.getMaleBodyConfig();
    } else {
      return this.getFemaleBodyConfig();
    }
  }

  private getMaleBodyConfig(): ModelConfig {
    return {
      gender: Gender.MALE,
      modelPath: 'assets/models/male-body.glb',
      bodyParts: [
        {
          id: 'head',
          name: 'Head',
          chineseName: '頭部',
          meshName: 'head',
          value: 'HEAD_001',
          category: 'head' as any,
          position: { x: 0, y: 1.7, z: 0 }
        },
        {
          id: 'chest',
          name: 'Chest',
          chineseName: '胸部',
          meshName: 'chest',
          value: 'CHEST_001',
          category: 'chest' as any,
          position: { x: 0, y: 1.2, z: 0 }
        },
        {
          id: 'abdomen',
          name: 'Abdomen',
          chineseName: '腹部',
          meshName: 'abdomen',
          value: 'ABDOMEN_001',
          category: 'abdomen' as any,
          position: { x: 0, y: 0.8, z: 0 }
        },
        {
          id: 'left_arm',
          name: 'Left Arm',
          chineseName: '左手臂',
          meshName: 'left_arm',
          value: 'LEFT_ARM_001',
          category: 'arms' as any,
          position: { x: -0.6, y: 1.2, z: 0 }
        },
        {
          id: 'right_arm',
          name: 'Right Arm',
          chineseName: '右手臂',
          meshName: 'right_arm',
          value: 'RIGHT_ARM_001',
          category: 'arms' as any,
          position: { x: 0.6, y: 1.2, z: 0 }
        },
        {
          id: 'left_leg',
          name: 'Left Leg',
          chineseName: '左腿',
          meshName: 'left_leg',
          value: 'LEFT_LEG_001',
          category: 'legs' as any,
          position: { x: -0.2, y: 0.4, z: 0 }
        },
        {
          id: 'right_leg',
          name: 'Right Leg',
          chineseName: '右腿',
          meshName: 'right_leg',
          value: 'RIGHT_LEG_001',
          category: 'legs' as any,
          position: { x: 0.2, y: 0.4, z: 0 }
        }
      ]
    };
  }

  private getFemaleBodyConfig(): ModelConfig {
    return {
      gender: Gender.FEMALE,
      modelPath: 'assets/models/female-body.glb',
      bodyParts: [
        {
          id: 'head',
          name: 'Head',
          chineseName: '頭部',
          meshName: 'head',
          value: 'HEAD_F001',
          category: 'head' as any,
          position: { x: 0, y: 1.65, z: 0 }
        },
        {
          id: 'chest',
          name: 'Chest',
          chineseName: '胸部',
          meshName: 'chest',
          value: 'CHEST_F001',
          category: 'chest' as any,
          position: { x: 0, y: 1.15, z: 0 }
        },
        {
          id: 'abdomen',
          name: 'Abdomen',
          chineseName: '腹部',
          meshName: 'abdomen',
          value: 'ABDOMEN_F001',
          category: 'abdomen' as any,
          position: { x: 0, y: 0.75, z: 0 }
        },
        {
          id: 'left_arm',
          name: 'Left Arm',
          chineseName: '左手臂',
          meshName: 'left_arm',
          value: 'LEFT_ARM_F001',
          category: 'arms' as any,
          position: { x: -0.55, y: 1.15, z: 0 }
        },
        {
          id: 'right_arm',
          name: 'Right Arm',
          chineseName: '右手臂',
          meshName: 'right_arm',
          value: 'RIGHT_ARM_F001',
          category: 'arms' as any,
          position: { x: 0.55, y: 1.15, z: 0 }
        },
        {
          id: 'left_leg',
          name: 'Left Leg',
          chineseName: '左腿',
          meshName: 'left_leg',
          value: 'LEFT_LEG_F001',
          category: 'legs' as any,
          position: { x: -0.15, y: 0.35, z: 0 }
        },
        {
          id: 'right_leg',
          name: 'Right Leg',
          chineseName: '右腿',
          meshName: 'right_leg',
          value: 'RIGHT_LEG_F001',
          category: 'legs' as any,
          position: { x: 0.15, y: 0.35, z: 0 }
        },
        {
          id: 'reproductive',
          name: 'Reproductive System',
          chineseName: '生殖系統',
          meshName: 'reproductive',
          value: 'REPRODUCTIVE_F001',
          category: 'reproductive' as any,
          position: { x: 0, y: 0.5, z: 0 }
        }
      ]
    };
  }

  switchGender(gender: Gender): Promise<THREE.Group> {
    return this.loadModel(gender);
  }

  highlightBodyPart(mesh: THREE.Mesh, highlight: boolean = true): void {
    if (!mesh.userData.bodyPart) return;

    if (highlight) {
      const highlightMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xff6b6b,
        transparent: true,
        opacity: 0.8
      });
      mesh.material = highlightMaterial;
    } else {
      mesh.material = mesh.userData.originalMaterial;
    }
  }

  getBodyPartFromMesh(mesh: THREE.Mesh): BodyPart | null {
    return mesh.userData.bodyPart || null;
  }
}