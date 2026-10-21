"""舞伴匹配算法：多维度打分 + 最优配对。

支持两种算法：
- optimal：全局最优。异性配对用匈牙利算法（Kuhn-Munkres，二分图最大权匹配）；
  不限性别用 networkx 的 Blossom 算法（一般图最大权匹配）。
- greedy：按分数从高到低贪心配对（旧行为）。
"""

from typing import List, Dict, Optional

# 各维度的权重（可自行调整）
WEIGHTS = {
    "dance": 0.35,  # 舞种重合
    "gender": 0.20,  # 性别互补
    "region": 0.15,  # 同地区
    "age": 0.10,  # 年龄相近
    "hobby": 0.10,  # 共同爱好
    "mbti": 0.05,  # MBTI 互补
    "zodiac": 0.05,  # 星座契合
}

# 星座四元素
ZODIAC_ELEMENTS = {
    "白羊座": "火", "狮子座": "火", "射手座": "火",
    "金牛座": "土", "处女座": "土", "摩羯座": "土",
    "双子座": "风", "天秤座": "风", "水瓶座": "风",
    "巨蟹座": "水", "天蝎座": "水", "双鱼座": "水",
}

# MBTI 常见“互补黄金搭档”
MBTI_GOLDEN = {
    frozenset(["INTJ", "ENFP"]), frozenset(["INFP", "ENFJ"]),
    frozenset(["INFJ", "ENTP"]), frozenset(["INTP", "ENTJ"]),
    frozenset(["ISTJ", "ESFP"]), frozenset(["ISFJ", "ESTP"]),
    frozenset(["ISTP", "ESFJ"]), frozenset(["ISFP", "ESTJ"]),
}

# 匈牙利算法里表示“禁止配对”的大代价（真实分数在 [0,1] 区间）
_FORBIDDEN = 1e6


def _jaccard(a, b):
    sa, sb = set(a or []), set(b or [])
    if not sa and not sb:
        return 0.5
    if not sa or not sb:
        return 0.3
    return len(sa & sb) / len(sa | sb)


def _dance_score(a, b):
    return _jaccard(a.get("dance_styles"), b.get("dance_styles"))


def _hobby_score(a, b):
    return _jaccard(a.get("hobbies"), b.get("hobbies"))


def _gender_score(a, b):
    g1, g2 = a.get("gender"), b.get("gender")
    if not g1 or not g2:
        return 0.5
    if {g1, g2} == {"male", "female"}:
        return 1.0
    return 0.5


def _region_score(a, b):
    r1, r2 = a.get("region"), b.get("region")
    if not r1 or not r2:
        return 0.5
    return 1.0 if r1 == r2 else 0.0


def _age_score(a, b):
    a1, a2 = a.get("age"), b.get("age")
    if a1 is None or a2 is None:
        return 0.5
    return max(0.0, 1.0 - abs(a1 - a2) / 12.0)


def _zodiac_score(a, b):
    z1, z2 = a.get("zodiac"), b.get("zodiac")
    if not z1 or not z2:
        return 0.5
    e1, e2 = ZODIAC_ELEMENTS.get(z1), ZODIAC_ELEMENTS.get(z2)
    if not e1 or not e2:
        return 0.5
    if (e1, e2) in (("火", "风"), ("风", "火"), ("土", "水"), ("水", "土")):
        return 0.9
    if e1 == e2:
        return 0.85
    return 0.45


def _mbti_score(a, b):
    m1, m2 = a.get("mbti"), b.get("mbti")
    if not m1 or not m2:
        return 0.5
    if frozenset([m1, m2]) in MBTI_GOLDEN:
        return 1.0
    if m1 == m2:
        return 0.6
    return 0.5


def pair_score(a, b):
    """返回 (总分, 各维度分)"""
    comps = {
        "dance": _dance_score(a, b),
        "gender": _gender_score(a, b),
        "region": _region_score(a, b),
        "age": _age_score(a, b),
        "hobby": _hobby_score(a, b),
        "mbti": _mbti_score(a, b),
        "zodiac": _zodiac_score(a, b),
    }
    score = sum(comps[k] * WEIGHTS[k] for k in WEIGHTS)
    return round(score, 4), comps


def _reasons(a, b, comps):
    reasons = []
    common = sorted(set(a.get("dance_styles") or []) & set(b.get("dance_styles") or []))
    if common:
        reasons.append("舞种重合：" + "、".join(common))
    if {a.get("gender"), b.get("gender")} == {"male", "female"}:
        reasons.append("性别互补")
    if a.get("region") and a.get("region") == b.get("region"):
        reasons.append("同地区：" + a["region"])
    if a.get("age") and b.get("age") and abs(a["age"] - b["age"]) <= 3:
        reasons.append("年龄相近")
    hobbies = sorted(set(a.get("hobbies") or []) & set(b.get("hobbies") or []))
    if hobbies:
        reasons.append("共同爱好：" + "、".join(hobbies))
    if comps["mbti"] >= 1.0:
        reasons.append("MBTI 互补：" + a["mbti"] + " × " + b["mbti"])
    if comps["zodiac"] >= 0.85:
        reasons.append("星座契合")
    return reasons


def _build_pair(a, b):
    score, comps = pair_score(a, b)
    return {
        "person_a": a,
        "person_b": b,
        "score": score,
        "reasons": _reasons(a, b, comps),
    }


def _apply_filters(persons, filters):
    if not filters:
        return persons
    ds = filters.get("dance_style")
    region = filters.get("region")
    gender = filters.get("gender")
    out = []
    for p in persons:
        if gender and p.get("gender") != gender:
            continue
        if region and p.get("region") != region:
            continue
        if ds and ds not in (p.get("dance_styles") or []):
            continue
        out.append(p)
    return out


