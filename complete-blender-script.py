import bpy

def setup_complete_body_parts():
    """基於完整截圖為所有身體部位物件設置 Custom Properties"""
    
    # 基於 part01.png, part02.png, part03.png, part04.png 的完整身體部位清單
    body_parts_mapping = {
        # 主要身體結構 (從 part01.png)
        "FemaleBody": "FEMALE_001",
        "MetaBody": "META_001", 
        "Body": "BODY_001",
        
        # 上肢部位 (從 part01.png)
        "上臂": "UPPER_ARM_001",
        "下臂": "LOWER_ARM_001",
        "手腕部": "WRIST_001",
        "人中": "PHILTRUM_001",
        "左上臂": "LEFT_UPPER_ARM_001",
        "右上臂": "RIGHT_UPPER_ARM_001",
        "左上臂前側": "LEFT_UPPER_ARM_ANT_001",
        "左上臂後側": "LEFT_UPPER_ARM_POST_001",
        "左下臂": "LEFT_LOWER_ARM_001",
        "右下臂": "RIGHT_LOWER_ARM_001",
        
        # 踝部與腿部 (從 part01.png 繼續)
        "右內踝": "RIGHT_MEDIAL_ANKLE_001",
        "右內踝前側": "RIGHT_MEDIAL_ANKLE_ANT_001", 
        "右內踝後側": "RIGHT_MEDIAL_ANKLE_POST_001",
        "右外踝": "RIGHT_LATERAL_ANKLE_001",
        "右大腿側面": "RIGHT_THIGH_LAT_001",
        "右大腿前側": "RIGHT_THIGH_ANT_001",
        "右大腿後側": "RIGHT_THIGH_POST_001",
        "右小腿側面": "RIGHT_CALF_LAT_001", 
        "右小腿後側": "RIGHT_CALF_POST_001",
        
        # 手部詳細 (從 part01.png 和 part02.png)
        "右手中指": "RIGHT_MIDDLE_FINGER_001",
        "右手大拇指": "RIGHT_THUMB_001", 
        "右手小指": "RIGHT_LITTLE_FINGER_001",
        "右手名指": "RIGHT_RING_FINGER_001",
        "右手無名指": "RIGHT_RING_FINGER_ALT_001",
        "右手": "RIGHT_HAND_001",
        "右手背": "RIGHT_HAND_DORSUM_001",
        "右手掌": "RIGHT_PALM_001",
        "右臂": "RIGHT_ARM_001",
        "右踝": "RIGHT_ANKLE_001",
        "右肘": "RIGHT_ELBOW_001",
        
        # 左側身體部位 (從 part03.png)
        "左外踝": "LEFT_LATERAL_ANKLE_001",
        "左大腿側面": "LEFT_THIGH_LAT_001",
        "左大腿前側": "LEFT_THIGH_ANT_001",
        "左大腿後側": "LEFT_THIGH_POST_001", 
        "左小腿側面": "LEFT_CALF_LAT_001",
        "左小腿前側": "LEFT_CALF_ANT_001",
        "左手中指": "LEFT_MIDDLE_FINGER_001",
        "左手小指": "LEFT_LITTLE_FINGER_001",
        "左手拇指": "LEFT_THUMB_001",
        "左手無名指": "LEFT_RING_FINGER_001", 
        "左手背": "LEFT_HAND_DORSUM_001",
        "左臂": "LEFT_ARM_001",
        "左肘": "LEFT_ELBOW_001",
        "左腳": "LEFT_FOOT_001",
        "左腳背": "LEFT_FOOT_DORSUM_001",
        "左腳底": "LEFT_SOLE_001",
        "左腳三拇指": "LEFT_THIRD_TOE_001",
        "左腳四拇指": "LEFT_FOURTH_TOE_001",
        "左腳小拇指": "LEFT_LITTLE_TOE_001",
        "左腳大拇指": "LEFT_BIG_TOE_001",
        "左腳二拇指": "LEFT_SECOND_TOE_001",
        "左踝高": "LEFT_ANKLE_HIGH_001",
        "左踝": "LEFT_ANKLE_001", 
        "左腿": "LEFT_LEG_001",
        
        # 軀幹和脊椎部位 (從 part04.png)
        "左足背": "LEFT_FOOT_INSTEP_001",
        "右踝下": "RIGHT_ANKLE_LOWER_001",
        "頸": "NECK_001",
        "後背": "BACK_001",
        "胸脯": "CHEST_001",
        "快速文字": "QUICK_TEXT_001",
        "肚臍": "NAVEL_001",
        "腹部": "ABDOMEN_001",
        "脊椎": "SPINE_001",
        "腰椎": "LUMBAR_SPINE_001", 
        "胸椎": "THORACIC_SPINE_001",
        "頸椎": "CERVICAL_SPINE_001",
        "髖臀": "HIP_BUTTOCK_001",
        "臀椎": "COCCYX_001",
        
        # 額外詳細部位 (基於醫療需求)
        "左手掌": "LEFT_PALM_001",
        "右手指": "RIGHT_FINGERS_001", 
        "左手指": "LEFT_FINGERS_001",
        "右腳背": "RIGHT_FOOT_DORSUM_001",
        "右腳底": "RIGHT_SOLE_001",
        "右腳大拇指": "RIGHT_BIG_TOE_001",
        "右腳二拇指": "RIGHT_SECOND_TOE_001",
        "右腳三拇指": "RIGHT_THIRD_TOE_001",
        "右腳四拇指": "RIGHT_FOURTH_TOE_001",
        "右腳小拇指": "RIGHT_LITTLE_TOE_001",
        "右腳": "RIGHT_FOOT_001",
        
        # 頭頸部詳細
        "頭部": "HEAD_001",
        "額頭": "FOREHEAD_001", 
        "眼部": "EYES_001",
        "鼻子": "NOSE_001",
        "嘴部": "MOUTH_001",
        "下巴": "CHIN_001",
        "耳朵": "EARS_001",
        
        # 軀幹詳細分區
        "左胸": "LEFT_CHEST_001",
        "右胸": "RIGHT_CHEST_001",
        "上腹": "UPPER_ABDOMEN_001",
        "下腹": "LOWER_ABDOMEN_001",
        "左側腹": "LEFT_SIDE_ABDOMEN_001",
        "右側腹": "RIGHT_SIDE_ABDOMEN_001",
        "左肩": "LEFT_SHOULDER_001", 
        "右肩": "RIGHT_SHOULDER_001",
        "左肩胛": "LEFT_SCAPULA_001",
        "右肩胛": "RIGHT_SCAPULA_001",
        "左腋下": "LEFT_ARMPIT_001",
        "右腋下": "RIGHT_ARMPIT_001",
        
        # 骨盆與生殖系統部位（女性）
        "骨盆": "PELVIS_001",
        "恥骨": "PUBIS_001", 
        "會陰": "PERINEUM_001",
        "陰部": "GENITAL_001",
    }
    
    processed_count = 0
    found_parts = []
    missing_parts = []
    
    print("🏥 完整醫療身體部位 Custom Properties 設置工具")
    print("基於 part01-04.png 截圖製作")
    print("=" * 70)
    
    # 遍歷所有物件
    for obj in bpy.data.objects:
        if obj.type == 'MESH':
            original_name = obj.name
            
            # 移除 Blender 自動添加的數字後綴
            clean_name = original_name
            if '.' in original_name:
                parts = original_name.split('.')
                if len(parts) > 1 and parts[-1].isdigit():
                    clean_name = '.'.join(parts[:-1])
            
            # 設置基本屬性
            obj["value"] = clean_name
            obj["original_name"] = original_name
            obj["display_name"] = clean_name
            
            # 如果有對應的醫療代碼，設置進去
            if clean_name in body_parts_mapping:
                obj["medical_code"] = body_parts_mapping[clean_name]
                obj["category"] = get_enhanced_body_part_category(clean_name)
                found_parts.append(clean_name)
                print(f"✅ {original_name:30} -> {body_parts_mapping[clean_name]}")
            else:
                # 對於沒有映射的物件，生成通用代碼
                generic_code = clean_name.upper().replace(" ", "_").replace(".", "_")
                obj["medical_code"] = f"CUSTOM_{generic_code}"
                obj["category"] = "unknown"
                missing_parts.append(clean_name)
                print(f"❓ {original_name:30} -> CUSTOM_{generic_code} (未知部位)")
            
            # 設置通用屬性
            obj["clickable"] = True
            obj["selectable"] = True
            obj["is_body_part"] = True
            obj["version"] = "2.0"
            obj["created_date"] = "2025-08-30"
            
            processed_count += 1
    
    print("=" * 70)
    print(f"🎉 處理完成統計:")
    print(f"✅ 總物件數: {processed_count}")
    print(f"✅ 已知部位: {len(found_parts)}")
    print(f"❓ 未知部位: {len(missing_parts)}")
    print(f"✅ 覆蓋率: {len(found_parts)/(len(found_parts)+len(missing_parts))*100:.1f}%")
    
    if missing_parts:
        print(f"\n📋 未識別的部位清單 ({len(missing_parts)} 個):")
        for i, part in enumerate(missing_parts[:10], 1):  # 只顯示前10個
            print(f"   {i:2d}. {part}")
        if len(missing_parts) > 10:
            print(f"   ... 還有 {len(missing_parts)-10} 個")
    
    return processed_count, len(found_parts), len(missing_parts)

