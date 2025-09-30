#!/usr/bin/env python3
"""
Script para converter ícones JPG locais para PNG
Para usar quando os ícones já estão na pasta do projeto
"""

import os
from PIL import Image

def convert_local_icons():
    """Converte ícones JPG locais para PNG"""
    directories = [
        "frontend/src/assets/icons",
        "frontend/public/icons",
        "src/assets/icons"
    ]
    
    converted_count = 0
    
    for directory in directories:
        if not os.path.exists(directory):
            os.makedirs(directory, exist_ok=True)
            print(f"✅ Diretório criado: {directory}")
            continue
            
        print(f"\n📂 Processando: {directory}")
        
        for filename in os.listdir(directory):
            if filename.lower().endswith(('.jpg', '.jpeg')):
                jpg_path = os.path.join(directory, filename)
                png_filename = os.path.splitext(filename)[0] + '.png'
                png_path = os.path.join(directory, png_filename)
                
                try:
                    with Image.open(jpg_path) as img:
                        # Converte para RGBA para suportar transparência
                        if img.mode != 'RGBA':
                            img = img.convert('RGBA')
                        
                        # Remove fundo branco se existir
                        data = img.getdata()
                        new_data = []
                        for item in data:
                            # Se o pixel for branco (ou quase branco), torna transparente
                            if item[0] > 240 and item[1] > 240 and item[2] > 240:
                                new_data.append((255, 255, 255, 0))  # Transparente
                            else:
                                new_data.append(item)
                        
                        img.putdata(new_data)
                        img.save(png_path, "PNG")
                        
                        # Remove o arquivo JPG original
                        os.remove(jpg_path)
                        
                        print(f"✅ Convertido: {filename} → {png_filename}")
                        converted_count += 1
                        
                except Exception as e:
                    print(f"❌ Erro ao converter {filename}: {e}")
    
    print(f"\n🎉 Conversão concluída! {converted_count} ícones convertidos para PNG.")
    
    # Lista ícones finais
    print("\n📁 Ícones disponíveis:")
    for directory in directories:
        if os.path.exists(directory):
            icons = [f for f in os.listdir(directory) if f.lower().endswith(('.png', '.svg'))]
            if icons:
                print(f"\n📂 {directory}:")
                for icon in sorted(icons):
                    print(f"   - {icon}")

if __name__ == "__main__":
    print("🎨 Conversor Local de Ícones - Dungeon Keeper")
    print("=" * 50)
    convert_local_icons()