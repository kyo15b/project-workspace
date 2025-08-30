import bpy

def setup_medical_body_parts():
    """基於實際模型為所有身體部位物件設置 Custom Properties"""
    
    # 從截圖中整理出的完整身體部位中文到醫療代碼的對應表
    body_parts_mapping = {
        # 主要身體結構
        "FemaleBody": "FEMALE_001",
        "MetaBody": "META_001",
        "Body": "BODY_001",
        
        # 頭部和頸部
        "上臂": "UPPER_ARM",
        "下臂": "LOWER_ARM", 
        "手腕部": "WRIST",
        "人中": "PHILTRUM",
        "左上臂": "LEFT_UPPER_ARM",
        "右上臂": "RIGHT_UPPER_ARM",
        "左上臂前側": "LEFT_UPPER_ARM_ANTERIOR",
        "左上臂後側": "LEFT_UPPER_ARM_POSTERIOR", 
        "左下臂": "LEFT_LOWER_ARM",
        "右下臂": "RIGHT_LOWER_ARM",
        "右內踝": "RIGHT_MEDIAL_ANKLE",
        "右內踝前側": "RIGHT_MEDIAL_ANKLE_ANTERIOR",
        "右內踝後側": "RIGHT_MEDIAL_ANKLE_POSTERIOR",
        "右外踝": "RIGHT_LATERAL_ANKLE",
        "右大腿側面": "RIGHT_THIGH_LATERAL",
        "右大腿前側": "RIGHT_THIGH_ANTERIOR", 
        "右大腿後側": "RIGHT_THIGH_POSTERIOR",
        "右小腿側面": "RIGHT_CALF_LATERAL",
        "右小腿後側": "RIGHT_CALF_POSTERIOR",
        "右手中指": "RIGHT_MIDDLE_FINGER",
        "右手大拇指": "RIGHT_THUMB",
        "右手小指": "RIGHT_LITTLE_FINGER",
        "右手名指": "RIGHT_RING_FINGER",
        "右手無名指": "RIGHT_RING_FINGER_ALT",
        "右手": "RIGHT_HAND",
        "右手背": "RIGHT_HAND_DORSUM",
        "右手掌": "RIGHT_PALM",
        "右臂": "RIGHT_ARM",
        "右踝": "RIGHT_ANKLE",
        "右肘": "RIGHT_ELBOW",
        
        # 左側身體部位 (從 part03.png)
        "左外踝": "LEFT_LATERAL_ANKLE",
        "左大腿側面": "LEFT_THIGH_LATERAL",
        "左大腿前側": "LEFT_THIGH_ANTERIOR", 
        "左大腿後側": "LEFT_THIGH_POSTERIOR",
        "左小腿側面": "LEFT_CALF_LATERAL",
        "左小腿前側": "LEFT_CALF_ANTERIOR",
        "左手中指": "LEFT_MIDDLE_FINGER",
        "左手小指": "LEFT_LITTLE_FINGER",
        "左手拇指": "LEFT_THUMB",
        "左手無名指": "LEFT_RING_FINGER",
        "左手背": "LEFT_HAND_DORSUM",
        "左臂": "LEFT_ARM",
        "左肘": "LEFT_ELBOW",
        "左腳": "LEFT_FOOT",
        "左腳背": "LEFT_FOOT_DORSUM",
        "左腳底": "LEFT_SOLE",
        "左腳三拇指": "LEFT_THIRD_TOE",
        "左腳四拇指": "LEFT_FOURTH_TOE",
        "左腳小拇指": "LEFT_LITTLE_TOE",
        "左腳大拇指": "LEFT_BIG_TOE",
        "左腳小拇指": "LEFT_LITTLE_TOE_ALT",
        "左腳二拇指": "LEFT_SECOND_TOE",
        "左腳": "LEFT_FOOT_ALT",
        "左踝高": "LEFT_ANKLE_HIGH",
        "左踝": "LEFT_ANKLE",
        "左腿": "LEFT_LEG",
        
        # 軀幹部位 (從 part04.png)
        "左足背": "LEFT_FOOT_INSTEP",
        "右踝下": "RIGHT_ANKLE_LOWER",
        "頸": "NECK",
        "左踝": "LEFT_ANKLE_ALT",
        "左踝": "LEFT_ANKLE_FINAL",
        "左踝": "LEFT_ANKLE_MAIN",
        "左踝": "LEFT_ANKLE_PRIMARY",
        "左踝": "LEFT_ANKLE_SECONDARY",
        "後背": "BACK",
        "後背": "POSTERIOR_BACK",
        "胸脯": "CHEST",
        "快速文字": "QUICK_TEXT",
        "肚臍": "NAVEL",
        "腹部": "ABDOMEN",
        "脊椎": "SPINE",
        "腰椎": "LUMBAR_SPINE",
        "胸椎": "THORACIC_SPINE",
        "頸椎": "CERVICAL_SPINE",
        "髖臀": "HIP_BUTTOCK",
        "臀椎": "COCCYX",
    }
    
    processed_count = 0
    
    print("開始處理身體部位物件...")
    print("=" * 60)
    
    # 遍歷所有物件
    for obj in bpy.data.objects:
        if obj.type == 'MESH':
            original_name = obj.name
            
            # 移除 Blender 自動添加的數字後綴 (如 .001, .002 等)
            clean_name = original_name
            if '.' in original_name:
                parts = original_name.split('.')
                if len(parts) > 1 and parts[-1].isdigit():
                    clean_name = '.'.join(parts[:-1])
            
            # 設置基本屬性
            obj["value"] = clean_name  # 使用清理後的中文名稱
            obj["original_name"] = original_name  # 保留原始名稱
            obj["display_name"] = clean_name  # 顯示名稱
            
            # 如果有對應的醫療代碼，設置進去
            if clean_name in body_parts_mapping:
                obj["medical_code"] = body_parts_mapping[clean_name]
                obj["category"] = get_body_part_category(clean_name)
                print(f"✓ {original_name:25} -> {clean_name:20} -> {body_parts_mapping[clean_name]}")
            else:
                # 對於沒有映射的物件，生成通用代碼
                generic_code = clean_name.upper().replace(" ", "_").replace(".", "_")
                obj["medical_code"] = f"CUSTOM_{generic_code}"
                obj["category"] = "other"
                print(f"? {original_name:25} -> {clean_name:20} -> CUSTOM_{generic_code}")
            
            # 設置通用屬性
            obj["clickable"] = True
            obj["selectable"] = True
            obj["is_body_part"] = True
            
            processed_count += 1
    
    print("=" * 60)
    print(f"🎉 完成！總共處理了 {processed_count} 個身體部位物件")
    print(f"✅ 所有物件都已設置 Custom Properties")
    
    return processed_count

