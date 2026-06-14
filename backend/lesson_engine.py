"""
ChalkMind mock Teaching Agent.

Produces richly-structured, Bloom's-Taxonomy-aware visual lessons that match the
exact segment schema of the production Express/OpenAI backend
(server/src/schemas/lessonSchema.js). The real backend swaps this out for GPT-4o;
this deterministic engine lets the full UI render & be tested end-to-end here.

Segment types: heading | text | math | step_marker | diagram | graph |
network | table | checkpoint
"""
import hashlib
import math
import random
import re

BLOOM_LEVELS = ["remember", "understand", "apply", "analyze", "evaluate", "create"]

BLOOM_VERB = {
    "remember": "recall",
    "understand": "make sense of",
    "apply": "put into practice",
    "analyze": "break down",
    "evaluate": "weigh up",
    "create": "design with",
}


def _seed(prompt: str) -> random.Random:
    h = hashlib.sha256(prompt.lower().strip().encode()).hexdigest()
    return random.Random(int(h[:12], 16))


def _topic(prompt: str) -> str:
    p = re.sub(r"^(explain|teach me|what is|what are|how do(es)?|describe|tell me about|can you explain)\s+", "", prompt.strip(), flags=re.I)
    p = re.sub(r"[?.!]+$", "", p).strip()
    if not p:
        p = prompt.strip() or "this concept"
    words = p.split()
    return " ".join(words[:6])


def _title_case(s: str) -> str:
    small = {"of", "the", "a", "an", "in", "on", "and", "to", "for", "with"}
    out = []
    for i, w in enumerate(s.split()):
        out.append(w if (w.lower() in small and i) else (w[:1].upper() + w[1:]))
    return " ".join(out)


def _hook(rng, topic: str, bloom: str) -> str:
    verb = BLOOM_VERB.get(bloom, "make sense of")
    hooks = [
        f"Picture {topic} as a living system on the chalkboard — every part talks to every other part. Let's {verb} it together, piece by piece.",
        f"Forget dry definitions. {_title_case(topic)} is really a story about cause and effect, and once you see the shape of it, you can never un-see it.",
        f"Here is the quiet truth about {topic}: it looks complicated only until you draw it. So let's draw it, and {verb} how the pieces lock into place.",
        f"Most people memorise {topic}. We're going to do something better — we'll {verb} the underlying machinery so it becomes obvious.",
    ]
    return rng.choice(hooks)


def _diagram(rng, topic: str):
    labels = ["Input", "Transform", "Core", "Feedback", "Output"]
    colors = ["#000000", "#000000", "#000000"]
    elements = []
    xs = [60, 280, 500, 720]
    chosen = rng.sample(labels, 3)
    boxes = []
    for i, lab in enumerate(chosen):
        x = xs[i]
        elements.append({"shape": "rect", "x": x, "y": 220, "w": 170, "h": 90,
                         "label": lab, "color": "#000000", "fill": "#FFFFFF",
                         "r": None, "from": None, "to": None, "points": None,
                         "startAngle": None, "endAngle": None})
        boxes.append((x, 220, 170, 90))
    for i in range(len(boxes) - 1):
        x1 = boxes[i][0] + boxes[i][2]
        x2 = boxes[i + 1][0]
        elements.append({"shape": "arrow", "from": [x1, 265], "to": [x2, 265],
                         "label": rng.choice(["drives", "feeds", "maps to", "becomes"]),
                         "color": "#000000", "x": None, "y": None, "w": None, "h": None,
                         "r": None, "points": None, "startAngle": None, "endAngle": None})
    # a highlighting circle on the core
    cx = boxes[-1][0] + boxes[-1][2] // 2
    elements.append({"shape": "circle", "x": cx, "y": 130, "r": 36,
                     "label": "key", "color": "#000000", "fill": "#FAFF00",
                     "w": None, "h": None, "from": None, "to": None, "points": None,
                     "startAngle": None, "endAngle": None})
    elements.append({"shape": "arrow", "from": [cx, 166], "to": [cx, 218],
                     "label": None, "color": "#000000", "x": None, "y": None,
                     "w": None, "h": None, "r": None, "points": None,
                     "startAngle": None, "endAngle": None})
    return {"type": "diagram", "content": {"elements": elements}}


def _graph(rng):
    kind = rng.choice(["line", "bar", "area"])
    data = []
    base = rng.uniform(2, 6)
    for x in range(0, 11):
        y = base + math.sin(x / 1.7) * 3 + rng.uniform(-0.6, 0.6) + x * 0.25
        data.append({"x": x, "y": round(max(0, y), 2)})
    return {"type": "graph", "content": {
        "chartType": kind, "xLabel": "time", "yLabel": "magnitude",
        "data": data, "func": None}}


def _network(rng, topic: str):
    core = _title_case(_topic(topic)).split()[0][:10] or "Core"
    sats = rng.sample(
        ["Origin", "Rules", "Limits", "Example", "Proof", "Use-case", "Pitfall", "Variant"], 4)
    nodes = [{"id": "c", "label": core, "group": 0, "color": "#000000"}]
    edges = []
    for i, s in enumerate(sats):
        nid = f"n{i}"
        nodes.append({"id": nid, "label": s, "group": 1, "color": "#000000"})
        edges.append({"source": "c", "target": nid,
                      "label": rng.choice([None, "relates", "needs", "leads to"])})
    # cross link
    edges.append({"source": "n0", "target": "n2", "label": None})
    return {"type": "network", "content": {
        "nodes": nodes, "edges": edges, "layout": "force", "title": "Concept Map"}}


