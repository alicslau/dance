from typing import List, Optional

from pydantic import BaseModel, ConfigDict, field_validator

GENDERS = {"male", "female", "other"}


class PersonCreate(BaseModel):
    student_id: str
    name: str
    gender: str
    age: Optional[int] = None
    region: Optional[str] = None
    dance_styles: List[str] = []
    hobbies: List[str] = []
    zodiac: Optional[str] = None
    mbti: Optional[str] = None

    @field_validator("student_id")
    @classmethod
    def check_student_id(cls, v):
        v = (v or "").strip()
        if not v:
            raise ValueError("学号不能为空")
        return v

    @field_validator("gender")
    @classmethod
    def check_gender(cls, v):
        if v not in GENDERS:
            raise ValueError("gender 必须是 male / female / other")
        return v


class PersonUpdate(BaseModel):
    student_id: Optional[str] = None
    name: Optional[str] = None
    gender: Optional[str] = None
    age: Optional[int] = None
    region: Optional[str] = None
    dance_styles: Optional[List[str]] = None
    hobbies: Optional[List[str]] = None
    zodiac: Optional[str] = None
    mbti: Optional[str] = None

    @field_validator("gender")
    @classmethod
    def check_gender(cls, v):
        if v is not None and v not in GENDERS:
            raise ValueError("gender 必须是 male / female / other")
        return v


class PersonOut(PersonCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int


class PersonCreateResponse(BaseModel):
    person: PersonOut
    overwritten: bool


class MatchFilters(BaseModel):
    dance_style: Optional[str] = None
    region: Optional[str] = None
    gender: Optional[str] = None


class MatchRequest(BaseModel):
    gender_mode: str = "opposite"  # opposite 异性优先 / any 不限性别
    algorithm: str = "optimal"  # optimal 全局最优 / greedy 贪心
    min_score: float = 0.0  # 最低匹配分 0~1
    filters: Optional[MatchFilters] = None
