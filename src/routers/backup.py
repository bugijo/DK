from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
import json
from .. import crud, schemas, auth, database

router = APIRouter(
    prefix="/api/v1/backup",
    tags=["backup"],
    dependencies=[Depends(auth.get_current_active_user)]
)

@router.get("/export", response_model=schemas.UserBackup)
def export_user_data(
    db: Session = Depends(database.get_db),
    current_user: schemas.User = Depends(auth.get_current_active_user)
):
    """Exporta todos os dados criados pelo usuário logado."""
    # Usamos as funções CRUD que já existem!
    characters = crud.get_user_characters(db, user_id=current_user.id)
    items = crud.get_user_items(db, user_id=current_user.id)
    monsters = crud.get_user_monsters(db, user_id=current_user.id)
    npcs = crud.get_user_npcs(db, user_id=current_user.id)
    stories = crud.get_user_stories(db, user_id=current_user.id)
    
    backup_data = schemas.UserBackup(
        characters=characters,
        items=items,
        monsters=monsters,
        npcs=npcs,
        stories=stories
    )
    return backup_data

@router.post("/import")
def import_user_data(
    file: UploadFile = File(...),
    db: Session = Depends(database.get_db),
    current_user: schemas.User = Depends(auth.get_current_active_user)
):
    """Importa dados de um arquivo de backup JSON para o usuário logado."""
    try:
        contents = file.file.read()
        backup_data = json.loads(contents)
        
        imported_count = 0
        
        # Importar itens
        if "items" in backup_data:
            for item_data in backup_data["items"]:
                # Remove campos que não devem ser importados
                item_data.pop("id", None)
                item_data.pop("owner_id", None)
                item_schema = schemas.ItemCreate(**item_data)
                crud.create_user_item(db=db, item=item_schema, user_id=current_user.id)
                imported_count += 1
        
        # Importar monstros
        if "monsters" in backup_data:
            for monster_data in backup_data["monsters"]:
                monster_data.pop("id", None)
                monster_data.pop("owner_id", None)
                monster_schema = schemas.MonsterCreate(**monster_data)
                crud.create_user_monster(db=db, monster=monster_schema, user_id=current_user.id)
                imported_count += 1
        
        # Importar NPCs
        if "npcs" in backup_data:
            for npc_data in backup_data["npcs"]:
                npc_data.pop("id", None)
                npc_data.pop("owner_id", None)
                npc_schema = schemas.NPCCreate(**npc_data)
                crud.create_user_npc(db=db, npc=npc_schema, user_id=current_user.id)
                imported_count += 1
        
        # Importar histórias
        if "stories" in backup_data:
            for story_data in backup_data["stories"]:
                story_data.pop("id", None)
                story_data.pop("owner_id", None)
                story_schema = schemas.StoryCreate(**story_data)
                crud.create_user_story(db=db, story=story_schema, user_id=current_user.id)
                imported_count += 1
        
        # Importar personagens
        if "characters" in backup_data:
            for character_data in backup_data["characters"]:
                character_data.pop("id", None)
                character_data.pop("owner_id", None)
                character_schema = schemas.CharacterCreate(**character_data)
                crud.create_character_for_user(db=db, character=character_schema, user_id=current_user.id)
                imported_count += 1

        return {
            "status": "success", 
            "message": f"Dados importados com sucesso. {imported_count} itens processados."
        }
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Arquivo JSON inválido.")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao processar o arquivo de backup: {str(e)}")