def _table(rng, topic: str):
    return {"type": "table", "content": {
        "headers": ["Aspect", "Naive view", "Expert view"],
        "rows": [
            ["Mental model", "A list of facts", "A connected system"],
            ["When it breaks", "Memorised, forgotten", "Reconstructed from logic"],
            ["Speed", "Slow recall", "Instant intuition"],
        ]}}


def _math(rng, topic: str):
    options = [
        ("f(x) = \\sum_{i=1}^{n} w_i \\cdot x_i + b", True),
        ("\\frac{\\partial L}{\\partial \\theta} = \\frac{1}{m}\\sum (\\hat{y}-y)\\,x", True),
        ("P(A \\mid B) = \\frac{P(B \\mid A)\\,P(A)}{P(B)}", True),
        ("E = mc^2 \\quad\\Rightarrow\\quad \\text{energy} \\propto \\text{mass}", True),
    ]
    latex, disp = rng.choice(options)
    return {"type": "math", "content": {"latex": latex, "display": disp}}


def _checkpoint(rng, topic: str, bloom: str):
    t = _title_case(_topic(topic))
    banks = {
        "remember": (f"Which statement best defines {t}?",
                     [f"{t} is a single isolated fact.",
                      f"{t} is a connected system whose parts influence each other.",
                      f"{t} only exists in textbooks.",
                      f"{t} cannot be visualised."], 1),
        "apply": (f"You meet a new problem involving {t}. What is the smartest first move?",
                  ["Memorise the final answer.",
                   "Identify which part of the system the inputs map onto, then trace the flow.",
                   "Guess randomly.",
                   "Skip straight to the conclusion."], 1),
        "analyze": (f"What most reliably reveals the structure of {t}?",
                    ["Reciting its definition.",
                     "Mapping how its components feed and constrain one another.",
                     "Counting how many words it has.",
                     "Ignoring the edge cases."], 1),
    }
    q, opts, idx = banks.get(bloom, banks["remember"])
    return {"type": "checkpoint", "content": {
        "question": q, "options": opts, "correctIndex": idx,
        "explanation": "The strongest understanding treats the concept as an "
                       "interconnected system you can reconstruct, not a fact to memorise."}}


def generate_lesson(prompt: str, bloom_level: str = "understand", conversation_history=None):
    rng = _seed(prompt + "|" + bloom_level + "|" + str(len(conversation_history or [])))
    topic = _topic(prompt)
    title = _title_case(topic)[:60]
    bloom = bloom_level if bloom_level in BLOOM_LEVELS else "understand"

    segments = [
        {"type": "heading", "content": {"text": title}},
        {"type": "text", "content": {"text": _hook(rng, topic, bloom)}},
        {"type": "step_marker", "content": {"text": "The Core Idea"}},
        _diagram(rng, topic),
        {"type": "text", "content": {"text":
            f"Read the board left to right: each block hands its result to the next. "
            f"That hand-off is the whole secret of {topic} — nothing is magic, "
            f"it's just a pipeline of small, honest transformations."}},
        {"type": "step_marker", "content": {"text": "Putting Numbers To It"}},
        _math(rng, topic),
        _graph(rng),
        {"type": "text", "content": {"text":
            "Notice the curve doesn't explode — it bends. Real systems trade growth for "
            "stability, and that bend is where the interesting behaviour lives."}},
        {"type": "step_marker", "content": {"text": "How It All Connects"}},
        _network(rng, topic),
        _table(rng, topic),
        _checkpoint(rng, topic, bloom),
    ]
    # trim variability a touch for higher bloom levels
    if bloom in ("evaluate", "create"):
        segments.insert(9, {"type": "text", "content": {"text":
            "At this level the goal flips: instead of consuming the model, you bend it. "
            "Ask what you'd remove, what you'd recombine, and what new thing it could become."}})

    return {"title": title, "segments": segments}


def continue_after_checkpoint(checkpoint_result: dict, bloom_level="understand", conversation_history=None):
    correct = checkpoint_result.get("isCorrect")
    skipped = checkpoint_result.get("skipped")
    question = checkpoint_result.get("question", "the last question")
    if skipped:
        prompt = f"continuation skip {question}"
        lead = "No problem — let's keep moving and quietly fill the gap."
    elif correct:
        prompt = f"advance harder {question}"
        lead = "Nailed it. Let's level up the difficulty a notch."
    else:
        prompt = f"reexplain different {question}"
        lead = "Let's try a completely different angle on that idea."
    lesson = generate_lesson(prompt, bloom_level, conversation_history)
    lesson["segments"].insert(0, {"type": "text", "content": {"text": lead}})
    lesson["title"] = ("Next Up" if (correct or skipped) else "Another Way In")
    return lesson


def clarify(topic: str, bloom_level="understand", conversation_history=None):
    lesson = generate_lesson(f"different analogy {topic}", bloom_level, conversation_history)
    lesson["title"] = "Seen Differently"
    lesson["segments"].insert(0, {"type": "text", "content": {"text":
        "Same destination, new road. Here's another way to picture it."}})
    return lesson
