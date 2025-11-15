import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { BodyModelService } from '../services/body-model.service';
import { BodyPart, BodyPartClickEvent, ModelLoadProgress } from '../models/body-part.interface';

@Component({
  selector: 'app-body-model-viewer',
  template: `
    <div class="model-viewer-container">
      <!-- 控制面板 -->
      <div class="control-panel">
        <button class="btn primary" (click)="toggleModelDisplay()">
          {{ isModelVisible ? '隱藏人形圖' : '部位' }}
        </button>
        
        <button class="btn secondary" (click)="clearSelections()" 
                [disabled]="selectedParts.length === 0">
          清除選擇 ({{ selectedParts.length }})
        </button>
        
        <button class="btn secondary" (click)="exportSelections()" 
                [disabled]="selectedParts.length === 0">
          匯出選擇
        </button>
      </div>

      <!-- 載入進度 -->
      <div class="loading-overlay" *ngIf="loadingProgress.percentage < 100 && loadingProgress.percentage > 0">
        <div class="loading-content">
          <div class="progress-bar">
            <div class="progress-fill" [style.width.%]="loadingProgress.percentage"></div>
          </div>
          <p>載入模型中... {{ loadingProgress.percentage | number:'1.0-0' }}%</p>
        </div>
      </div>

      <!-- 3D 檢視器 -->
      <div class="model-display" [class.hidden]="!isModelVisible">
        <canvas #canvas3d class="model-canvas"></canvas>
        
        <!-- 滑鼠懸停資訊 -->
        <div class="hover-info" *ngIf="hoveredPart" 
             [style.left.px]="mousePosition.x + 10" 
             [style.top.px]="mousePosition.y - 10">
          🫱 {{ hoveredPart.displayName }}
          <small>點擊選擇</small>
        </div>

        <!-- 點選成功提示 -->
        <div class="click-notification" 
             [class.show]="showClickNotification"
             [style.left.px]="clickPosition.x - 50" 
             [style.top.px]="clickPosition.y - 30">
          ✅ {{ lastSelectedPart?.displayName }}
        </div>
      </div>

      <!-- 選擇摘要 -->
      <div class="selection-summary" *ngIf="selectedParts.length > 0">
        <h3>✅ 已選擇的身體部位 ({{ selectedParts.length }})：</h3>
        <div class="selected-parts-list">
          <div class="selected-part" *ngFor="let part of selectedParts; trackBy: trackByUuid; let i = index">
            <div class="part-info">
              <span class="part-number">{{ i + 1 }}</span>
              <div class="part-details">
                <span class="part-name">{{ part.displayName }}</span>
                <span class="part-code" *ngIf="part.medicalCode">代碼: {{ part.medicalCode }}</span>
              </div>
            </div>
            <button class="btn-remove" (click)="removePart(part)" title="取消選擇">×</button>
          </div>
        </div>
        
        <!-- 統計資訊 -->
        <div class="selection-stats">
          <small>🔢 總計選擇了 {{ selectedParts.length }} 個身體部位</small>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .model-viewer-container {
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
    }

    .control-panel {
      display: flex;
      gap: 12px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }

    .btn {
      padding: 12px 20px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s;
    }

    .btn.primary {
      background: #007bff;
      color: white;
    }

    .btn.primary:hover {
      background: #0056b3;
    }

    .btn.secondary {
      background: #6c757d;
      color: white;
    }

    .btn.secondary:hover {
      background: #545b62;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .loading-content {
      background: white;
      padding: 30px;
      border-radius: 8px;
      text-align: center;
      min-width: 300px;
    }

    .progress-bar {
      width: 100%;
      height: 6px;
      background: #e9ecef;
      border-radius: 3px;
      overflow: hidden;
      margin-bottom: 15px;
    }

    .progress-fill {
      height: 100%;
      background: #007bff;
      transition: width 0.3s ease;
    }

    .model-display {
      position: relative;
      width: 100%;
      height: 600px;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      margin-bottom: 20px;
    }

    .model-display.hidden {
      display: none;
    }

    .model-canvas {
      width: 100%;
      height: 100%;
      display: block;
      cursor: pointer;
    }

    .hover-info {
      position: absolute;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 13px;
      pointer-events: none;
      z-index: 100;
      white-space: nowrap;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .hover-info small {
      display: block;
      font-size: 10px;
      opacity: 0.7;
      margin-top: 2px;
    }

    .click-notification {
      position: absolute;
      background: #28a745;
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
      pointer-events: none;
      z-index: 200;
      opacity: 0;
      transform: translateY(10px);
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(40, 167, 69, 0.4);
      white-space: nowrap;
    }

    .click-notification.show {
      opacity: 1;
      transform: translateY(0);
    }

    .selection-summary {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #007bff;
    }

    .selection-summary h3 {
      margin-top: 0;
      margin-bottom: 15px;
      color: #495057;
    }

    .selected-parts-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .selected-part {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px;
      background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
      border-radius: 8px;
      border: 1px solid #dee2e6;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      transition: all 0.2s ease;
    }

    .selected-part:hover {
      border-color: #007bff;
      box-shadow: 0 4px 8px rgba(0, 123, 255, 0.1);
    }

    .part-info {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
    }

    .part-number {
      background: #007bff;
      color: white;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
    }

    .part-details {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .part-name {
      font-weight: 600;
      color: #343a40;
      font-size: 14px;
    }

    .part-code {
      font-family: 'Courier New', monospace;
      background: #e3f2fd;
      color: #1976d2;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 11px;
      width: fit-content;
    }

    .selection-stats {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid #e9ecef;
      text-align: center;
    }

    .selection-stats small {
      color: #6c757d;
      font-style: italic;
    }

    .btn-remove {
      background: #dc3545;
      color: white;
      border: none;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-remove:hover {
      background: #c82333;
    }

    @media (max-width: 768px) {
      .model-display {
        height: 400px;
      }
      
      .control-panel {
        justify-content: center;
      }
    }
  `]
})
export class BodyModelViewerComponent implements OnInit, OnDestroy {
  @ViewChild('canvas3d', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @Output() bodyPartSelected = new EventEmitter<BodyPartClickEvent>();

  // Three.js 相關
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();

  // 狀態管理
  isModelVisible = false;
  selectedParts: BodyPart[] = [];
  hoveredPart: BodyPart | null = null;
  loadingProgress: ModelLoadProgress = { loaded: 0, total: 0, percentage: 0 };
  mousePosition = { x: 0, y: 0 };
  
  // 點選回饋效果
  showClickNotification = false;
  clickPosition = { x: 0, y: 0 };
  lastSelectedPart: BodyPart | null = null;
  private clickNotificationTimeout: any;

  private subscriptions: Subscription[] = [];
  private animationId: number | null = null;

  constructor(private bodyModelService: BodyModelService) {}

  async ngOnInit(): Promise<void> {
    this.initThreeJS();
    this.setupEventListeners();
    this.subscribeToServices();
    this.startRenderLoop();
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  private initThreeJS(): void {
    const canvas = this.canvasRef.nativeElement;
    
    // 場景設置
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf0f0f0); // 恢復原本的背景色
    
    // 相機設置
    this.camera = new THREE.PerspectiveCamera(
      45,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 0, 8);
    
    // 渲染器設置
    this.renderer = new THREE.WebGLRenderer({ 
      canvas,
      antialias: true,
      alpha: true 
    });
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    
    // 控制器設置
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxDistance = 20;
    this.controls.minDistance = 2;
    
    // 光照設置
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8); // 增強環境光
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0); // 增強方向光
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.setScalar(2048);
    
