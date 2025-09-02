"""
Windows 服務安裝程式
將籌碼收集排程器安裝為 Windows 服務
"""
import sys
import os
from pathlib import Path

def install_as_service():
    """安裝為 Windows 服務"""
    try:
        import win32serviceutil
        import win32service
        import win32event
        import servicemanager
        
        class ChipCollectorService(win32serviceutil.ServiceFramework):
            _svc_name_ = "TaiwanStockChipCollector"
            _svc_display_name_ = "台股籌碼收集服務"
            _svc_description_ = "自動收集台灣股市券商分點籌碼資料"
            
            def __init__(self, args):
                win32serviceutil.ServiceFramework.__init__(self, args)
                self.hWaitStop = win32event.CreateEvent(None, 0, 0, None)
                self.running = True
                
            def SvcStop(self):
                self.ReportServiceStatus(win32service.SERVICE_STOP_PENDING)
                win32event.SetEvent(self.hWaitStop)
                self.running = False
                
            def SvcDoRun(self):
                servicemanager.LogMsg(
                    servicemanager.EVENTLOG_INFORMATION_TYPE,
                    servicemanager.PYS_SERVICE_STARTED,
                    (self._svc_name_, '')
                )
                self.main()
                
            def main(self):
                # 設定工作目錄
                os.chdir(str(Path(__file__).parent))
                
                # 匯入排程器
                from scheduler import AutoScheduler
                
                scheduler = AutoScheduler()
                scheduler.setup_schedule()
                
                import schedule
                import time
                
                while self.running:
                    schedule.run_pending()
                    time.sleep(60)
        
        if len(sys.argv) == 1:
            servicemanager.Initialize()
            servicemanager.PrepareToHostSingle(ChipCollectorService)
            servicemanager.StartServiceCtrlDispatcher()
        else:
            win32serviceutil.HandleCommandLine(ChipCollectorService)
            
    except ImportError:
        print("❌ 需要安裝 pywin32 套件才能使用 Windows 服務功能")
        print("請執行: pip install pywin32")
        return False
    except Exception as e:
        print(f"❌ 服務安裝失敗: {e}")
        return False

def install_instructions():
    """顯示安裝說明"""
    print("""
📋 Windows 服務安裝說明:

1. 安裝 pywin32 套件:
   pip install pywin32

2. 以管理員身份執行命令提示字元

3. 安裝服務:
   python install_service.py install

4. 啟動服務:
   python install_service.py start

5. 停止服務:
   python install_service.py stop

6. 移除服務:
   python install_service.py remove

⚠️  注意: 需要管理員權限才能安裝/移除 Windows 服務
    """)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        install_as_service()
    else:
        install_instructions()