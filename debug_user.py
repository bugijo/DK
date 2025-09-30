import sys
sys.path.append('src')

from src.database import SessionLocal
from src.models import User
from src.crud import get_user_by_username

def debug_user():
    db = SessionLocal()
    try:
        # Verificar se o usuário admin existe
        user = get_user_by_username(db, "admin")
        if user:
            print(f"Usuário encontrado: {user.username}, ID: {user.id}, Ativo: {user.is_active}")
            print(f"Email: {user.email}")
        else:
            print("Usuário 'admin' não encontrado")
            
        # Listar todos os usuários
        all_users = db.query(User).all()
        print(f"\nTotal de usuários no banco: {len(all_users)}")
        for u in all_users:
            print(f"- {u.username} (ID: {u.id}, Ativo: {u.is_active})")
            
    except Exception as e:
        print(f"Erro: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    debug_user()