# ---------------------------------------------------------------------------
# 匈牙利算法（Kuhn-Munkres）：求方阵上的最小代价完美匹配，O(n^3)
# ---------------------------------------------------------------------------
def _hungarian_square_min(a):
    n = len(a)
    u = [0.0] * (n + 1)
    v = [0.0] * (n + 1)
    p = [0] * (n + 1)
    way = [0] * (n + 1)
    INF = float("inf")
    for i in range(1, n + 1):
        p[0] = i
        j0 = 0
        minv = [INF] * (n + 1)
        used = [False] * (n + 1)
        while True:
            used[j0] = True
            i0 = p[j0]
            delta = INF
            j1 = 0
            for j in range(1, n + 1):
                if not used[j]:
                    cur = a[i0 - 1][j - 1] - u[i0] - v[j]
                    if cur < minv[j]:
                        minv[j] = cur
                        way[j] = j0
                    if minv[j] < delta:
                        delta = minv[j]
                        j1 = j
            for j in range(0, n + 1):
                if used[j]:
                    u[p[j]] += delta
                    v[j] -= delta
                else:
                    minv[j] -= delta
            j0 = j1
            if p[j0] == 0:
                break
        while True:
            j1 = way[j0]
            p[j0] = p[j1]
            j0 = j1
            if j0 == 0:
                break
    row_to_col = [0] * n
    for j in range(1, n + 1):
        if p[j] != 0:
            row_to_col[p[j] - 1] = j - 1
    return row_to_col, -v[0]


def _match_bipartite(males, females, min_score):
    """异性二分图：匈牙利算法求最大权匹配，返回 (pairs, unmatched)。"""
    n, m = len(males), len(females)
    if n == 0 or m == 0:
        return [], males + females

    weights = [
        [pair_score(males[i], females[j])[0] for j in range(m)]
        for i in range(n)
    ]

    N = max(n, m)
    cost = [[0.0] * N for _ in range(N)]
    for i in range(N):
        for j in range(N):
            if i < n and j < m:
                cost[i][j] = -weights[i][j] if weights[i][j] >= min_score else _FORBIDDEN
            else:
                cost[i][j] = 0.0  # 虚拟节点

    row_to_col, _ = _hungarian_square_min(cost)

    pairs = []
    matched_m = set()
    matched_f = set()
    for i in range(n):
        j = row_to_col[i]
        if j < m and weights[i][j] >= min_score:
            pairs.append(_build_pair(males[i], females[j]))
            matched_m.add(i)
            matched_f.add(j)

    unmatched = [males[i] for i in range(n) if i not in matched_m] + \
                [females[j] for j in range(m) if j not in matched_f]
    return pairs, unmatched


def _match_general(persons, min_score):
    """不限性别：一般图最大权匹配（networkx 的 Blossom 算法）。"""
    import networkx as nx

    n = len(persons)
    if n < 2:
        return [], list(persons)

    G = nx.Graph()
    G.add_nodes_from(range(n))
    for i in range(n):
        for j in range(i + 1, n):
            s, _ = pair_score(persons[i], persons[j])
            if s >= min_score:
                G.add_edge(i, j, weight=s)

    matching = nx.algorithms.matching.max_weight_matching(
        G, maxcardinality=True, weight="weight"
    )

    pairs = []
    matched = set()
    for i, j in matching:
        pairs.append(_build_pair(persons[i], persons[j]))
        matched.add(i)
        matched.add(j)
    unmatched = [persons[k] for k in range(n) if k not in matched]
    return pairs, unmatched


def _match_greedy(persons, gender_mode, min_score):
    """贪心配对（按分数从高到低）。"""
    n = len(persons)
    if n < 2:
        return {"pairs": [], "unmatched": list(persons)}

    candidates = []
    for i in range(n):
        for j in range(i + 1, n):
            a, b = persons[i], persons[j]
            if gender_mode == "opposite" and {a["gender"], b["gender"]} != {"male", "female"}:
                continue
            score, _ = pair_score(a, b)
            if score < min_score:
                continue
            candidates.append((score, i, j))

    candidates.sort(key=lambda x: -x[0])

    used = set()
    pairs = []
    for score, i, j in candidates:
        if i in used or j in used:
            continue
        used.add(i)
        used.add(j)
        pairs.append(_build_pair(persons[i], persons[j]))

    unmatched = [persons[i] for i in range(n) if i not in used]
    return {"pairs": pairs, "unmatched": unmatched}


def match_people(
    persons: List[Dict],
    gender_mode: str = "opposite",
    algorithm: str = "optimal",
    min_score: float = 0.0,
    filters: Optional[Dict] = None,
):
    """匹配入口。persons 为字典列表。

    gender_mode: "opposite" 异性优先 / "any" 不限性别
    algorithm:   "optimal" 全局最优 / "greedy" 贪心
    min_score:   最低匹配分（0~1，低于此分不配对）
    filters:     {"dance_style", "region", "gender"} 可选筛选
    """
    min_score = max(0.0, min(1.0, min_score or 0.0))
    persons = _apply_filters(list(persons), filters)

    if algorithm == "greedy":
        return _match_greedy(persons, gender_mode, min_score)

    if gender_mode == "opposite":
        males = [p for p in persons if p.get("gender") == "male"]
        females = [p for p in persons if p.get("gender") == "female"]
        pairs, unmatched = _match_bipartite(males, females, min_score)
        return {"pairs": pairs, "unmatched": unmatched}

    pairs, unmatched = _match_general(persons, min_score)
    return {"pairs": pairs, "unmatched": unmatched}