def get_enhanced_body_part_category(part_name):
    """增強的身體部位分類"""
    categories = {
        # 上肢
        "upper_limb": ["手", "臂", "肘", "指", "腕", "肩", "腋"],
        # 下肢  
        "lower_limb": ["腳", "腿", "踝", "拇指", "足", "膝", "髖"],
        # 頭頸部
        "head_neck": ["頭", "頸", "人中", "額", "眼", "鼻", "嘴", "下巴", "耳"],
        # 軀幹
        "trunk": ["胸", "腹", "背", "脊", "腰", "臀", "骨盆", "肚臍"],
        # 生殖泌尿
        "genitourinary": ["恥骨", "會陰", "陰部", "骨盆"],
    }
    
    for category, keywords in categories.items():
        if any(keyword in part_name for keyword in keywords):
            return category
    
    return "other"

def apply_enhanced_transforms():
    """增強的變換應用"""
    print("\n🔧 正在應用變換...")
    
    # 全選所有 MESH 物件
    bpy.ops.object.select_all(action='DESELECT')
    mesh_count = 0
    
    for obj in bpy.data.objects:
        if obj.type == 'MESH':
            obj.select_set(True)
            mesh_count += 1
    
    bpy.context.view_layer.objects.active = bpy.context.selected_objects[0] if bpy.context.selected_objects else None
    
    # 應用變換
    if bpy.context.selected_objects:
        bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
        print(f"✅ 已對 {mesh_count} 個物件應用變換")
    else:
        print("⚠️  沒有找到 MESH 物件")

