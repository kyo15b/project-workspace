import { Component } from '@angular/core';
import { BodyPartClickEvent } from './models/body-part.interface';

@Component({
  selector: 'app-root',
  template: `
    <div class="app-container">
      <header class="app-header">
        <h1>醫療身體部位選擇系統</h1>
        <p>點擊「部位」按鈕載入3D人體模型，然後點擊身體部位進行選擇</p>
      </header>

      <main class="app-main">
        <app-body-model-viewer 
          (bodyPartSelected)="onBodyPartSelected($event)">
        </app-body-model-viewer>
      </main>

      <footer class="app-footer">
        <p>基於 Angular 13 + Three.js 開發</p>
      </footer>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .app-header {
      text-align: center;
      margin-bottom: 30px;
      color: white;
    }

    .app-header h1 {
      font-size: 2.5rem;
      margin-bottom: 10px;
      text-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }

    .app-header p {
      font-size: 1.1rem;
      opacity: 0.9;
    }

    .app-main {
      background: white;
      border-radius: 16px;
      padding: 30px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }

    .app-footer {
      text-align: center;
      margin-top: 20px;
      color: rgba(255,255,255,0.8);
    }

    @media (max-width: 768px) {
      .app-container {
        padding: 10px;
      }
      
      .app-main {
        padding: 20px;
      }
      
      .app-header h1 {
        font-size: 1.8rem;
      }
    }
  `]
})
export class AppComponent {
  title = 'medical-body-selector';

  onBodyPartSelected(event: BodyPartClickEvent): void {
    console.log('應用程式接收到身體部位選擇事件:', event);
    
    // 在這裡可以實作額外的業務邏輯
    // 例如：發送到後端API、更新其他組件狀態等
    
    // 示例：顯示通知
    this.showNotification(`已選擇：${event.bodyPart.displayName}`);
  }

  private showNotification(message: string): void {
    // 簡單的通知實作（實際專案中可以使用 Angular Material Snackbar）
    console.log('通知:', message);
  }
}