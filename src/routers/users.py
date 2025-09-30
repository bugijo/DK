from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from datetime import timedelta
from .. import crud, schemas, auth, database, models
import shutil
import os

AVATAR_DIR = "static/avatars"
os.makedirs(AVATAR_DIR, exist_ok=True)

router = APIRouter(prefix="/api/v1/users", tags=["users"])

@router.get("/me", response_model=schemas.User)
def read_users_me(current_user: models.User = Depends(auth.get_current_active_user)):
    return current_user

@router.put("/me", response_model=schemas.User)
def update_user_me(
    user_update: schemas.UserUpdate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    return crud.update_user(db=db, user_id=current_user.id, user_update=user_update)

@router.post("/me/avatar")
def upload_avatar(
    file: UploadFile = File(...),
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    file_path = os.path.join(AVATAR_DIR, f"{current_user.id}_{file.filename}")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Salva o caminho do arquivo no banco de dados
    current_user.avatar_url = f"/avatars/{current_user.id}_{file.filename}"
    db.commit()
    return {"filename": file.filename, "avatar_url": current_user.avatar_url}

@router.put("/me/notifications", response_model=schemas.User)
def update_user_notification_settings(
    settings_update: schemas.NotificationSettingsUpdate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Atualiza as preferências de notificação do usuário logado."""
    return crud.update_user(db=db, user_id=current_user.id, user_update=settings_update)

@router.get("/me/inventory", response_model=schemas.UserInventory)
def get_my_full_inventory(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """
    Retorna uma coleção completa de todos os assets criados
    pelo usuário atualmente logado.
    """
    # Usamos as funções CRUD que já existem para coletar tudo!
    user_items = crud.get_user_items(db=db, user_id=current_user.id)
    user_monsters = crud.get_user_monsters(db=db, user_id=current_user.id)
    user_npcs = crud.get_user_npcs(db=db, user_id=current_user.id)
    user_stories = crud.get_user_stories(db=db, user_id=current_user.id)
    user_characters = crud.get_characters_by_owner(db=db, owner_id=current_user.id)

    return schemas.UserInventory(
        characters=user_characters,
        items=user_items,
        monsters=user_monsters,
        npcs=user_npcs,
        stories=user_stories
    )

@router.post("/password-recovery/{email}")
def request_password_recovery(email: str, db: Session = Depends(database.get_db)):
    """
    Se o usuário existir, gera um token de reset e o 'envia' (imprime no console).
    """
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        # Não revelamos se o email existe ou não por segurança
        print(f"Tentativa de recuperação de senha para email não existente: {email}")
        return {"message": "Se um usuário com este email existir, um link de recuperação foi enviado."}
    
    password_reset_token = auth.create_access_token(
        data={"sub": user.email}, expires_delta=timedelta(minutes=15)
    )
    
    reset_link = f"http://localhost:3001/reset-password?token={password_reset_token}"
    
    print("--- SIMULAÇÃO DE ENVIO DE E-MAIL ---")
    print(f"Para: {user.email}")
    print(f"Assunto: Redefinição de Senha - Dungeon Keeper")
    print(f"Clique no link para redefinir sua senha: {reset_link}")
    print("------------------------------------")

    return {"message": "Se um usuário com este email existir, um link de recuperação foi enviado."}

@router.post("/reset-password/")
def reset_password(
    request: schemas.ResetPasswordRequest,
    db: Session = Depends(database.get_db)
):
    """Valida o token e redefine a senha do usuário."""
    email = auth.verify_password_reset_token(request.token)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token de redefinição inválido ou expirado",
        )
    
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado.",
        )
        
    hashed_password = auth.get_password_hash(request.new_password)
    user.hashed_password = hashed_password
    db.commit()
    
    return {"message": "Senha redefinida com sucesso."}