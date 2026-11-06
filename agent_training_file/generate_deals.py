"""Generate a synthetic eval set for PayAgent: messy deal requests + ground-truth JSON.
Ground truth is computed in code (Total = P(1-d), Deposit = r*Total), never by an LLM.
Usage: python generate_deals.py  ->  deals.jsonl
"""
import json, random, re

random.seed(42)
N_TOTAL = 300
N_EDGE = 50  # invalid / needs_clarification rows

SERVICES = {
    "enterprise_ai_audit": ["enterprise AI audit", "AI audit for my company", "an AI readiness audit"],
    "brand_identity": ["brand identity design", "a full rebrand", "logo and brand guide"],
    "website_redesign": ["website redesign", "a new company website", "landing page rebuild"],
    "mobile_app_mvp": ["mobile app MVP", "an MVP for my app idea", "a small iOS/Android app"],
    "seo_audit": ["SEO audit", "a technical SEO review", "SEO audit + keyword plan"],
    "bi_dashboard": ["Power BI dashboard", "a sales dashboard in Tableau", "a data dashboard"],
    "social_media_mgmt": ["3 months of social media management", "social media content calendar", "Instagram + LinkedIn management"],
    "copywriting": ["copywriting package", "website copy and 4 blog posts", "email sequence copywriting"],
    "video_editing": ["video editing for my YouTube channel", "10 short-form video edits", "promo video editing"],
    "crm_setup": ["HubSpot CRM setup", "CRM setup and automation", "Zoho CRM configuration"],
    "market_research": ["market research report", "competitor analysis report", "customer research study"],
    "ecommerce_setup": ["Shopify store setup", "e-commerce store build", "online shop setup with payments"],
    "data_cleaning": ["data cleaning and analysis", "SQL database design", "spreadsheet cleanup and reporting"],
    "pitch_deck": ["investor pitch deck", "pitch deck design", "a 15-slide sales deck"],
}
WORDS = {5: "five", 10: "ten", 15: "fifteen", 20: "twenty", 25: "twenty-five", 30: "thirty", 40: "forty", 50: "fifty"}
OPENERS = ["hi, ", "hey ", "Hello! ", "", "", "quick one - ", "need help: ", "good afternoon, ", "yo ", "so basically "]
CLOSERS = ["", "", " can you do it?", " thanks!", " let me know", " pls send a quote", " ready to pay today", " asap if possible", "."]

def money(x):
    r = random.random()
    if x % 1000 == 0 and r < 0.15:
        return f"{x // 1000}k"
    if r < 0.45: return f"${x:,}"
    if r < 0.60: return f"${x}"
    if r < 0.75: return f"{x} USD"
    if r < 0.88: return f"{x} dollars"
    return f"USD {x:,}"

def pct(p):
    r = random.random()
    if p in WORDS and r < 0.2: return f"{WORDS[p]} percent"
    if r < 0.6: return f"{p}%"
    if r < 0.8: return f"{p} percent"
    return f"{p} %"

def price_clause(x):
    return random.choice([f"budget is {money(x)}", f"my budget: {money(x)}", f"I can spend {money(x)}",
                          f"base price {money(x)}", f"quoted at {money(x)}", f"around {money(x)} total",
                          f"{money(x)} is what I have"])

def disc_clause(p, v=None):
    return random.choice([f"with a {pct(p)} discount", f"{pct(p)} off", f"can you knock {pct(p)} off",
                          f"I was promised {pct(p)} off as a returning client", f"discount of {pct(p)} please",
                          f"take {pct(p)} off the price"])

def dep_clause_rate(p):
    return random.choice([f"{pct(p)} deposit upfront", f"{pct(p)} milestone deposit", f"put down {pct(p)} first",
                          f"{pct(p)} upfront, rest on delivery", f"deposit of {pct(p)}", f"pay {pct(p)} to start"])

def dep_clause_amt(a):
    return random.choice([f"a {money(a)} deposit", f"I'll pay {money(a)} upfront", f"deposit: {money(a)}"])

def ms_clause(n):
    words = {2: "two", 3: "three", 4: "four"}
    return random.choice([f"split the rest into {n} milestones", f"{words[n]} milestones for the balance",
                          f"{n} payments after the deposit"])

def typo(text):
    def mangle(m):
        w = m.group(0)
        if len(w) > 4 and random.random() < 0.25:
            i = random.randint(1, len(w) - 3)
            return random.choice([w[:i] + w[i + 1] + w[i] + w[i + 2:], w[:i] + w[i + 1:], w[:i] + w[i] + w[i:]])
        return w
    return re.sub(r"[A-Za-z]+", mangle, text)

