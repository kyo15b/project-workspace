import bpy

def setup_body_parts():
    """為所有身體部位物件設置 Custom Properties"""
    
    # 身體部位中文到英文代碼的對應表（根據你的實際模型調整）
    body_parts_mapping = {
        # 基本部位
        "女": "FEMALE_BASE",
        "頭": "HEAD",
        "頸": "NECK", 
        "胸": "CHEST",
        "腹": "ABDOMEN",
        "背": "BACK",
        "腰": "WAIST",
        
        # 手部
        "左手": "LEFT_HAND",
        "右手": "RIGHT_HAND",
        "左臂": "LEFT_ARM", 
        "右臂": "RIGHT_ARM",
        "左前臂": "LEFT_FOREARM",
        "右前臂": "RIGHT_FOREARM",
        "左上臂": "LEFT_UPPER_ARM",
        "右上臂": "RIGHT_UPPER_ARM",
        
        # 腿部
        "左腳": "LEFT_FOOT",
        "右腳": "RIGHT_FOOT",
        "左腿": "LEFT_LEG",
        "右腿": "RIGHT_LEG", 
        "左大腿": "LEFT_THIGH",
        "右大腿": "RIGHT_THIGH",
        "左小腿": "LEFT_CALF",
        "右小腿": "RIGHT_CALF",
        
        # 更多部位（根據你的 Outliner 顯示的實際名稱添加）
        "左肩": "LEFT_SHOULDER",
        "右肩": "RIGHT_SHOULDER",
        "左肘": "LEFT_ELBOW", 
        "右肘": "RIGHT_ELBOW",
        "左膝": "LEFT_KNEE",
        "右膝": "RIGHT_KNEE",
        "左踝": "LEFT_ANKLE",
        "右踝": "RIGHT_ANKLE",
    }
    
    processed_count = 0
    
    # 遍歷所有物件
    for obj in bpy.data.objects:
        if obj.type == 'MESH':
            # 方法 A: 設置 value 為中文名稱（醫療用途）
            obj["value"] = obj.name
            
            # 方法 B: 如果有對應的英文代碼，也設置進去
            if obj.name in body_parts_mapping:
                obj["medical_code"] = body_parts_mapping[obj.name]
                obj["display_name"] = obj.name
                print(f"✓ 設置物件: {obj.name} -> medical_code: {body_parts_mapping[obj.name]}")
            else:
                # 對於沒有映射的物件，使用物件名稱
                obj["medical_code"] = obj.name.upper().replace(" ", "_")
                obj["display_name"] = obj.name
                print(f"✓ 設置物件: {obj.name} -> medical_code: {obj.name.upper()}")
            
            # 設置一些額外的屬性
            obj["clickable"] = True
            obj["category"] = "body_part"
            
            processed_count += 1
    
    print(f"\n🎉 完成！總共處理了 {processed_count} 個身體部位物件")
    print("所有物件都已設置 Custom Properties:")
    print("- value: 中文名稱 (用於顯示)")  
    print("- medical_code: 醫療代碼 (用於系統識別)")
    print("- display_name: 顯示名稱")
    print("- clickable: 可點擊標記")
    print("- category: 分類標記")
    
    return processed_count

def apply_transforms():
    """應用變換，確保前端正確顯示"""
    # 全選所有物件
    bpy.ops.object.select_all(action='SELECT')
    
    # 應用縮放、旋轉和位置
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    
    print("✓ 已應用所有變換 (Scale, Rotation, Location)")

def main():
    """主要執行函數"""
    print("開始設置身體部位 Custom Properties...")
    print("=" * 50)
    
    # 設置 Custom Properties
    count = setup_body_parts()
    
    # 應用變換
    apply_transforms()
    
    print("=" * 50)
    print("✅ 設置完成！")
    print(f"✅ 已處理 {count} 個身體部位")
    print("✅ 已應用所有變換")
    print("\n下一步：匯出為 glTF (.glb) 格式")
    print("記得在匯出時勾選 'Custom Properties'")

# 執行主函數
if __name__ == "__main__":
    main()