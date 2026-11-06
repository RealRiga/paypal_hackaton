"""Score PayAgent against deals.jsonl.
predictions.jsonl: one JSON per line, {"id": "deal_001", "status": ..., "base_price": ..., "discount_rate": ...,
"deposit_rate": ..., "total": ..., "deposit": ..., "remaining": ..., "service_type": ...}
Usage: python eval_deals.py deals.jsonl predictions.jsonl
"""
import json, sys
from collections import defaultdict

def load(p): return {json.loads(l)["id"]: json.loads(l) for l in open(p) if l.strip()}
def close(a, b, tol):
    if a is None or b is None: return a is b
    return abs(a - b) <= tol

truth, preds = load(sys.argv[1]), load(sys.argv[2])
fields = {"status": None, "service_type": None, "base_price": 0.01, "discount_rate": 0.001,
          "deposit_rate": 0.001, "total": 0.01, "deposit": 0.01, "remaining": 0.01}
hits, seen = defaultdict(int), defaultdict(int)
math_ok = math_n = guard_ok = guard_n = 0
for id_, t in truth.items():
    e, p = t["expected"], preds.get(id_, {})
    for f, tol in fields.items():
        seen[f] += 1
        hits[f] += (e[f] == p.get(f)) if tol is None else close(e[f], p.get(f), tol)
    if e["status"] == "ok":
        math_n += 1
        math_ok += close(e["total"], p.get("total"), 0.01) and close(e["deposit"], p.get("deposit"), 0.01) and close(e["remaining"], p.get("remaining"), 0.01)
    else:
        guard_n += 1
        guard_ok += p.get("status") == e["status"]
print(f"Rows: {len(truth)} | predictions found: {len(set(truth) & set(preds))}")
for f in fields: print(f"{f:15s} {hits[f] / seen[f]:.1%}")
print(f"\nMath correctness (valid deals):        {math_ok}/{math_n} = {math_ok / max(math_n, 1):.1%}")
print(f"Guardrail catch rate (bad/ambiguous):  {guard_ok}/{guard_n} = {guard_ok / max(guard_n, 1):.1%}")