    this.scene.add(ambientLight);
    this.scene.add(directionalLight);
  }

  private setupEventListeners(): void {
    const canvas = this.canvasRef.nativeElement;
    
    canvas.addEventListener('click', (event) => this.onCanvasClick(event));
    canvas.addEventListener('mousemove', (event) => this.onMouseMove(event));
    canvas.addEventListener('mouseleave', () => this.onMouseLeave());
    
    window.addEventListener('resize', () => this.onWindowResize());
  }

  private subscribeToServices(): void {
    // 訂閱選擇狀態
    const selectedSub = this.bodyModelService.selectedParts$.subscribe(
      parts => this.selectedParts = parts
    );
    
    // 訂閱載入進度
    const progressSub = this.bodyModelService.loadingProgress$.subscribe(
      progress => this.loadingProgress = progress
    );
    
    this.subscriptions.push(selectedSub, progressSub);
  }

  async toggleModelDisplay(): Promise<void> {
    if (!this.isModelVisible) {
      // 載入模型
      try {
        // 使用相對路徑，讓 base href 正確處理
        const model = await this.bodyModelService.loadModel('assets/models/female-body.glb');

        // 計算模型邊界框並居中
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        // 將模型移到中心點
        model.position.x = -center.x;
        model.position.y = -center.y;
        model.position.z = -center.z;

        // 調整相機和控制器以適應模型
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = this.camera.fov * (Math.PI / 180);
        let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
        cameraZ *= 1.5; // 增加一些空間

        this.camera.position.set(0, 0, cameraZ);
        this.controls.target.set(0, 0, 0);
        this.controls.update();

        // 添加醫療風格的邊緣線
        this.addMedicalStyleEdges(model);

        this.scene.add(model);
        this.isModelVisible = true;
      } catch (error) {
        console.error('載入模型失敗:', error);
        alert('載入3D模型失敗，請檢查模型檔案是否存在');
      }
    } else {
      // 隱藏模型
      this.isModelVisible = false;
      this.clearModelsFromScene();
    }
  }

  private addMedicalStyleEdges(model: THREE.Group): void {
    // 設置醫療風格的灰色材質（不添加邊緣線，保持清晰的部位分割）
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // 替換為灰色材質
        const grayMaterial = new THREE.MeshStandardMaterial({
          color: 0xb0b0b0,      // 淺灰色
          metalness: 0.2,
          roughness: 0.6,
          flatShading: false
        });
        child.material = grayMaterial;
      }
    });
  }

  private clearModelsFromScene(): void {
    const objectsToRemove: THREE.Object3D[] = [];
    this.scene.traverse((child) => {
      if (child.userData && child.userData['isBodyModel']) {
        objectsToRemove.push(child);
      }
    });
    objectsToRemove.forEach(obj => this.scene.remove(obj));
  }

  // 實作 ChatGPT 建議的點擊檢測
  private onCanvasClick(event: MouseEvent): void {
    if (!this.isModelVisible) return;

    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    
    // 轉換滑鼠座標
    this.mouse.x = ((event.clientX - rect.left) / canvas.clientWidth) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / canvas.clientHeight) * 2 + 1;
    
    // 射線檢測
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);
    
    if (intersects.length > 0) {
      const hitObject = intersects[0].object;
      const bodyPart = this.bodyModelService.findBodyPartValue(hitObject);
      
      if (bodyPart) {
        // 設置點選位置
        this.clickPosition = {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top
        };
        
        // 記錄選中的部位
        this.lastSelectedPart = bodyPart;
        
        // 顯示點選成功提示
        this.showClickSuccess();
        
        // 執行選擇邏輯
        this.bodyModelService.selectBodyPart(bodyPart, intersects[0].point);
        
        // 發出事件
        this.bodyPartSelected.emit({
          bodyPart,
          clickPosition: {
            x: intersects[0].point.x,
            y: intersects[0].point.y,
            z: intersects[0].point.z
          },
          timestamp: new Date()
        });
      }
    }
  }

  private onMouseMove(event: MouseEvent): void {
    if (!this.isModelVisible) return;

    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    
    // 更新滑鼠位置
    this.mousePosition = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
    
    this.mouse.x = ((event.clientX - rect.left) / canvas.clientWidth) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / canvas.clientHeight) * 2 + 1;
    
    // 滑鼠懸停檢測
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);
    
    if (intersects.length > 0) {
      const hitObject = intersects[0].object;
      const bodyPart = this.bodyModelService.findBodyPartValue(hitObject);
      this.hoveredPart = bodyPart;
      canvas.style.cursor = bodyPart ? 'pointer' : 'default';
    } else {
      this.hoveredPart = null;
      canvas.style.cursor = 'default';
    }
  }

  private onMouseLeave(): void {
    this.hoveredPart = null;
    this.canvasRef.nativeElement.style.cursor = 'default';
  }

  private onWindowResize(): void {
    const canvas = this.canvasRef.nativeElement;
    this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  }

  private startRenderLoop(): void {
    const animate = () => {
      this.animationId = requestAnimationFrame(animate);
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
    };
    animate();
  }

  clearSelections(): void {
    this.bodyModelService.clearAllSelections();
  }

  removePart(part: BodyPart): void {
    this.bodyModelService.selectBodyPart(part, new THREE.Vector3());
  }

  exportSelections(): void {
    const selections = this.bodyModelService.getSelectedValues();
    const exportData = {
      timestamp: new Date().toISOString(),
      selectedParts: this.selectedParts.map(part => ({
        displayName: part.displayName,
        value: part.value,
        medicalCode: part.medicalCode
      }))
    };
    
    // 匯出為 JSON 檔案
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `body-parts-selection-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    console.log('匯出選擇:', exportData);
  }

  trackByUuid(index: number, part: BodyPart): string {
    return part.uuid;
  }

  private showClickSuccess(): void {
    // 清除之前的計時器
    if (this.clickNotificationTimeout) {
      clearTimeout(this.clickNotificationTimeout);
    }

    // 顯示提示
    this.showClickNotification = true;

    // 1.5秒後隱藏
    this.clickNotificationTimeout = setTimeout(() => {
      this.showClickNotification = false;
    }, 1500);
  }

  private cleanup(): void {
    // 清除訂閱
    this.subscriptions.forEach(sub => sub.unsubscribe());
    
    // 停止動畫循環
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    // 清除 Three.js 資源
    if (this.renderer) {
      this.renderer.dispose();
    }
    
    if (this.controls) {
      this.controls.dispose();
    }
    
    this.bodyModelService.dispose();
  }
}