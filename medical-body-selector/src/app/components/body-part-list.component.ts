import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil, combineLatest } from 'rxjs';
import { BodyPartSelectionService } from '../services/body-part-selection.service';
import { ModelLoaderService } from '../services/model-loader.service';
import { BodyPart, Gender, BodyPartCategory } from '../models/body-part.model';

@Component({
  selector: 'app-body-part-list',
  templateUrl: './body-part-list.component.html',
  styleUrls: ['./body-part-list.component.scss']
})
export class BodyPartListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  availableBodyParts: BodyPart[] = [];
  selectedBodyParts: BodyPart[] = [];
  selectionHistory: BodyPart[] = [];
  currentGender = Gender.MALE;
  
  // 分類顯示
  categorizedParts: {[key in BodyPartCategory]?: BodyPart[]} = {};
  
  // 枚舉引用
  Gender = Gender;
  BodyPartCategory = BodyPartCategory;

  // 類別中文名稱
  categoryNames: {[key in BodyPartCategory]: string} = {
    [BodyPartCategory.HEAD]: '頭部',
    [BodyPartCategory.CHEST]: '胸部',
    [BodyPartCategory.ABDOMEN]: '腹部',
    [BodyPartCategory.ARMS]: '手臂',
    [BodyPartCategory.LEGS]: '腿部',
    [BodyPartCategory.BACK]: '背部',
    [BodyPartCategory.REPRODUCTIVE]: '生殖系統'
  };

  constructor(
    private bodyPartSelection: BodyPartSelectionService,
    private modelLoader: ModelLoaderService
  ) {}

  ngOnInit(): void {
    this.setupSubscriptions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSubscriptions(): void {
    // 監聽性別變更和模型載入
    combineLatest([
      this.modelLoader.getCurrentGender(),
      this.modelLoader.getCurrentModel()
    ]).pipe(takeUntil(this.destroy$))
      .subscribe(([gender]) => {
        this.currentGender = gender;
        this.updateAvailableBodyParts();
      });

    // 監聽選中的身體部位
    this.bodyPartSelection.getSelectedBodyParts()
      .pipe(takeUntil(this.destroy$))
      .subscribe(parts => {
        this.selectedBodyParts = parts;
      });

    // 監聽選擇歷史
    this.bodyPartSelection.getSelectionHistory()
      .pipe(takeUntil(this.destroy$))
      .subscribe(history => {
        this.selectionHistory = history;
      });
  }

  private updateAvailableBodyParts(): void {
    const modelConfig = this.modelLoader.getModelConfig(this.currentGender);
    this.availableBodyParts = modelConfig.bodyParts;
    this.categorizeBodyParts();
  }

  private categorizeBodyParts(): void {
    this.categorizedParts = {};
    
    this.availableBodyParts.forEach(part => {
      if (!this.categorizedParts[part.category]) {
        this.categorizedParts[part.category] = [];
      }
      this.categorizedParts[part.category]!.push(part);
    });
  }

  selectBodyPart(bodyPart: BodyPart): void {
    this.bodyPartSelection.selectBodyPart(bodyPart);
  }

  deselectBodyPart(bodyPartId: string): void {
    this.bodyPartSelection.deselectBodyPart(bodyPartId);
  }

  isSelected(bodyPart: BodyPart): boolean {
    return this.selectedBodyParts.some(selected => selected.id === bodyPart.id);
  }

  clearAllSelections(): void {
    this.bodyPartSelection.clearSelection();
  }

  getSelectionData(): any {
    return this.bodyPartSelection.getSelectionData();
  }

  getSelectionValues(): string[] {
    return this.bodyPartSelection.getSelectionValues();
  }

  getCategories(): BodyPartCategory[] {
    return Object.keys(this.categorizedParts) as BodyPartCategory[];
  }

  exportSelectionData(): void {
    const data = this.getSelectionData();
    const jsonString = JSON.stringify(data, null, 2);
    
    // 創建下載連結
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `body-parts-selection-${this.currentGender}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}