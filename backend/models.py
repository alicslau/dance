from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, JSON

from database import Base


class Person(Base):
    __tablename__ = "persons"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String(64), unique=True, index=True, nullable=True)
    name = Column(String(64), nullable=False, index=True)
    gender = Column(String(16), nullable=False)  # male / female / other
    age = Column(Integer, nullable=True)
    region = Column(String(64), nullable=True)
    dance_styles = Column(JSON, default=list)  # ["拉丁", "摩登", ...]
    hobbies = Column(JSON, default=list)  # ["摄影", "旅行", ...]
    zodiac = Column(String(16), nullable=True)  # 星座
    mbti = Column(String(8), nullable=True)  # MBTI
    created_at = Column(DateTime, default=datetime.utcnow)
