import bpy

# 簡單直接的設置，不使用函數包裝
print("開始設置身體部位 Custom Properties...")

processed = 0
for obj in bpy.data.objects:
    if obj.type == 'MESH':
        obj["value"] = obj.name
        obj["display_name"] = obj.name  
        obj["clickable"] = True
        obj["is_body_part"] = True
        obj["medical_code"] = f"PART_{obj.name.upper()}"
        processed += 1
        print(f"已處理: {obj.name}")

print(f"完成！共處理 {processed} 個物件")
print("請進行 glTF 匯出：File > Export > glTF 2.0 (.glb)")
print("記得勾選 Custom Properties")