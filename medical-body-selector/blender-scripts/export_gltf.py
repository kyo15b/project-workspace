# Blender自動化匯出glTF腳本
import bpy
import os
from pathlib import Path

def optimize_for_export():
    """匯出前優化場景"""
    
    print("開始匯出前優化...")
    
    # 選擇所有網格物件
    bpy.ops.object.select_all(action='DESELECT')
    mesh_objects = [obj for obj in bpy.context.scene.objects if obj.type == 'MESH']
    
    for obj in mesh_objects:
        obj.select_set(True)
        bpy.context.view_layer.objects.active = obj
        
        # 套用所有modifier
        bpy.context.view_layer.objects.active = obj
        for modifier in obj.modifiers:
            try:
                bpy.ops.object.modifier_apply(modifier=modifier.name)
                print(f"套用modifier: {modifier.name} 到 {obj.name}")
            except:
                print(f"無法套用modifier: {modifier.name} 到 {obj.name}")
        
        # 清理重複頂點
        bpy.ops.object.mode_set(mode='EDIT')
        bpy.ops.mesh.select_all(action='SELECT')
        bpy.ops.mesh.remove_doubles(threshold=0.0001)
        bpy.ops.object.mode_set(mode='OBJECT')
    
    print("匯出前優化完成")

def export_gltf_with_settings(output_path, filename="female_body_model"):
    """使用最佳設置匯出glTF"""
    
    # 確保輸出目錄存在
    Path(output_path).mkdir(parents=True, exist_ok=True)
    
    # 完整檔案路徑
    full_path = os.path.join(output_path, f"{filename}.glb")
    
    print(f"匯出路徑: {full_path}")
    
    # glTF匯出設置
    export_settings = {
        'filepath': full_path,
        'export_format': 'GLB',  # 使用GLB格式（二進制）
        'ui_tab': 'GENERAL',
        
        # 包含設置
        'export_extras': True,           # 匯出額外數據
        'export_cameras': False,         # 不匯出相機
        'export_lights': False,          # 不匯出燈光
        'export_materials': 'EXPORT',    # 匯出材質
        'export_colors': True,           # 匯出頂點顏色
        'export_attributes': True,       # 匯出自定義屬性
        'use_mesh_edges': False,         # 不匯出邊緣
        'use_mesh_vertices': False,      # 不匯出獨立頂點
        'export_custom_properties': True, # 重要：匯出自定義屬性
        
        # 變形設置
        'export_morph': False,           # 不匯出形態鍵
        'export_morph_normal': False,
        'export_morph_tangent': False,
        
        # 骨骼動畫設置
        'export_skins': False,           # 不匯出蒙皮
        'export_all_influences': False,
        'export_animations': False,      # 不匯出動畫
        'export_frame_range': False,
        'export_frame_step': 1,
        'export_force_sampling': False,
        'export_nla_strips': False,
        'export_def_bones': False,
        'optimize_animation_size': False,
        'export_anim_single_armature': False,
        'export_reset_pose_bones': False,
        'export_current_frame': False,
        
        # 壓縮設置
        'export_draco_mesh_compression_enable': True,  # 啟用Draco壓縮
        'export_draco_mesh_compression_level': 6,      # 壓縮等級（0-10）
        'export_draco_position_quantization': 14,     # 位置量化精度
        'export_draco_normal_quantization': 10,       # 法線量化精度  
        'export_draco_texcoord_quantization': 12,     # UV量化精度
        'export_draco_color_quantization': 10,        # 顏色量化精度
        'export_draco_generic_quantization': 12,      # 通用量化精度
        
        # 材質設置
        'export_image_format': 'AUTO',   # 自動選擇圖片格式
        'export_texture_dir': '',        # 紋理目錄
        'export_jpeg_quality': 75,       # JPEG質量
        
        # 幾何設置
        'export_apply': True,            # 套用變形
        'export_texcoords': True,        # 匯出UV坐標
        'export_normals': True,          # 匯出法線
        'export_tangents': False,        # 不匯出切線
        'export_yup': True,              # 使用Y軸向上
        
        # 其他設置
        'will_save_settings': False,     # 不保存設置
        'filter_glob': '*.glb;*.gltf'    # 檔案過濾器
    }
    
    try:
        # 執行匯出
        bpy.ops.export_scene.gltf(**export_settings)
        print(f"✓ 成功匯出到: {full_path}")
        
        # 檢查檔案大小
        if os.path.exists(full_path):
            file_size = os.path.getsize(full_path) / (1024 * 1024)  # MB
            print(f"檔案大小: {file_size:.2f} MB")
        
        return True
        
    except Exception as e:
        print(f"✗ 匯出失敗: {str(e)}")
        return False

def create_export_report():
    """創建匯出報告"""
    
    mesh_objects = [obj for obj in bpy.context.scene.objects if obj.type == 'MESH']
    
    report = []
    report.append("=== glTF匯出報告 ===")
    report.append(f"匯出時間: {bpy.app.build_date}")
    report.append(f"物件數量: {len(mesh_objects)}")
    report.append("")
    
    # 按分類統計
    categories = {}
    total_verts = 0
    total_faces = 0
    
    for obj in mesh_objects:
        # 取得分類
        category = obj.get("category", "未分類")
        if category not in categories:
            categories[category] = {"count": 0, "objects": []}
        
        categories[category]["count"] += 1
        categories[category]["objects"].append(obj.name)
        
        # 統計頂點和面數
        if obj.data:
            total_verts += len(obj.data.vertices)
            total_faces += len(obj.data.polygons)
    
    report.append(f"總頂點數: {total_verts:,}")
    report.append(f"總面數: {total_faces:,}")
    report.append("")
    
    report.append("分類統計:")
    for category, data in categories.items():
        report.append(f"  {category}: {data['count']}個物件")
        for obj_name in data["objects"][:5]:  # 只顯示前5個
            report.append(f"    - {obj_name}")
        if len(data["objects"]) > 5:
            report.append(f"    ... 還有 {len(data['objects']) - 5} 個")
    
    # 輸出報告
    for line in report:
        print(line)
    
    return "\n".join(report)

# 主執行函數
def main(output_directory="C:/TradingView-Pine/src/assets/models"):
    """主匯出流程"""
    
    print("開始3D模型匯出流程...")
    
    # 1. 匯出前優化
    optimize_for_export()
    
    # 2. 創建匯出報告
    report = create_export_report()
    
    # 3. 執行匯出
    success = export_gltf_with_settings(output_directory)
    
    if success:
        print("匯出流程完成！")
        
        # 保存報告
        report_path = os.path.join(output_directory, "export_report.txt")
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write(report)
        print(f"匯出報告已保存到: {report_path}")
        
    return success

# 如果直接執行此腳本
if __name__ == "__main__":
    main()