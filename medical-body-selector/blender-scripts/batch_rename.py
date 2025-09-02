# Blender批量重命名腳本
import bpy
import re

def normalize_chinese_names():
    """標準化中文物件名稱"""
    
    # 名稱標準化規則
    name_rules = {
        # 頭部相關
        r".*头.*": "頭",
        r".*脸.*|.*臉.*": "臉",
        r".*左眼.*": "左眼",
        r".*右眼.*": "右眼", 
        r".*眼.*": "眼睛",
        r".*鼻.*": "鼻子",
        r".*嘴.*|.*口.*": "嘴",
        r".*左耳.*": "左耳",
        r".*右耳.*": "右耳",
        r".*耳.*": "耳朵",
        
        # 軀幹相關
        r".*躯干.*|.*軀幹.*": "軀幹",
        r".*胸.*": "胸部",
        r".*腹.*|.*肚.*": "腹部", 
        r".*背.*": "背部",
        r".*腰.*": "腰部",
        r".*颈.*|.*頸.*|.*脖.*": "頸部",
        
        # 上肢相關
        r".*左肩.*": "左肩",
        r".*右肩.*": "右肩",
        r".*肩.*": "肩膀",
        r".*左上臂.*|.*左大臂.*": "左上臂",
        r".*右上臂.*|.*右大臂.*": "右上臂", 
        r".*左前臂.*|.*左小臂.*": "左前臂",
        r".*右前臂.*|.*右小臂.*": "右前臂",
        r".*左手.*": "左手",
        r".*右手.*": "右手",
        
        # 手指相關
        r".*左拇指.*|.*左大拇指.*": "左拇指",
        r".*右拇指.*|.*右大拇指.*": "右拇指",
        r".*左食指.*": "左食指", 
        r".*右食指.*": "右食指",
        r".*左中指.*": "左中指",
        r".*右中指.*": "右中指",
        r".*左無名指.*|.*左无名指.*": "左無名指",
        r".*右無名指.*|.*右无名指.*": "右無名指",
        r".*左小指.*": "左小指",
        r".*右小指.*": "右小指",
        
        # 下肢相關
        r".*左大腿.*": "左大腿",
        r".*右大腿.*": "右大腿",
        r".*左小腿.*": "左小腿", 
        r".*右小腿.*": "右小腿",
        r".*左腳.*|.*左脚.*": "左腳",
        r".*右腳.*|.*右脚.*": "右腳",
        
        # 腳趾相關
        r".*左大腳趾.*": "左大腳趾",
        r".*右大腳趾.*": "右大腳趾",
        r".*左腳趾.*": "左腳趾",
        r".*右腳趾.*": "右腳趾",
    }
    
    renamed_count = 0
    
    for obj in bpy.context.scene.objects:
        if obj.type == 'MESH':
            original_name = obj.name
            new_name = None
            
            # 套用重命名規則
            for pattern, replacement in name_rules.items():
                if re.match(pattern, original_name, re.IGNORECASE):
                    new_name = replacement
                    break
            
            # 如果找到匹配的規則，進行重命名
            if new_name and new_name != original_name:
                # 確保名稱唯一性
                counter = 1
                unique_name = new_name
                while unique_name in [o.name for o in bpy.context.scene.objects]:
                    unique_name = f"{new_name}.{counter:03d}"
                    counter += 1
                
                obj.name = unique_name
                print(f"重命名: {original_name} -> {unique_name}")
                renamed_count += 1
    
    print(f"重命名完成！共處理了 {renamed_count} 個物件。")

def remove_suffixes():
    """移除Blender自動添加的數字後綴（如.001, .002等）"""
    
    for obj in bpy.context.scene.objects:
        if obj.type == 'MESH':
            original_name = obj.name
            # 移除.001, .002等後綴
            cleaned_name = re.sub(r'\.\d{3}$', '', original_name)
            
            if cleaned_name != original_name:
                # 確保名稱不重複
                if cleaned_name not in [o.name for o in bpy.context.scene.objects if o != obj]:
                    obj.name = cleaned_name
                    print(f"清理後綴: {original_name} -> {cleaned_name}")

def generate_name_report():
    """生成名稱報告，方便檢查"""
    mesh_objects = [obj for obj in bpy.context.scene.objects if obj.type == 'MESH']
    
    print("\n=== 物件名稱報告 ===")
    print(f"總共 {len(mesh_objects)} 個網格物件:")
    
    categories = {}
    for obj in mesh_objects:
        name = obj.name
        # 簡單分類
        if any(part in name for part in ['頭', '臉', '眼', '鼻', '嘴', '耳']):
            category = '頭部'
        elif any(part in name for part in ['軀幹', '胸', '腹', '背', '腰', '頸']):
            category = '軀幹'
        elif any(part in name for part in ['肩', '上臂', '前臂', '手']):
            category = '上肢'
        elif any(part in name for part in ['大腿', '小腿', '腳']):
            category = '下肢'
        elif '指' in name:
            category = '手指'
        else:
            category = '其他'
        
        if category not in categories:
            categories[category] = []
        categories[category].append(name)
    
    for category, names in categories.items():
        print(f"\n{category} ({len(names)}個):")
        for name in sorted(names):
            print(f"  - {name}")

# 主執行函數
if __name__ == "__main__":
    print("開始批量重命名...")
    remove_suffixes()
    normalize_chinese_names() 
    generate_name_report()
    print("批量重命名完成！")