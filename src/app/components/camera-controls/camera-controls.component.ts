// 相機控制組件
import { 
  Component, 
  ElementRef, 
  Input, 
  OnInit, 
  OnDestroy, 
  AfterViewInit,
  ChangeDetectionStrategy 
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// 相機預設位置
interface CameraPreset {
  name: string;
  displayName: string;
  position: THREE.Vector3;
  target: THREE.Vector3;
  description: string;
  icon: string;
}

// 控制設置
interface ControlSettings {
  enableZoom: boolean;
  enableRotate: boolean;
  enablePan: boolean;
  autoRotate: boolean;
  autoRotateSpeed: number;
  zoomSpeed: number;
  rotateSpeed: number;
  panSpeed: number;
  minDistance: number;
  maxDistance: number;
  minPolarAngle: number;
  maxPolarAngle: number;
}

@Component({
  selector: 'app-camera-controls',
  templateUrl: './camera-controls.component.html',
  styleUrls: ['./camera-controls.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CameraControlsComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() camera!: THREE.PerspectiveCamera;
  @Input() renderer!: THREE.WebGLRenderer;
  @Input() canvas!: HTMLCanvasElement;

  private controls!: OrbitControls;
  private destroy$ = new Subject<void>();

  // 相機預設位置
  cameraPresets: CameraPreset[] = [
    {
      name: 'front',
      displayName: '正面',
      position: new THREE.Vector3(0, 0, 3),
      target: new THREE.Vector3(0, 0, 0),
      description: '正面視角，適合查看面部和前身',
      icon: '👤'
    },
    {
      name: 'back',
      displayName: '背面',
      position: new THREE.Vector3(0, 0, -3),
      target: new THREE.Vector3(0, 0, 0),
      description: '背面視角，適合查看背部',
      icon: '🔙'
    },
    {
      name: 'left',
      displayName: '左側',
      position: new THREE.Vector3(-3, 0, 0),
      target: new THREE.Vector3(0, 0, 0),
      description: '左側視角，適合查看左半身',
      icon: '👈'
    },
    {
      name: 'right',
      displayName: '右側',
      position: new THREE.Vector3(3, 0, 0),
      target: new THREE.Vector3(0, 0, 0),
      description: '右側視角，適合查看右半身',
      icon: '👉'
    },
    {
      name: 'top',
      displayName: '俯視',
      position: new THREE.Vector3(0, 3, 0),
      target: new THREE.Vector3(0, 0, 0),
      description: '俯視角度，適合查看頭頂',
      icon: '👆'
    },
    {
      name: 'bottom',
      displayName: '仰視',
      position: new THREE.Vector3(0, -3, 0),
      target: new THREE.Vector3(0, 0, 0),
      description: '仰視角度，適合查看腳底',
      icon: '👇'
    },
    {
      name: 'diagonal',
      displayName: '斜角',
      position: new THREE.Vector3(2, 2, 2),
      target: new THREE.Vector3(0, 0, 0),
      description: '斜角視角，全身展示效果佳',
      icon: '📐'
    }
  ];

  // 控制設置
  controlSettings: ControlSettings = {
    enableZoom: true,
    enableRotate: true,
    enablePan: true,
    autoRotate: false,
    autoRotateSpeed: 1.0,
    zoomSpeed: 1.0,
    rotateSpeed: 1.0,
    panSpeed: 1.0,
    minDistance: 1.0,
    maxDistance: 10.0,
    minPolarAngle: 0,
    maxPolarAngle: Math.PI
  };

  // 組件狀態
  isControlsVisible = false;
  currentPreset = 'front';
  isAnimating = false;

  constructor() {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.initializeControls();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    if (this.controls) {
      this.controls.dispose();
    }
  }

  /**
   * 初始化軌道控制器
   */
  private initializeControls(): void {
    if (!this.camera || !this.canvas) {
      console.error('Camera或Canvas未提供');
      return;
    }

    // 創建軌道控制器
    this.controls = new OrbitControls(this.camera, this.canvas);

    // 套用控制設置
    this.applyControlSettings();

    // 設置事件監聽
    this.setupEventListeners();

    console.log('相機控制器初始化完成');
  }

  /**
   * 套用控制設置
   */
  private applyControlSettings(): void {
    const settings = this.controlSettings;

    this.controls.enableZoom = settings.enableZoom;
    this.controls.enableRotate = settings.enableRotate;
    this.controls.enablePan = settings.enablePan;
    this.controls.autoRotate = settings.autoRotate;
    this.controls.autoRotateSpeed = settings.autoRotateSpeed;
    
    this.controls.zoomSpeed = settings.zoomSpeed;
    this.controls.rotateSpeed = settings.rotateSpeed;
    this.controls.panSpeed = settings.panSpeed;
    
    this.controls.minDistance = settings.minDistance;
    this.controls.maxDistance = settings.maxDistance;
    this.controls.minPolarAngle = settings.minPolarAngle;
    this.controls.maxPolarAngle = settings.maxPolarAngle;

    // 阻尼效果
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;

    // 更新控制器
    this.controls.update();
  }

  /**
   * 設置事件監聽器
   */
  private setupEventListeners(): void {
    // 監聽控制器變化
    this.controls.addEventListener('change', () => {
      if (this.renderer) {
        // 渲染器會在主組件中處理
      }
    });

    // 監聽控制開始
    this.controls.addEventListener('start', () => {
      this.isAnimating = true;
    });

    // 監聽控制結束
    this.controls.addEventListener('end', () => {
      this.isAnimating = false;
    });
  }

  /**
   * 切換控制面板可見性
   */
  toggleControlsVisibility(): void {
    this.isControlsVisible = !this.isControlsVisible;
  }

  /**
   * 應用相機預設位置
   */
  applyCameraPreset(preset: CameraPreset): void {
    if (!this.camera || !this.controls || this.isAnimating) return;

    this.currentPreset = preset.name;
    this.isAnimating = true;

    // 動畫參數
    const duration = 1000; // 毫秒
    const startPosition = this.camera.position.clone();
    const startTarget = this.controls.target.clone();
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // 使用easeInOutQuad緩動函數
      const easeProgress = progress < 0.5 
        ? 2 * progress * progress 
        : -1 + (4 - 2 * progress) * progress;

      // 插值位置
      this.camera.position.lerpVectors(startPosition, preset.position, easeProgress);
      this.controls.target.lerpVectors(startTarget, preset.target, easeProgress);
      
      // 更新控制器
      this.controls.update();

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.isAnimating = false;
        console.log(`切換到${preset.displayName}視角`);
      }
    };

    animate();
  }

  /**
   * 重置相機到預設位置
   */
  resetCamera(): void {
    const frontPreset = this.cameraPresets.find(p => p.name === 'front');
    if (frontPreset) {
      this.applyCameraPreset(frontPreset);
    }
  }

  /**
   * 聚焦到特定目標
   */
  focusOnTarget(target: THREE.Vector3, distance: number = 3): void {
    if (!this.camera || !this.controls || this.isAnimating) return;

    this.isAnimating = true;

    // 計算相機新位置
    const direction = this.camera.position.clone().sub(this.controls.target).normalize();
    const newPosition = target.clone().add(direction.multiplyScalar(distance));

    // 動畫參數
    const duration = 800;
    const startPosition = this.camera.position.clone();
    const startTarget = this.controls.target.clone();
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeProgress = progress < 0.5 
        ? 2 * progress * progress 
        : -1 + (4 - 2 * progress) * progress;

      this.camera.position.lerpVectors(startPosition, newPosition, easeProgress);
      this.controls.target.lerpVectors(startTarget, target, easeProgress);
      
      this.controls.update();

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.isAnimating = false;
      }
    };

    animate();
  }

  /**
   * 更新控制設置
   */
  updateControlSetting(key: keyof ControlSettings, value: any): void {
    (this.controlSettings as any)[key] = value;
    this.applyControlSettings();
  }

  /**
   * 切換自動旋轉
   */
  toggleAutoRotate(): void {
    this.controlSettings.autoRotate = !this.controlSettings.autoRotate;
    this.controls.autoRotate = this.controlSettings.autoRotate;
  }

  /**
   * 獲取當前相機資訊
   */
  getCameraInfo(): string {
    if (!this.camera || !this.controls) return '';

    const pos = this.camera.position;
    const target = this.controls.target;
    
    return `位置: (${pos.x.toFixed(2)}, ${pos.y.toFixed(2)}, ${pos.z.toFixed(2)}) | ` +
           `目標: (${target.x.toFixed(2)}, ${target.y.toFixed(2)}, ${target.z.toFixed(2)})`;
  }

  /**
   * 檢查預設是否為當前選中
   */
  isPresetActive(presetName: string): boolean {
    return this.currentPreset === presetName;
  }

  /**
   * 更新控制器（在主渲染循環中調用）
   */
  update(): void {
    if (this.controls) {
      this.controls.update();
    }
  }

  /**
   * 獲取控制器實例
   */
  getControls(): OrbitControls {
    return this.controls;
  }
}