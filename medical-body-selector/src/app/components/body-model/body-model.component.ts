// 3D人體模型主組件
import { 
  Component, 
  ElementRef, 
  ViewChild, 
  OnInit, 
  OnDestroy, 
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import { Observable, Subject, combineLatest } from 'rxjs';
import { takeUntil, filter, debounceTime } from 'rxjs/operators';
import { BodyModelService, BodyPart } from '../../services/body-model.service';

// 載入狀態介面
interface LoadingState {
  isLoading: boolean;
  progress: number;
  message: string;
  hasError: boolean;
  errorMessage?: string;
}

// 互動狀態介面
interface InteractionState {
  selectedPart: BodyPart | null;
  hoveredPart: BodyPart | null;
  isModelLoaded: boolean;
}

@Component({
  selector: 'app-body-model',
  templateUrl: './body-model.component.html',
  styleUrls: ['./body-model.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BodyModelComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  // 組件狀態
  loadingState: LoadingState = {
    isLoading: false,
    progress: 0,
    message: '準備載入3D模型...',
    hasError: false
  };

  interactionState: InteractionState = {
    selectedPart: null,
    hoveredPart: null,
    isModelLoaded: false
  };

  // 身體部位資料
  allBodyParts: BodyPart[] = [];
  bodyPartsByCategory: { [key: string]: BodyPart[] } = {};
  
  // 搜尋功能
  searchQuery = '';
  filteredBodyParts: BodyPart[] = [];

  // 統計資料
  stats = {
    totalParts: 0,
    categoryCounts: {} as { [key: string]: number },
    selectedCategory: '',
    clickableParts: 0
  };

  // 分類顯示名稱映射
  categoryDisplayNames: { [key: string]: string } = {
    'head': '頭部',
    'torso': '軀幹', 
    'upper_limb': '上肢',
    'lower_limb': '下肢',
    'fingers': '手指',
    'other': '其他'
  };

  private destroy$ = new Subject<void>();

  constructor(
    private bodyModelService: BodyModelService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.setupObservables();
  }

  ngAfterViewInit(): void {
    // 延遲初始化，確保DOM已準備好
    setTimeout(() => {
      this.initializeModel();
    }, 100);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.bodyModelService.dispose();
  }

  /**
   * 設置Observable訂閱
   */
  private setupObservables(): void {
    // 監聽選擇的身體部位
    this.bodyModelService.selectedPart$
      .pipe(takeUntil(this.destroy$))
      .subscribe(selectedPart => {
        this.interactionState.selectedPart = selectedPart;
        this.cdr.markForCheck();
      });

    // 監聽懸停的身體部位
    this.bodyModelService.hoveredPart$
      .pipe(takeUntil(this.destroy$))
      .subscribe(hoveredPart => {
        this.interactionState.hoveredPart = hoveredPart;
        this.cdr.markForCheck();
      });

    // 監聽模型載入狀態
    this.bodyModelService.modelLoaded$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isLoaded => {
        this.interactionState.isModelLoaded = isLoaded;
        if (isLoaded) {
          this.onModelLoaded();
        }
        this.cdr.markForCheck();
      });
  }

  /**
   * 初始化3D模型
   */
  private async initializeModel(): Promise<void> {
    try {
      this.setLoadingState(true, 10, '初始化3D場景...');

      // 初始化場景
      const canvas = this.canvasRef.nativeElement;
      this.bodyModelService.initScene(canvas);

      this.setLoadingState(true, 30, '載入3D模型檔案...');

      // 載入模型
      await this.bodyModelService.loadModel('assets/models/female_body_model.glb');

      this.setLoadingState(true, 80, '處理模型數據...');

      // 啟動渲染循環
      this.bodyModelService.startRenderLoop();

      this.setLoadingState(false, 100, '載入完成！');

    } catch (error) {
      console.error('模型初始化失敗:', error);
      this.setErrorState('模型載入失敗，請檢查模型檔案是否存在');
    }
  }

  /**
   * 模型載入完成處理
   */
  private onModelLoaded(): void {
    // 取得所有身體部位
    this.allBodyParts = this.bodyModelService.getAllBodyParts();
    this.filteredBodyParts = [...this.allBodyParts];

    // 依分類組織身體部位
    this.organizeBodyPartsByCategory();

    // 更新統計資料
    this.updateStats();

    console.log('模型載入完成，身體部位數量:', this.allBodyParts.length);
  }

  /**
   * 依分類組織身體部位
   */
  private organizeBodyPartsByCategory(): void {
    this.bodyPartsByCategory = {};

    this.allBodyParts.forEach(part => {
      const category = part.category;
      if (!this.bodyPartsByCategory[category]) {
        this.bodyPartsByCategory[category] = [];
      }
      this.bodyPartsByCategory[category].push(part);
    });

    // 對每個分類內的部位排序
    Object.keys(this.bodyPartsByCategory).forEach(category => {
      this.bodyPartsByCategory[category].sort((a, b) => 
        a.displayName.localeCompare(b.displayName, 'zh-TW')
      );
    });
  }

  /**
   * 更新統計資料
   */
  private updateStats(): void {
    this.stats.totalParts = this.allBodyParts.length;
    this.stats.clickableParts = this.allBodyParts.filter(part => part.clickable).length;

    // 計算各分類數量
    this.stats.categoryCounts = {};
    Object.keys(this.bodyPartsByCategory).forEach(category => {
      this.stats.categoryCounts[category] = this.bodyPartsByCategory[category].length;
    });
  }

  /**
   * 搜尋身體部位
   */
  onSearch(query: string): void {
    this.searchQuery = query.trim();
    
    if (!this.searchQuery) {
      this.filteredBodyParts = [...this.allBodyParts];
    } else {
      this.filteredBodyParts = this.bodyModelService.searchBodyParts(this.searchQuery);
    }

    this.cdr.markForCheck();
  }

  /**
   * 選擇身體部位
   */
  selectBodyPart(bodyPart: BodyPart): void {
    this.bodyModelService.selectPart(bodyPart);
  }

  /**
   * 清除選擇
   */
  clearSelection(): void {
    this.bodyModelService.clearSelection();
  }

  /**
   * 篩選分類
   */
  filterByCategory(category: string): void {
    this.stats.selectedCategory = this.stats.selectedCategory === category ? '' : category;
    
    if (!this.stats.selectedCategory) {
      this.filteredBodyParts = [...this.allBodyParts];
    } else {
      this.filteredBodyParts = this.bodyPartsByCategory[this.stats.selectedCategory] || [];
    }

    this.cdr.markForCheck();
  }

  /**
   * 取得分類顯示名稱
   */
  getCategoryDisplayName(category: string): string {
    return this.categoryDisplayNames[category] || category;
  }

  /**
   * 檢查分類是否被選中
   */
  isCategorySelected(category: string): boolean {
    return this.stats.selectedCategory === category;
  }

  /**
   * 取得分類的CSS類別
   */
  getCategoryCssClass(category: string): string {
    const baseClass = 'category-badge';
    const isSelected = this.isCategorySelected(category);
    return `${baseClass} ${baseClass}--${category} ${isSelected ? baseClass + '--selected' : ''}`;
  }

  /**
   * 設置載入狀態
   */
  private setLoadingState(isLoading: boolean, progress: number, message: string): void {
    this.loadingState = {
      ...this.loadingState,
      isLoading,
      progress,
      message,
      hasError: false
    };
    this.cdr.markForCheck();
  }

  /**
   * 設置錯誤狀態
   */
  private setErrorState(errorMessage: string): void {
    this.loadingState = {
      ...this.loadingState,
      isLoading: false,
      hasError: true,
      errorMessage
    };
    this.cdr.markForCheck();
  }

  /**
   * 重新載入模型
   */
  reloadModel(): void {
    this.setLoadingState(true, 0, '重新載入模型...');
    this.bodyModelService.dispose();
    this.initializeModel();
  }

  /**
   * 取得載入狀態顯示
   */
  get loadingDisplay(): string {
    if (this.loadingState.hasError) {
      return this.loadingState.errorMessage || '發生未知錯誤';
    }
    return `${this.loadingState.message} (${this.loadingState.progress}%)`;
  }

  /**
   * 取得選中部位的詳細資訊
   */
  get selectedPartInfo(): string {
    const part = this.interactionState.selectedPart;
    if (!part) return '';

    const categoryName = this.getCategoryDisplayName(part.category);
    return `${part.displayName} (${categoryName})`;
  }

  /**
   * 取得懸停部位的資訊
   */
  get hoveredPartInfo(): string {
    const part = this.interactionState.hoveredPart;
    if (!part) return '';

    const categoryName = this.getCategoryDisplayName(part.category);
    return `${part.displayName} (${categoryName})`;
  }

  /**
   * 檢查是否有部位被選中
   */
  get hasSelectedPart(): boolean {
    return !!this.interactionState.selectedPart;
  }

  /**
   * 檢查是否有部位被懸停
   */
  get hasHoveredPart(): boolean {
    return !!this.interactionState.hoveredPart;
  }

  /**
   * 取得搜尋結果統計
   */
  get searchResultsInfo(): string {
    if (!this.searchQuery) {
      return `顯示全部 ${this.allBodyParts.length} 個身體部位`;
    }
    return `搜尋 "${this.searchQuery}" 找到 ${this.filteredBodyParts.length} 個結果`;
  }
}