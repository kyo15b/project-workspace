import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { BodyPart } from '../models/body-part.model';

@Injectable({
  providedIn: 'root'
})
export class BodyPartSelectionService {
  private selectedBodyPart$ = new BehaviorSubject<BodyPart | null>(null);
  private selectedBodyParts$ = new BehaviorSubject<BodyPart[]>([]);
  private selectionHistory$ = new BehaviorSubject<BodyPart[]>([]);

  constructor() {}

  getSelectedBodyPart(): Observable<BodyPart | null> {
    return this.selectedBodyPart$.asObservable();
  }

  getSelectedBodyParts(): Observable<BodyPart[]> {
    return this.selectedBodyParts$.asObservable();
  }

  getSelectionHistory(): Observable<BodyPart[]> {
    return this.selectionHistory$.asObservable();
  }

  selectBodyPart(bodyPart: BodyPart): void {
    this.selectedBodyPart$.next(bodyPart);
    
    // 添加到選擇歷史
    const currentHistory = this.selectionHistory$.value;
    const newHistory = [bodyPart, ...currentHistory.filter(part => part.id !== bodyPart.id)];
    this.selectionHistory$.next(newHistory.slice(0, 10)); // 保留最近10個選擇

    // 多選功能
    const currentSelected = this.selectedBodyParts$.value;
    if (!currentSelected.find(part => part.id === bodyPart.id)) {
      this.selectedBodyParts$.next([...currentSelected, bodyPart]);
    }

    console.log('選擇身體部位:', bodyPart);
  }

  deselectBodyPart(bodyPartId: string): void {
    const currentSelected = this.selectedBodyParts$.value;
    const filteredSelected = currentSelected.filter(part => part.id !== bodyPartId);
    this.selectedBodyParts$.next(filteredSelected);

    // 如果是當前選中的部位，清除單選
    if (this.selectedBodyPart$.value?.id === bodyPartId) {
      this.selectedBodyPart$.next(null);
    }
  }

  clearSelection(): void {
    this.selectedBodyPart$.next(null);
    this.selectedBodyParts$.next([]);
  }

  getSelectionValues(): string[] {
    return this.selectedBodyParts$.value.map(part => part.value.toString());
  }

  getSelectionData(): {[key: string]: any} {
    const selected = this.selectedBodyParts$.value;
    const result: {[key: string]: any} = {};
    
    selected.forEach(part => {
      result[part.id] = {
        name: part.name,
        chineseName: part.chineseName,
        value: part.value,
        category: part.category
      };
    });

    return result;
  }
}