"""演示数据：方便快速看到匹配效果。"""

from models import Person

DEMO = [
    {"student_id": "20240101", "name": "张子涵", "gender": "male", "age": 21, "region": "北京",
     "dance_styles": ["拉丁", "摩登"], "hobbies": ["摄影", "旅行"], "zodiac": "狮子座", "mbti": "ENFP"},
    {"student_id": "20240102", "name": "李雨桐", "gender": "female", "age": 20, "region": "北京",
     "dance_styles": ["拉丁", "爵士"], "hobbies": ["摄影", "音乐"], "zodiac": "射手座", "mbti": "INTJ"},
    {"student_id": "20240103", "name": "王浩然", "gender": "male", "age": 22, "region": "上海",
     "dance_styles": ["摩登", "国标"], "hobbies": ["篮球", "音乐"], "zodiac": "天蝎座", "mbti": "ISTJ"},
    {"student_id": "20240104", "name": "赵思琪", "gender": "female", "age": 21, "region": "上海",
     "dance_styles": ["摩登", "芭蕾"], "hobbies": ["画画", "旅行"], "zodiac": "巨蟹座", "mbti": "ESFP"},
    {"student_id": "20240105", "name": "陈宇航", "gender": "male", "age": 20, "region": "广州",
     "dance_styles": ["街舞", "K-pop"], "hobbies": ["说唱", "摄影"], "zodiac": "双子座", "mbti": "ENTP"},
    {"student_id": "20240106", "name": "林晓彤", "gender": "female", "age": 19, "region": "广州",
     "dance_styles": ["街舞", "爵士"], "hobbies": ["追剧", "美食"], "zodiac": "天秤座", "mbti": "INFJ"},
    {"student_id": "20240107", "name": "刘子墨", "gender": "male", "age": 23, "region": "北京",
     "dance_styles": ["拉丁", "交谊舞"], "hobbies": ["健身", "旅行"], "zodiac": "白羊座", "mbti": "ESFJ"},
    {"student_id": "20240108", "name": "孙佳怡", "gender": "female", "age": 22, "region": "北京",
     "dance_styles": ["拉丁", "民族舞"], "hobbies": ["瑜伽", "美食"], "zodiac": "水瓶座", "mbti": "ISFP"},
    {"student_id": "20240109", "name": "周明轩", "gender": "male", "age": 21, "region": "深圳",
     "dance_styles": ["现代舞", "芭蕾"], "hobbies": ["阅读", "电影"], "zodiac": "双鱼座", "mbti": "INFP"},
    {"student_id": "20240110", "name": "吴若曦", "gender": "female", "age": 20, "region": "深圳",
     "dance_styles": ["现代舞", "爵士"], "hobbies": ["阅读", "画画"], "zodiac": "处女座", "mbti": "ENFJ"},
    {"student_id": "20240111", "name": "郑凯文", "gender": "male", "age": 22, "region": "杭州",
     "dance_styles": ["国标", "交谊舞"], "hobbies": ["游戏", "篮球"], "zodiac": "摩羯座", "mbti": "ESTP"},
    {"student_id": "20240112", "name": "何思远", "gender": "female", "age": 21, "region": "杭州",
     "dance_styles": ["国标", "芭蕾"], "hobbies": ["摄影", "美食"], "zodiac": "金牛座", "mbti": "ISFJ"},
    {"student_id": "20240113", "name": "马骏驰", "gender": "male", "age": 20, "region": "成都",
     "dance_styles": ["K-pop", "街舞"], "hobbies": ["说唱", "游戏"], "zodiac": "狮子座", "mbti": "ESTJ"},
    {"student_id": "20240114", "name": "罗雪莹", "gender": "female", "age": 19, "region": "成都",
     "dance_styles": ["K-pop", "爵士"], "hobbies": ["追星", "美食"], "zodiac": "天秤座", "mbti": "ISFP"},
    {"student_id": "20240115", "name": "高志远", "gender": "male", "age": 24, "region": "北京",
     "dance_styles": ["交谊舞", "摩登"], "hobbies": ["健身", "阅读"], "zodiac": "巨蟹座", "mbti": "INTP"},
    {"student_id": "20240116", "name": "冯雅婷", "gender": "female", "age": 23, "region": "北京",
     "dance_styles": ["交谊舞", "民族舞"], "hobbies": ["瑜伽", "电影"], "zodiac": "天蝎座", "mbti": "ENTJ"},
]


def seed_demo(db):
    existing = db.query(Person).count()
    if existing > 0:
        return {"seeded": False, "count": existing, "message": "已有数据，跳过填充"}
    persons = [Person(**p) for p in DEMO]
    db.add_all(persons)
    db.commit()
    return {"seeded": True, "count": len(persons), "message": "已填充演示数据"}
