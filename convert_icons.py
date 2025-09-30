#!/usr/bin/env python3
"""
Script para copiar e converter ícones JPG para PNG
Copia ícones de C:/Users/WINDOWS 10/Pictures/Icones DK/Nova pasta
para o projeto e converte para PNG mantendo transparência
"""

import os
import shutil
from PIL import Image
import sys

def setup_directories():
    """Cria diretórios necessários para os ícones"""
    directories = [
        "frontend/src/assets/icons",
        "frontend/public/icons", 
        "src/assets/icons"
    ]
    
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
        print(f"✅ Diretório criado: {directory}")

def convert_jpg_to_png(source_path, dest_path):
    """Converte JPG para PNG mantendo qualidade"""
    try:
        with Image.open(source_path) as img:
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
            img.save(dest_path, "PNG")
            return True
    except Exception as e:
        print(f"❌ Erro ao converter {source_path}: {e}")
        return False

def copy_and_convert_icons():
    """Copia e converte todos os ícones"""
    source_dir = r"C:\Users\WINDOWS 10\Pictures\Icones DK\Nova pasta"
    
    if not os.path.exists(source_dir):
        print(f"❌ Diretório fonte não encontrado: {source_dir}")
        print("📋 Por favor, copie manualmente os ícones para:")
        print("   - frontend/src/assets/icons/")
        print("   - frontend/public/icons/")
        return False
    
    # Mapear destinos baseado no nome do arquivo
    destinations = {
        "frontend/src/assets/icons": [],
        "frontend/public/icons": [],
        "src/assets/icons": []
    }
    
    converted_count = 0
    
    try:
        for filename in os.listdir(source_dir):
            if filename.lower().endswith(('.jpg', '.jpeg')):
                source_path = os.path.join(source_dir, filename)
                
                # Nome do arquivo PNG
                png_filename = os.path.splitext(filename)[0] + '.png'
                
                # Copia para todos os diretórios
                for dest_dir in destinations.keys():
                    dest_path = os.path.join(dest_dir, png_filename)
                    
                    if convert_jpg_to_png(source_path, dest_path):
                        print(f"✅ Convertido: {filename} → {dest_path}")
                        converted_count += 1
                    else:
                        # Fallback: copia como JPG se conversão falhar
                        try:
                            shutil.copy2(source_path, os.path.join(dest_dir, filename))
                            print(f"📋 Copiado (JPG): {filename} → {dest_dir}")
                        except Exception as e:
                            print(f"❌ Erro ao copiar {filename}: {e}")
        
        print(f"\n🎉 Conversão concluída! {converted_count} ícones processados.")
        return True
        
    except PermissionError:
        print(f"❌ Sem permissão para acessar: {source_dir}")
        print("📋 Solução alternativa:")
        print("1. Copie manualmente os ícones JPG para: frontend/src/assets/icons/")
        print("2. Execute: python convert_local_icons.py")
        return False
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")
        return False

def list_available_icons():
    """Lista ícones disponíveis no projeto"""
    print("\n📁 Ícones disponíveis no projeto:")
    
    for directory in ["frontend/src/assets/icons", "frontend/public/icons"]:
        if os.path.exists(directory):
            icons = [f for f in os.listdir(directory) if f.lower().endswith(('.png', '.jpg', '.jpeg', '.svg'))]
            print(f"\n📂 {directory}:")
            for icon in sorted(icons):
                print(f"   - {icon}")

if __name__ == "__main__":
    print("🎨 Conversor de Ícones - Dungeon Keeper")
    print("=" * 50)
    
    # Configura diretórios
    setup_directories()
    
    # Tenta copiar e converter
    if copy_and_convert_icons():
        list_available_icons()
        print("\n✅ Processo concluído com sucesso!")
    else:
        print("\n📋 Execute manualmente se necessário:")
        print("1. Copie os ícones JPG para: frontend/src/assets/icons/")
        print("2. Execute: python convert_local_icons.py")