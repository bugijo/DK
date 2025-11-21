# src/database.py
import os
from typing import Optional
from urllib.parse import quote_plus

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Carrega variáveis de ambiente
load_dotenv()

def build_postgres_url_from_parts() -> Optional[str]:
    """Monta a URL de conexão usando partes fornecidas via variáveis de ambiente.

    Útil para quem recebe apenas host/porta/usuário/senha em vez de uma `DATABASE_URL`
    completa. O password é escapado com `quote_plus` para suportar caracteres especiais.
    """

    user = os.getenv("DB_USER")
    password = os.getenv("DB_PASSWORD")
    host = os.getenv("DB_HOST")
    name = os.getenv("DB_NAME")
    port = os.getenv("DB_PORT", "5432")

    if all([user, password, host, name]):
        return f"postgresql+psycopg2://{quote_plus(user)}:{quote_plus(password)}@{host}:{port}/{name}"

    return None


# Configuração do banco de dados
# Prioriza DATABASE_URL pronta; se ausente, tenta montar a partir das partes; por fim, usa SQLite local
DATABASE_URL = os.getenv("DATABASE_URL") or build_postgres_url_from_parts() or "sqlite:///./dungeon_keeper.db"

# Configurações específicas por tipo de banco
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL, connect_args={"check_same_thread": False}
    )
else:
    # PostgreSQL
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependência para obter a sessão do DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()