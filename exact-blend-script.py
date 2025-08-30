import bpy

def setup_exact_body_parts():
    """完全基於用戶截圖的精確身體部位設置"""
    
    # 完全按照 part01.png, part02.png, part03.png, part04.png 中顯示的部位名稱
    exact_body_parts_mapping = {
        # === part01.png 中可見的部位（從上到下） ===
        "FemaleBody": "FEMALE_BODY_001",
        "MetaBody": "META_BODY_001", 
        "上臂": "UPPER_ARM_001",
        "下臂": "LOWER_ARM_001",
        "手腕部": "WRIST_REGION_001",
        "人中": "PHILTRUM_001",
        "左上臂": "LEFT_UPPER_ARM_001",
        "右上臂": "RIGHT_UPPER_ARM_001",
        "左上臂前側": "LEFT_UPPER_ARM_FRONT_001",
        "左上臂後側": "LEFT_UPPER_ARM_BACK_001",
        "右下臂": "RIGHT_LOWER_ARM_001",
        "右內踝": "RIGHT_INNER_ANKLE_001",
        "右內踝前側": "RIGHT_INNER_ANKLE_FRONT_001",
        "右內踝後側": "RIGHT_INNER_ANKLE_BACK_001",
        "右外踝": "RIGHT_OUTER_ANKLE_001",
        "右大腿側面": "RIGHT_THIGH_SIDE_001",
        "右大腿前側": "RIGHT_THIGH_FRONT_001",
        "右大腿後側": "RIGHT_THIGH_BACK_001",
        "右小腿側面": "RIGHT_CALF_SIDE_001",
        "右小腿後側": "RIGHT_CALF_BACK_001",
        "右手中指": "RIGHT_MIDDLE_FINGER_001",
        "右手大拇指": "RIGHT_THUMB_001",
        "右手小指": "RIGHT_LITTLE_FINGER_001",
        "右手名指": "RIGHT_RING_FINGER_001",
        "右手無名指": "RIGHT_RING_FINGER_ALT_001",
        "右手": "RIGHT_HAND_001",
        "右手背": "RIGHT_HAND_BACK_001",
        "右手掌": "RIGHT_PALM_001",
        "右臂": "RIGHT_ARM_001",
        "右踝": "RIGHT_ANKLE_001",
        "右肘": "RIGHT_ELBOW_001",
        "右臂": "RIGHT_ARM_002",
        "右腳": "RIGHT_FOOT_001",
        "右腳背": "RIGHT_FOOT_BACK_001",
        "右腳下": "RIGHT_FOOT_BOTTOM_001",
        "右腳三拇指": "RIGHT_THIRD_TOE_001",
        "右腳四拇指": "RIGHT_FOURTH_TOE_001",
        "右腳大拇指": "RIGHT_BIG_TOE_001",
        "右腳小拇指": "RIGHT_LITTLE_TOE_001",
        "右腳二拇指": "RIGHT_SECOND_TOE_001",
        "右腳": "RIGHT_FOOT_002",
        "右踝高": "RIGHT_ANKLE_HIGH_001",
        "右腳底": "RIGHT_SOLE_001",
        "右腳": "RIGHT_FOOT_003",
        
        # === part03.png 中可見的左側部位 ===
        "左外踝": "LEFT_OUTER_ANKLE_001",
        "左大腿側面": "LEFT_THIGH_SIDE_001",
        "左大腿前側": "LEFT_THIGH_FRONT_001",
        "左大腿後側": "LEFT_THIGH_BACK_001",
        "左小腿側面": "LEFT_CALF_SIDE_001",
        "左小腿前側": "LEFT_CALF_FRONT_001",
        "左手中指": "LEFT_MIDDLE_FINGER_001",
        "左手小指": "LEFT_LITTLE_FINGER_001",
        "左手拇指": "LEFT_THUMB_001",
        "左手無名指": "LEFT_RING_FINGER_001",
        "左手背": "LEFT_HAND_BACK_001",
        "左臂": "LEFT_ARM_001",
        "左肘": "LEFT_ELBOW_001",
        "左腳": "LEFT_FOOT_001",
        "左腳背": "LEFT_FOOT_BACK_001",
        "左腳底": "LEFT_SOLE_001",
        "左腳三拇指": "LEFT_THIRD_TOE_001",
        "左腳四拇指": "LEFT_FOURTH_TOE_001",
        "左腳小拇指": "LEFT_LITTLE_TOE_001",
        "左腳大拇指": "LEFT_BIG_TOE_001",
        "左腳二拇指": "LEFT_SECOND_TOE_001",
        "左踝高": "LEFT_ANKLE_HIGH_001",
        "左踝": "LEFT_ANKLE_001",
        "左腿": "LEFT_LEG_001",
        
        # === part04.png 中可見的軀幹部位 ===
        "左足背": "LEFT_FOOT_INSTEP_001",
        "右踝下": "RIGHT_ANKLE_BELOW_001", 
        "頸": "NECK_001",
        "後背": "BACK_001",
        "胸脯": "CHEST_001",
        "快速文字": "QUICK_TEXT_001",
        "肚臍": "NAVEL_001",
        "腹部": "ABDOMEN_001",
        "脊椎": "SPINE_001",
        "腰椎": "LUMBAR_001",
        "胸椎": "THORACIC_001",
        "頸椎": "CERVICAL_001",
        "髖臀": "HIP_BUTTOCKS_001",
        "臀椎": "COCCYX_001",
    }
    
    processed_count = 0
    found_parts = []
    not_found_parts = []
    
    print("🎯 精確身體部位設置工具")
    print("📸 完全基於用戶提供的截圖清單")
    print("=" * 60)
    
    # 記錄所有實際存在的物件名稱
    all_object_names = []
    for obj in bpy.data.objects:
        if obj.type == 'MESH':
            clean_name = obj.name
            if '.' in obj.name:
                parts = obj.name.split('.')
                if len(parts) > 1 and parts[-1].isdigit():
                    clean_name = '.'.join(parts[:-1])
            all_object_names.append(clean_name)
    
    print(f"📋 在 Blender 中找到 {len(all_object_names)} 個 MESH 物件")
    
    # 遍歷所有物件進行設置
    for obj in bpy.data.objects:
        if obj.type == 'MESH':
            original_name = obj.name
            clean_name = original_name
            
            # 清理名稱
            if '.' in original_name:
                parts = original_name.split('.')
                if len(parts) > 1 and parts[-1].isdigit():
                    clean_name = '.'.join(parts[:-1])
            
            # 基本設置
            obj["value"] = clean_name
            obj["original_name"] = original_name
            obj["display_name"] = clean_name
            obj["clickable"] = True
            obj["is_body_part"] = True
            
            # 檢查是否在我們的映射表中
            if clean_name in exact_body_parts_mapping:
                obj["medical_code"] = exact_body_parts_mapping[clean_name]
                found_parts.append(clean_name)
                print(f"✅ {clean_name:25} -> {exact_body_parts_mapping[clean_name]}")
            else:
                # 創建通用代碼
                generic_code = f"PART_{clean_name.upper().replace(' ', '_')}"
                obj["medical_code"] = generic_code
                not_found_parts.append(clean_name)
                print(f"❓ {clean_name:25} -> {generic_code} (不在截圖清單中)")
            
            processed_count += 1
    
    # 檢查截圖中有但 Blender 裡沒有的部位
    missing_in_blender = []
    for part_name in exact_body_parts_mapping.keys():
        if part_name not in all_object_names:
            missing_in_blender.append(part_name)
    
    print("=" * 60)
    print("📊 處理結果統計:")
    print(f"✅ 總處理物件: {processed_count}")
    print(f"✅ 截圖中找到: {len(found_parts)}")
    print(f"❓ 截圖外物件: {len(not_found_parts)}")
    print(f"⚠️  截圖有但Blender沒有: {len(missing_in_blender)}")
    
    if not_found_parts:
        print(f"\n📋 不在截圖清單中的物件 ({len(not_found_parts)} 個):")
        for part in not_found_parts[:10]:
            print(f"   • {part}")
        if len(not_found_parts) > 10:
            print(f"   ... 還有 {len(not_found_parts)-10} 個")
    
    if missing_in_blender:
        print(f"\n⚠️  截圖中有但Blender中找不到的部位 ({len(missing_in_blender)} 個):")
        for part in missing_in_blender[:10]:
            print(f"   • {part}")
        if len(missing_in_blender) > 10:
            print(f"   ... 還有 {len(missing_in_blender)-10} 個")
    
    return processed_count

def apply_transforms():
    """應用變換"""
    print("\n🔧 正在應用變換...")
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    print("✅ 已應用變換")

def main():
    """主執行函數"""
    print("🎯 精確身體部位 Custom Properties 設置工具")
    print("🎨 完全基於用戶截圖，不添加額外部位")
    print("=" * 60)
    
    # 執行設置
    count = setup_exact_body_parts()
    
    # 應用變換
    apply_transforms()
    
    print("=" * 60)
    print("🎉 設置完成！")
    print(f"✅ 已處理 {count} 個物件")
    print("\n📋 下一步:")
    print("1. File → Export → glTF 2.0 (.glb)")
    print("2. 檔名: exact-female-body")
    print("3. ✅ 勾選 Custom Properties")
    print("4. ✅ 勾選 Apply Modifiers")
    print("5. ✅ 選擇 +Y Up")
    print("6. 匯出到: C:\\TradingView-Pine\\src\\assets\\models\\")

if __name__ == "__main__":
    main()