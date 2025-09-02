import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { BodyPart, BodyPartClickEvent, ModelLoadProgress } from '../models/body-part.interface';

@Injectable({
  providedIn: 'root'
})
export class BodyModelService {
  private selectedPartsSubject = new BehaviorSubject<BodyPart[]>([]);
  private loadingProgressSubject = new BehaviorSubject<ModelLoadProgress>({ loaded: 0, total: 0, percentage: 0 });
  
  public selectedParts$ = this.selectedPartsSubject.asObservable();
  public loadingProgress$ = this.loadingProgressSubject.asObservable();
  
  private gltfLoader!: GLTFLoader;
  private currentModel: THREE.Group | null = null;
  private originalMaterials: Map<string, THREE.Material> = new Map();

  constructor() {
    this.initLoaders();
  }

  private initLoaders(): void {
    this.gltfLoader = new GLTFLoader();
    
    // 設置 Draco 解碼器 (如果需要壓縮)
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/assets/draco/');
    this.gltfLoader.setDRACOLoader(dracoLoader);
  }

  async loadModel(modelPath: string): Promise<THREE.Group> {
    return new Promise((resolve, reject) => {
      this.gltfLoader.load(
        modelPath,
        (gltf) => {
          this.currentModel = gltf.scene;
          this.processModelParts(this.currentModel);
          resolve(this.currentModel);
        },
        (progress) => {
          const loadProgress: ModelLoadProgress = {
            loaded: progress.loaded,
            total: progress.total,
            percentage: progress.total > 0 ? (progress.loaded / progress.total) * 100 : 0
          };
          this.loadingProgressSubject.next(loadProgress);
        },
        (error) => {
          console.error('模型載入失敗:', error);
          reject(error);
        }
      );
    });
  }

  private processModelParts(model: THREE.Group): void {
    // 遍歷所有子物件，設置互動屬性
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // 儲存原始材質
        if (child.material) {
          this.originalMaterials.set(child.uuid, child.material.clone());
        }
        
        // 設置可點擊標記
        child.userData['clickable'] = true;
        
        // 如果沒有 custom property value，使用物件名稱
        if (!child.userData['value']) {
          child.userData['value'] = child.name;
        }
      }
    });
  }

  // 根據 ChatGPT 建議的父節點遍歷方法
  findBodyPartValue(hitObject: THREE.Object3D): BodyPart | null {
    let obj: THREE.Object3D | null = hitObject;
    
    // 向上遍歷父節點，尋找有 value 的物件
    while (obj && !obj.userData?.['value'] && obj.parent) {
      obj = obj.parent;
    }
    
    if (obj && obj.userData?.['value']) {
      return {
        value: String(obj.userData['value']),
        displayName: obj.userData['display_name'] || obj.userData['value'] || obj.name,
        medicalCode: obj.userData['medical_code'],
        uuid: obj.uuid,
        object3D: obj
      };
    }
    
    return null;
  }

  selectBodyPart(bodyPart: BodyPart, clickPosition: THREE.Vector3): void {
    const currentSelected = this.selectedPartsSubject.value;
    
    // 檢查是否已選擇
    const existingIndex = currentSelected.findIndex(part => part.uuid === bodyPart.uuid);
    
    if (existingIndex === -1) {
      // 新增選擇
      const updatedSelection = [...currentSelected, bodyPart];
      this.selectedPartsSubject.next(updatedSelection);
      this.highlightBodyPart(bodyPart, true);
    } else {
      // 取消選擇
      const updatedSelection = currentSelected.filter(part => part.uuid !== bodyPart.uuid);
      this.selectedPartsSubject.next(updatedSelection);
      this.highlightBodyPart(bodyPart, false);
    }

    // 發出點擊事件
    const clickEvent: BodyPartClickEvent = {
      bodyPart,
      clickPosition: {
        x: clickPosition.x,
        y: clickPosition.y,
        z: clickPosition.z
      },
      timestamp: new Date()
    };
    
    console.log('身體部位選擇事件:', clickEvent);
  }

  private highlightBodyPart(bodyPart: BodyPart, highlight: boolean): void {
    const object3D = bodyPart.object3D as THREE.Mesh;
    
    if (highlight) {
      // 使用輪廓高亮，而非改變材質
      this.addOutlineEffect(object3D);
    } else {
      // 移除輪廓效果
      this.removeOutlineEffect(object3D);
    }
  }

  private addOutlineEffect(mesh: THREE.Mesh): void {
    // 創建橙色高亮效果，仿照 Blender 選取樣式
    const highlightMaterial = new THREE.MeshStandardMaterial({
      color: 0xff6600, // Blender 樣式的橙色
      transparent: true,
      opacity: 0.7,
      emissive: 0xff4400,
      emissiveIntensity: 0.3
    });

    const highlightGeometry = mesh.geometry.clone();
    const highlightMesh = new THREE.Mesh(highlightGeometry, highlightMaterial);
    
    // 稍微放大來創建高亮效果，模仿 Blender 選取樣式
    highlightMesh.scale.multiplyScalar(1.015);
    highlightMesh.name = `highlight_${mesh.uuid}`;
    highlightMesh.userData['isHighlight'] = true;
    
    // 添加到同一個父節點
    if (mesh.parent) {
      mesh.parent.add(highlightMesh);
    }
  }

  private removeOutlineEffect(mesh: THREE.Mesh): void {
    // 找到並移除高亮效果
    if (mesh.parent) {
      const highlightName = `highlight_${mesh.uuid}`;
      const highlightToRemove = mesh.parent.getObjectByName(highlightName);
      if (highlightToRemove) {
        mesh.parent.remove(highlightToRemove);
        // 清理幾何體和材質
        if (highlightToRemove instanceof THREE.Mesh) {
          highlightToRemove.geometry.dispose();
          if (highlightToRemove.material instanceof THREE.Material) {
            highlightToRemove.material.dispose();
          }
        }
      }
    }
  }

  clearAllSelections(): void {
    const currentSelected = this.selectedPartsSubject.value;
    currentSelected.forEach(part => {
      this.highlightBodyPart(part, false);
    });
    this.selectedPartsSubject.next([]);
  }

  getSelectedValues(): string[] {
    return this.selectedPartsSubject.value.map(part => part.value);
  }

  dispose(): void {
    this.originalMaterials.clear();
    this.clearAllSelections();
  }
}