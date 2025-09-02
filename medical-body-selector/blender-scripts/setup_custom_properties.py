# Blender批量設置自定義屬性腳本
import bpy

def setup_custom_properties():
    """為所有網格物件設置自定義屬性"""
    
    # 身體部位中文名稱映射表
    body_parts_mapping = {
        # 頭部
        "頭": {"value": "頭部", "category": "head"},
        "臉": {"value": "面部", "category": "head"},
        "眼睛": {"value": "眼部", "category": "head"},
        "左眼": {"value": "左眼", "category": "head"},
        "右眼": {"value": "右眼", "category": "head"},
        "鼻子": {"value": "鼻部", "category": "head"},
        "嘴": {"value": "口部", "category": "head"},
        "耳朵": {"value": "耳部", "category": "head"},
        "左耳": {"value": "左耳", "category": "head"},
        "右耳": {"value": "右耳", "category": "head"},
        
        # 軀幹
        "軀幹": {"value": "軀幹", "category": "torso"},
        "胸部": {"value": "胸部", "category": "torso"},
        "腹部": {"value": "腹部", "category": "torso"},
        "背部": {"value": "背部", "category": "torso"},
        "腰部": {"value": "腰部", "category": "torso"},
        
        # 上肢
        "左肩": {"value": "左肩膀", "category": "upper_limb"},
        "右肩": {"value": "右肩膀", "category": "upper_limb"},
        "左上臂": {"value": "左上臂", "category": "upper_limb"},
        "右上臂": {"value": "右上臂", "category": "upper_limb"},
        "左前臂": {"value": "左前臂", "category": "upper_limb"},
        "右前臂": {"value": "右前臂", "category": "upper_limb"},
        "左手": {"value": "左手", "category": "upper_limb"},
        "右手": {"value": "右手", "category": "upper_limb"},
        
        # 下肢
        "左大腿": {"value": "左大腿", "category": "lower_limb"},
        "右大腿": {"value": "右大腿", "category": "lower_limb"},
        "左小腿": {"value": "左小腿", "category": "lower_limb"},
        "右小腿": {"value": "右小腿", "category": "lower_limb"},
        "左腳": {"value": "左腳", "category": "lower_limb"},
        "右腳": {"value": "右腳", "category": "lower_limb"},
        
        # 手指
        "左拇指": {"value": "左拇指", "category": "fingers"},
        "右拇指": {"value": "右拇指", "category": "fingers"},
        "左食指": {"value": "左食指", "category": "fingers"},
        "右食指": {"value": "右食指", "category": "fingers"},
        "左中指": {"value": "左中指", "category": "fingers"},
        "右中指": {"value": "右中指", "category": "fingers"},
        "左無名指": {"value": "左無名指", "category": "fingers"},
        "右無名指": {"value": "右無名指", "category": "fingers"},
        "左小指": {"value": "左小指", "category": "fingers"},
        "右小指": {"value": "右小指", "category": "fingers"},
    }
    
    # 遍歷場景中所有物件
    for obj in bpy.context.scene.objects:
        if obj.type == 'MESH':
            print(f"處理物件: {obj.name}")
            
            # 清除現有自定義屬性
            for key in list(obj.keys()):
                if key not in "_RNA_UI":
                    del obj[key]
            
            # 設置基本自定義屬性
            obj["value"] = obj.name  # 預設使用物件名稱
            obj["category"] = "other"
            obj["clickable"] = True
            obj["highlighted"] = False
            
            # 檢查是否有匹配的映射
            for key, mapping in body_parts_mapping.items():
                if key in obj.name:
                    obj["value"] = mapping["value"]
                    obj["category"] = mapping["category"]
                    break
            
            # 設置屬性的UI顯示
            obj["_RNA_UI"] = {
                "value": {
                    "description": "身體部位名稱",
                    "default": ""
                },
                "category": {
                    "description": "身體部位分類",
                    "default": "other"
                },
                "clickable": {
                    "description": "是否可點擊",
                    "default": True
                },
                "highlighted": {
                    "description": "是否高亮顯示",
                    "default": False
                }
            }
    
    print("自定義屬性設置完成！")

def create_material_variants():
    """為每個身體部位創建材質變體（正常和高亮）"""
    
    # 基礎材質顏色
    base_colors = {
        "head": (0.9, 0.7, 0.6, 1.0),      # 淺膚色
        "torso": (0.85, 0.65, 0.55, 1.0),   # 中膚色
        "upper_limb": (0.8, 0.6, 0.5, 1.0), # 深一點的膚色
        "lower_limb": (0.75, 0.55, 0.45, 1.0), # 更深的膚色
        "fingers": (0.85, 0.65, 0.55, 1.0), # 手指膚色
        "other": (0.7, 0.5, 0.4, 1.0)       # 其他部位
    }
    
    for category, color in base_colors.items():
        # 創建正常材質
        normal_mat = bpy.data.materials.new(name=f"{category}_normal")
        normal_mat.use_nodes = True
        bsdf = normal_mat.node_tree.nodes["Principled BSDF"]
        bsdf.inputs["Base Color"].default_value = color
        bsdf.inputs["Roughness"].default_value = 0.8
        bsdf.inputs["Subsurface"].default_value = 0.1
        
        # 創建高亮材質
        highlight_mat = bpy.data.materials.new(name=f"{category}_highlight")
        highlight_mat.use_nodes = True
        bsdf_highlight = highlight_mat.node_tree.nodes["Principled BSDF"]
        # 高亮顏色更亮並帶有發光效果
        highlight_color = (min(1.0, color[0] + 0.3), min(1.0, color[1] + 0.3), min(1.0, color[2] + 0.3), 1.0)
        bsdf_highlight.inputs["Base Color"].default_value = highlight_color
        bsdf_highlight.inputs["Emission"].default_value = (0.2, 0.2, 0.2, 1.0)
        bsdf_highlight.inputs["Roughness"].default_value = 0.3

def assign_materials():
    """根據分類為物件分配材質"""
    for obj in bpy.context.scene.objects:
        if obj.type == 'MESH' and "category" in obj:
            category = obj["category"]
            material_name = f"{category}_normal"
            
            if material_name in bpy.data.materials:
                # 清除現有材質
                obj.data.materials.clear()
                # 分配新材質
                obj.data.materials.append(bpy.data.materials[material_name])

# 主執行函數
if __name__ == "__main__":
    setup_custom_properties()
    create_material_variants()
    assign_materials()
    
    print("所有設置完成！請檢查物件屬性面板查看自定義屬性。")
    print("匯出時請確保勾選 'Custom Properties' 選項。")