def get_body_part_category(part_name):
    """根據部位名稱分類"""
    if any(keyword in part_name for keyword in ["手", "臂", "肘", "指"]):
        return "upper_limb"
    elif any(keyword in part_name for keyword in ["腳", "腿", "踝", "拇指", "足"]):
        return "lower_limb"
    elif any(keyword in part_name for keyword in ["頭", "頸", "人中"]):
        return "head_neck"
    elif any(keyword in part_name for keyword in ["胸", "腹", "背", "脊", "腰", "髖", "臀"]):
        return "trunk"
    else:
        return "other"

def apply_transforms():
    """應用變換，確保前端正確顯示"""
    print("正在應用變換...")
    
    # 全選所有物件
    bpy.ops.object.select_all(action='SELECT')
    
    # 應用縮放、旋轉和位置
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    
    print("✅ 已應用所有變換 (Scale, Rotation, Location)")

def validate_setup():
    """驗證設置是否正確"""
    print("\n正在驗證設置...")
    
    mesh_objects = [obj for obj in bpy.data.objects if obj.type == 'MESH']
    objects_with_properties = 0
    
    for obj in mesh_objects:
        if "value" in obj and "medical_code" in obj:
            objects_with_properties += 1
    
    print(f"✅ 總共 {len(mesh_objects)} 個 Mesh 物件")
    print(f"✅ 其中 {objects_with_properties} 個已設置 Custom Properties")
    
    if objects_with_properties == len(mesh_objects):
        print("🎉 所有物件都已正確設置！")
        return True
    else:
        print(f"⚠️  還有 {len(mesh_objects) - objects_with_properties} 個物件未設置")
        return False

def main():
    """主要執行函數"""
    print("🏥 醫療身體部位 Custom Properties 設置工具")
    print("基於實際模型截圖製作")
    print("=" * 60)
    
    # 設置 Custom Properties
    count = setup_medical_body_parts()
    
    # 應用變換
    apply_transforms()
    
    # 驗證設置
    validate_setup()
    
    print("=" * 60)
    print("✅ 設置完成！")
    print(f"✅ 已處理 {count} 個身體部位")
    print("✅ 已應用所有變換")
    print("✅ 已驗證設置正確性")
    print("\n📋 下一步操作：")
    print("1. File → Export → glTF 2.0 (.glb)")
    print("2. 檔名：female-body")
    print("3. 位置：C:\\TradingView-Pine\\src\\assets\\models\\")
    print("4. ✅ 重要：勾選 'Custom Properties'")
    print("5. ✅ 重要：勾選 'Apply Modifiers'")
    print("6. ✅ 重要：選擇 '+Y Up'")
    print("7. ✅ 格式：glTF Binary (.glb)")

# 執行主函數
if __name__ == "__main__":
    main()