def validate_enhanced_setup():
    """增強的設置驗證"""
    print("\n🔍 正在驗證設置...")
    
    mesh_objects = [obj for obj in bpy.data.objects if obj.type == 'MESH']
    objects_with_properties = 0
    objects_with_medical_codes = 0
    
    for obj in mesh_objects:
        if "value" in obj and "medical_code" in obj:
            objects_with_properties += 1
            if not obj["medical_code"].startswith("CUSTOM_"):
                objects_with_medical_codes += 1
    
    print(f"📊 驗證結果:")
    print(f"   總 MESH 物件: {len(mesh_objects)}")
    print(f"   已設置屬性: {objects_with_properties}")
    print(f"   有醫療代碼: {objects_with_medical_codes}")
    print(f"   屬性覆蓋率: {objects_with_properties/len(mesh_objects)*100:.1f}%")
    print(f"   醫療代碼覆蓋率: {objects_with_medical_codes/len(mesh_objects)*100:.1f}%")
    
    return objects_with_properties == len(mesh_objects)

def main():
    """主執行函數"""
    print("🏥 醫療身體部位 Custom Properties 完整設置工具 v2.0")
    print("📸 基於 part01.png, part02.png, part03.png, part04.png")
    print("=" * 70)
    
    # 設置 Custom Properties
    total_count, found_count, missing_count = setup_complete_body_parts()
    
    # 應用變換
    apply_enhanced_transforms()
    
    # 驗證設置
    is_valid = validate_enhanced_setup()
    
    print("=" * 70)
    print("🎊 設置完成摘要:")
    print(f"✅ 處理了 {total_count} 個身體部位")
    print(f"✅ 識別了 {found_count} 個已知部位")
    print(f"❓ 發現了 {missing_count} 個未知部位") 
    print(f"✅ 已應用所有變換")
    print(f"✅ 驗證{'通過' if is_valid else '失敗'}")
    
    print(f"\n📋 下一步操作指南:")
    print("1. File → Export → glTF 2.0 (.glb)")
    print("2. 檔名: complete-female-body")
    print("3. 位置: C:\\TradingView-Pine\\src\\assets\\models\\")
    print("4. ✅ 重要設定:")
    print("   - ✅ Custom Properties (必須勾選)")
    print("   - ✅ Apply Modifiers")
    print("   - ✅ +Y Up")
    print("   - ✅ 格式: glTF Binary (.glb)")
    print("5. 點擊 Export glTF 2.0")
    
    print(f"\n💡 提示:")
    print(f"   - 如果有未識別部位，可以手動在腳本中添加對應關係")
    print(f"   - 所有部位都會有 medical_code 屬性用於前端識別")
    print(f"   - 使用 CUSTOM_ 前綴的部位可能需要手動調整")

# 執行主函數
if __name__ == "__main__":
    main()