"""
ChalkMind backend — mirrors the production Express/Node.js API contract
(github.com/LordeSid-04/Educational-Agent) so the React frontend works
end-to-end in this environment. The Teaching Agent uses a deterministic
mock lesson engine (the production backend uses GPT-4o structured outputs).
"""
import os
import re
import uuid
import asyncio
import logging
from pathlib import Path
from datetime import datetime, timezone, timedelta
from typing import List, Optional

import jwt
import bcrypt
from dotenv import load_dotenv
from fastapi import FastAPI, APIRouter, Depends, Header, HTTPException, UploadFile, File
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field

import lesson_engine

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

JWT_SECRET = os.environ.get("JWT_SECRET", "chalkmind-dev-secret-change-in-production")
JWT_ALG = "HS256"
JWT_EXPIRY_DAYS = 7

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("chalkmind")

app = FastAPI(title="ChalkMind API")
api = APIRouter(prefix="/api")

GUEST_RE = re.compile(r"^guest_[a-z0-9]{10,50}$", re.I)


# ───────────────────────── helpers ─────────────────────────
def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()


def verify_password(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode(), hashed.encode())
    except Exception:
        return False


def make_token(user: dict) -> str:
    payload = {
        "userId": user["id"],
        "username": user["username"],
        "exp": datetime.now(timezone.utc) + timedelta(days=JWT_EXPIRY_DAYS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)


def public_user(u: dict) -> dict:
    return {"id": u["id"], "username": u["username"], "displayName": u.get("display_name") or u["username"]}


class Ctx(BaseModel):
    user_id: Optional[str] = None
    guest_id: Optional[str] = None

    @property
    def valid(self) -> bool:
        return bool(self.user_id or self.guest_id)


async def optional_auth(
    authorization: Optional[str] = Header(None),
    x_guest_id: Optional[str] = Header(None),
) -> Ctx:
    if authorization and authorization.startswith("Bearer "):
        token = authorization[7:]
        try:
            decoded = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
            return Ctx(user_id=decoded.get("userId"))
        except jwt.PyJWTError:
            pass
    if x_guest_id:
        if not GUEST_RE.match(x_guest_id):
            raise HTTPException(status_code=400, detail="Invalid Guest ID format")
        return Ctx(guest_id=x_guest_id)
    return Ctx()


async def require_auth(authorization: Optional[str] = Header(None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authentication required")
    try:
        decoded = jwt.decode(authorization[7:], JWT_SECRET, algorithms=[JWT_ALG])
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return decoded


def owner_filter(ctx: Ctx) -> dict:
    if ctx.user_id:
        return {"user_id": ctx.user_id}
    return {"user_id": None, "guest_id": ctx.guest_id}


# ───────────────────────── models ─────────────────────────
class RegisterBody(BaseModel):
    username: str
    password: str
    displayName: Optional[str] = None


class LoginBody(BaseModel):
    username: str
    password: str


class ProjectBody(BaseModel):
    name: str


class ChatBody(BaseModel):
    title: str


class MessageBody(BaseModel):
    prompt: str
    bloomLevel: Optional[str] = "understand"


class LessonBody(BaseModel):
    prompt: str
    conversationHistory: Optional[list] = []
    bloomLevel: Optional[str] = "understand"


class ContinueBody(BaseModel):
    checkpointResult: dict
    conversationHistory: Optional[list] = []
    bloomLevel: Optional[str] = "understand"


class ClarifyBody(BaseModel):
    topic: str
    conversationHistory: Optional[list] = []
    bloomLevel: Optional[str] = "understand"


# ───────────────────────── auth ─────────────────────────
@api.get("/health")
async def health():
    return {"status": "ok", "message": "ChalkMind Server Running", "version": "2.0.0"}


@api.post("/auth/register")
async def register(body: RegisterBody):
    username = body.username.strip()
    if len(username) < 3 or len(username) > 30:
        raise HTTPException(status_code=400, detail="Username must be 3-30 characters")
    if len(body.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    if await db.users.find_one({"username": username}):
        raise HTTPException(status_code=409, detail="Username already taken")
    user = {
        "id": uuid.uuid4().hex,
        "username": username,
        "password_hash": hash_password(body.password),
        "display_name": (body.displayName or username).strip(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.users.insert_one(user)
    return {"token": make_token(user), "user": public_user(user)}


@api.post("/auth/login")
async def login(body: LoginBody):
    user = await db.users.find_one({"username": body.username.strip()})
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"token": make_token(user), "user": public_user(user)}


@api.get("/auth/me")
async def me(decoded: dict = Depends(require_auth)):
    user = await db.users.find_one({"id": decoded["userId"]})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"user": public_user(user)}


# ───────────────────────── projects ─────────────────────────
@api.get("/projects")
async def list_projects(ctx: Ctx = Depends(optional_auth)):
    if not ctx.valid:
        raise HTTPException(status_code=400, detail="Session context (User or Guest ID) is required")
    cursor = db.projects.find(owner_filter(ctx), {"_id": 0}).sort("created_at", -1)
    projects = await cursor.to_list(500)
    return {"projects": projects}


@api.post("/projects")
async def create_project(body: ProjectBody, ctx: Ctx = Depends(optional_auth)):
    if not body.name or not body.name.strip():
        raise HTTPException(status_code=400, detail="Project name is required")
    if not ctx.valid:
        raise HTTPException(status_code=400, detail="Session context (User or Guest ID) is required")
    doc = {
        "id": uuid.uuid4().hex,
        "user_id": ctx.user_id,
        "guest_id": None if ctx.user_id else ctx.guest_id,
        "name": body.name.strip(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.projects.insert_one(doc)
    return {"id": doc["id"], "name": doc["name"]}


@api.delete("/projects/{project_id}")
async def delete_project(project_id: str, ctx: Ctx = Depends(optional_auth)):
    if not ctx.valid:
        raise HTTPException(status_code=400, detail="Session context (User or Guest ID) is required")
    res = await db.projects.delete_one({"id": project_id, **owner_filter(ctx)})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found or not authorized")
    await db.chats.delete_many({"project_id": project_id})
    return {"success": True}


async def _owns_project(project_id: str, ctx: Ctx) -> bool:
    return await db.projects.find_one({"id": project_id, **owner_filter(ctx)}) is not None


@api.get("/projects/{project_id}/chats")
async def list_chats(project_id: str, ctx: Ctx = Depends(optional_auth)):
    if not ctx.valid:
        raise HTTPException(status_code=400, detail="Session context (User or Guest ID) is required")
    if not await _owns_project(project_id, ctx):
        raise HTTPException(status_code=403, detail="Not authorized to access this project")
    cursor = db.chats.find({"project_id": project_id},
                           {"_id": 0, "segments": 0, "messages": 0}).sort("updated_at", -1)
    chats = await cursor.to_list(500)
    return {"chats": chats}


@api.post("/projects/{project_id}/chats")
async def create_chat(project_id: str, body: ChatBody, ctx: Ctx = Depends(optional_auth)):
    if not body.title or not body.title.strip():
        raise HTTPException(status_code=400, detail="Chat title is required")
    if not ctx.valid:
        raise HTTPException(status_code=400, detail="Session context (User or Guest ID) is required")
    if not await _owns_project(project_id, ctx):
        raise HTTPException(status_code=403, detail="Not authorized to modify this project")
    now = datetime.now(timezone.utc).isoformat()
    doc = {
        "id": uuid.uuid4().hex,
        "project_id": project_id,
        "title": body.title.strip(),
        "bloom_level": "understand",
        "segments": [],
        "messages": [],
        "created_at": now,
        "updated_at": now,
    }
    await db.chats.insert_one(doc)
    return {"id": doc["id"], "project_id": project_id, "title": doc["title"],
            "segments": [], "bloom_level": "understand"}


@api.get("/chats/{chat_id}")
async def get_chat(chat_id: str, ctx: Ctx = Depends(optional_auth)):
    if not ctx.valid:
        raise HTTPException(status_code=400, detail="Session context (User or Guest ID) is required")
    chat = await db.chats.find_one({"id": chat_id}, {"_id": 0})
    if not chat or not await _owns_project(chat["project_id"], ctx):
        raise HTTPException(status_code=403, detail="Chat not found or not authorized")
    return chat


@api.delete("/chats/{chat_id}")
async def delete_chat(chat_id: str, ctx: Ctx = Depends(optional_auth)):
    if not ctx.valid:
        raise HTTPException(status_code=400, detail="Session context (User or Guest ID) is required")
    chat = await db.chats.find_one({"id": chat_id})
    if not chat or not await _owns_project(chat["project_id"], ctx):
        raise HTTPException(status_code=403, detail="Chat not found or not authorized")
    await db.chats.delete_one({"id": chat_id})
    return {"success": True}


@api.post("/chats/{chat_id}/message")
async def chat_message(chat_id: str, body: MessageBody, ctx: Ctx = Depends(optional_auth)):
    if not body.prompt or not body.prompt.strip():
        raise HTTPException(status_code=400, detail="Message content is required")
    if not ctx.valid:
        raise HTTPException(status_code=400, detail="Session context (User or Guest ID) is required")
    chat = await db.chats.find_one({"id": chat_id}, {"_id": 0})
    if not chat or not await _owns_project(chat["project_id"], ctx):
        raise HTTPException(status_code=403, detail="Chat not found or not authorized")

    history = chat.get("messages", [])
    conv = [{"role": h["role"], "content": h["content"]} for h in history]
    bloom = body.bloomLevel or chat.get("bloom_level") or "understand"

    await asyncio.sleep(1.1)  # simulate the agent "thinking"
    lesson = lesson_engine.generate_lesson(body.prompt.strip(), bloom, conv)

    turn_index = len(conv) // 2
    new_segments = [{**seg, "turnIndex": turn_index} for seg in lesson["segments"]]
    all_segments = chat.get("segments", []) + new_segments

    new_messages = [
        {"role": "user", "content": body.prompt.strip()},
        {"role": "ai", "content": lesson["title"]},
    ]
    title = chat["title"]
    low = title.lower()
    if low.startswith("new chat") or low.startswith("untitled"):
        title = lesson["title"][:50]

    await db.chats.update_one({"id": chat_id}, {"$set": {
        "segments": all_segments,
        "messages": history + new_messages,
        "bloom_level": bloom,
        "title": title,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }})

    return {"title": title, "bloom_level": bloom, "newMessages": new_messages,
            "newSegments": new_segments, "allSegments": all_segments}


# ───────────────────────── lesson (stateless) ─────────────────────────
@api.post("/lesson")
async def lesson(body: LessonBody, ctx: Ctx = Depends(optional_auth)):
    if not body.prompt:
        raise HTTPException(status_code=400, detail="A prompt string is required")
    if len(body.prompt) > 2000:
        raise HTTPException(status_code=400, detail="Prompt must be under 2000 characters")
    await asyncio.sleep(1.1)
    return lesson_engine.generate_lesson(body.prompt, body.bloomLevel or "understand", body.conversationHistory)


@api.post("/lesson/continue")
async def lesson_continue(body: ContinueBody, ctx: Ctx = Depends(optional_auth)):
    if not body.checkpointResult:
        raise HTTPException(status_code=400, detail="checkpointResult is required")
    await asyncio.sleep(0.9)
    return lesson_engine.continue_after_checkpoint(
        body.checkpointResult, body.bloomLevel or "understand", body.conversationHistory)


@api.post("/lesson/clarify")
async def lesson_clarify(body: ClarifyBody, ctx: Ctx = Depends(optional_auth)):
    if not body.topic:
        raise HTTPException(status_code=400, detail="topic is required")
    await asyncio.sleep(0.9)
    return lesson_engine.clarify(body.topic, body.bloomLevel or "understand", body.conversationHistory)


# ───────────────────────── audio (MOCKED) ─────────────────────────
@api.post("/audio/transcribe")
async def transcribe(audio: UploadFile = File(...), ctx: Ctx = Depends(optional_auth)):
    """MOCKED: production backend uses OpenAI Whisper. Returns a canned transcript."""
    data = await audio.read()
    await asyncio.sleep(0.6)
    samples = [
        "Explain how neural networks learn from data.",
        "Walk me through the Pythagorean theorem with a diagram.",
        "What is the difference between supervised and unsupervised learning?",
        "Teach me about photosynthesis step by step.",
    ]
    idx = (len(data) // 1000) % len(samples)
    return {"text": samples[idx]}


app.include_router(api)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def seed():
    demo = await db.users.find_one({"username": "demo"})
    if not demo:
        user = {
            "id": uuid.uuid4().hex,
            "username": "demo",
            "password_hash": hash_password("demo123"),
            "display_name": "Demo Student",
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.users.insert_one(user)
        logger.info("Seeded demo user")


@app.on_event("shutdown")
async def shutdown():
    client.close()