def compose(service_text, clauses):
    random.shuffle(clauses)
    body = random.choice([", ", "; ", " - ", ". "]).join(clauses)
    text = f"{random.choice(OPENERS)}I need {service_text}: {body}{random.choice(CLOSERS)}"
    if random.random() < 0.2: text = text.lower()
    if random.random() < 0.25: text = typo(text)
    return text

def r2(x): return round(x + 1e-9, 2)

def expected(status, svc, P, d, r, dep_amt=None, ms=None, issue=None):
    total = deposit = remaining = None
    if P is not None and P > 0 and d is not None and 0 <= d < 1:
        total = r2(P * (1 - d))
        if dep_amt is not None:
            deposit = r2(dep_amt); r = round(deposit / total, 4)
        elif r is not None and 0 <= r <= 1:
            deposit = r2(r * total)
        if deposit is not None: remaining = r2(total - deposit)
    return {"status": status, "service_type": svc, "base_price": P, "discount_rate": d,
            "deposit_rate": r, "total": total, "deposit": deposit, "remaining": remaining,
            "milestones": ms, "issue": issue}

def pick_service():
    svc = random.choice(list(SERVICES)); return svc, random.choice(SERVICES[svc])

def price():
    return random.choice([random.randrange(150, 12001, 50), random.randrange(200, 3000, 10), 950, 1000, 2000, 5000])

def normal():
    svc, st = pick_service(); P = price()
    d = random.choice([5, 10, 12, 15, 20, 25, 30]); r = random.choice([20, 25, 30, 40, 50])
    cl = [price_clause(P)]; dd = d / 100
    if random.random() < 0.9: cl.append(disc_clause(d))
    else: dd = 0.0
    use_amt = random.random() < 0.15
    amt = None
    if use_amt:
        amt = round(P * (1 - dd) * r / 100); amt = max(amt, 1); cl.append(dep_clause_amt(amt))
    else: cl.append(dep_clause_rate(r))
    ms = random.choice([None, None, 2, 3, 4])
    if ms: cl.append(ms_clause(ms))
    return compose(st, cl), expected("ok", svc, P, dd, None if use_amt else r / 100, dep_amt=amt, ms=ms)

def edge(kind):
    svc, st = pick_service(); P = price(); d = random.choice([10, 15, 20]); r = random.choice([25, 30, 40, 50])
    if kind == "discount_over_100":
        bad = random.choice([100, 110, 120, 150])
        return compose(st, [price_clause(P), disc_clause(bad), dep_clause_rate(r)]), \
            expected("invalid", svc, P, None, r / 100, issue="invalid_discount")
    if kind == "deposit_over_100":
        bad = random.choice([110, 125, 150])
        return compose(st, [price_clause(P), disc_clause(d), dep_clause_rate(bad)]), \
            expected("invalid", svc, P, d / 100, None, issue="invalid_deposit")
    if kind == "nonpositive_price":
        bad = random.choice([0, -500, -100])
        return compose(st, [f"budget is ${bad}", disc_clause(d), dep_clause_rate(r)]), \
            expected("invalid", svc, bad, d / 100, r / 100, issue="invalid_price")
    if kind == "missing_price":
        return compose(st, [disc_clause(d), dep_clause_rate(r), "not sure on budget yet"]), \
            expected("needs_clarification", svc, None, d / 100, r / 100, issue="missing_price")
    if kind == "missing_deposit":
        return compose(st, [price_clause(P), disc_clause(d)]), \
            expected("needs_clarification", svc, P, d / 100, None, issue="missing_deposit")
    if kind == "self_correction":
        d2 = d + random.choice([5, 10])
        text = compose(st, [price_clause(P), f"{pct(d)} off... actually make it {pct(d2)} off", dep_clause_rate(r)])
        return text, expected("ok", svc, P, d2 / 100, r / 100, issue="self_correction_use_last_value")

EDGE_KINDS = ["discount_over_100", "deposit_over_100", "nonpositive_price", "missing_price", "missing_deposit", "self_correction"]

rows = []
for i in range(N_TOTAL - N_EDGE):
    p, e = normal(); rows.append({"prompt": p, "expected": e})
for i in range(N_EDGE):
    p, e = edge(EDGE_KINDS[i % len(EDGE_KINDS)]); rows.append({"prompt": p, "expected": e})
random.shuffle(rows)
with open("deals.jsonl", "w") as f:
    for i, row in enumerate(rows, 1):
        f.write(json.dumps({"id": f"deal_{i:03d}", **row}, ensure_ascii=False) + "\n")
print(f"wrote {len(rows)} rows to deals.jsonl")
