from collections import Counter
from typing import Optional

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import models
import schemas
import matching
from database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="舞伴匹配 API")

# 允许跨域（前端 dev 服务器与手机访问）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _to_dict(p: models.Person):
    return {
        "id": p.id,
        "student_id": p.student_id,
        "name": p.name,
        "gender": p.gender,
        "age": p.age,
        "region": p.region,
        "dance_styles": p.dance_styles or [],
        "hobbies": p.hobbies or [],
        "zodiac": p.zodiac,
        "mbti": p.mbti,
    }


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/persons", response_model=schemas.PersonCreateResponse)
def create_person(payload: schemas.PersonCreate, db: Session = Depends(get_db)):
    data = payload.model_dump()
    data["name"] = (data.get("name") or "").strip()
    data["student_id"] = (data.get("student_id") or "").strip() or None

    sid = data["student_id"]
    name = data["name"]

    # 排重：同学号 + 姓名 → 覆盖更新；无学号时按姓名排重
    existing = db.query(models.Person).filter(
        models.Person.student_id == sid,
        models.Person.name == name,
    ).first()
    if existing is None and sid:
        # 同学号但姓名不同（视为更正姓名），同样覆盖，避免学号唯一约束冲突
        existing = db.query(models.Person).filter(
            models.Person.student_id == sid
        ).first()

    overwritten = False
    if existing:
        for k, v in data.items():
            setattr(existing, k, v)
        person = existing
        overwritten = True
    else:
        person = models.Person(**data)
        db.add(person)

    db.commit()
    db.refresh(person)
    return {"person": _to_dict(person), "overwritten": overwritten}


@app.get("/api/persons")
def list_persons(db: Session = Depends(get_db)):
    rows = db.query(models.Person).order_by(models.Person.id.desc()).all()
    return [_to_dict(p) for p in rows]


@app.delete("/api/persons")
def clear_persons(db: Session = Depends(get_db)):
    count = db.query(models.Person).count()
    db.query(models.Person).delete(synchronize_session=False)
    db.commit()
    return {"ok": True, "deleted": count}


@app.delete("/api/persons/{pid}")
def delete_person(pid: int, db: Session = Depends(get_db)):
    p = db.get(models.Person, pid)
    if not p:
        raise HTTPException(status_code=404, detail="未找到该人员")
    db.delete(p)
    db.commit()
    return {"ok": True}


@app.put("/api/persons/{pid}")
def update_person(pid: int, payload: schemas.PersonUpdate, db: Session = Depends(get_db)):
    p = db.get(models.Person, pid)
    if not p:
        raise HTTPException(status_code=404, detail="未找到该人员")
    data = payload.model_dump(exclude_unset=True)
    if "name" in data:
        data["name"] = (data["name"] or "").strip()
    if "student_id" in data:
        data["student_id"] = (data["student_id"] or "").strip() or None
        if data["student_id"]:
            dup = (
                db.query(models.Person)
                .filter(
                    models.Person.student_id == data["student_id"],
                    models.Person.id != pid,
                )
                .first()
            )
            if dup:
                raise HTTPException(status_code=409, detail="该学号已被其他人员使用")
    for k, v in data.items():
        setattr(p, k, v)
    db.commit()
    db.refresh(p)
    return _to_dict(p)


@app.get("/api/stats")
def stats(db: Session = Depends(get_db)):
    persons = db.query(models.Person).all()
    gender = Counter(p.gender for p in persons)
    dance = Counter()
    region = Counter()
    zodiac = Counter()
    mbti = Counter()
    for p in persons:
        for s in (p.dance_styles or []):
            dance[s] += 1
        if p.region:
            region[p.region] += 1
        if p.zodiac:
            zodiac[p.zodiac] += 1
        if p.mbti:
            mbti[p.mbti] += 1
    return {
        "total": len(persons),
        "gender": dict(gender.most_common()),
        "dance_styles": dict(dance.most_common()),
        "regions": dict(region.most_common()),
        "zodiac": dict(zodiac.most_common()),
        "mbti": dict(mbti.most_common()),
    }


@app.post("/api/match")
def do_match(payload: Optional[schemas.MatchRequest] = None, db: Session = Depends(get_db)):
    persons = [_to_dict(p) for p in db.query(models.Person).all()]
    if payload is None:
        return matching.match_people(persons)
    return matching.match_people(
        persons,
        gender_mode=payload.gender_mode,
        algorithm=payload.algorithm,
        min_score=payload.min_score,
        filters=payload.filters.model_dump() if payload.filters else None,
    )


@app.post("/api/seed")
def seed(db: Session = Depends(get_db)):
    from seed import seed_demo
    return seed_demo(db)


if __name__ == "__main__":
    import os
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
