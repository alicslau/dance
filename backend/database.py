import os

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# 云平台（Render / Heroku / Neon / Supabase 等）通过 DATABASE_URL 注入 Postgres 连接串；
# 未设置则退回本地 SQLite（开发环境）。Render 的 SQLite 是临时文件，重启即清空。
DATABASE_URL = os.environ.get("DATABASE_URL")

if DATABASE_URL:
    # 各平台给的连接串可能是 postgres:// 或 postgresql://，统一成显式 psycopg2 驱动
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg2://", 1)
    elif DATABASE_URL.startswith("postgresql://"):
        DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://", 1)
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)
else:
    engine = create_engine(
        "sqlite:///./dance.db",
        connect_args={"check_same_thread": False},
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
