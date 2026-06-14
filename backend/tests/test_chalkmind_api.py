"""
ChalkMind backend API tests — covers auth, projects/chats CRUD, lessons,
checkpoint continue, clarify, audio transcribe (mocked) and guest mode.
"""
import os
import time
import random
import string
import pytest
import requests
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(Path(__file__).resolve().parents[2] / "frontend" / ".env")
BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")
API = f"{BASE_URL}/api"


def _rand_user():
    suffix = "".join(random.choices(string.ascii_lowercase + string.digits, k=8))
    return f"test_{suffix}"


def _guest_id():
    suffix = "".join(random.choices(string.ascii_lowercase + string.digits, k=14))
    return f"guest_{suffix}"


# ───────────── fixtures ─────────────
@pytest.fixture(scope="module")
def s():
    sess = requests.Session()
    sess.headers["Content-Type"] = "application/json"
    return sess


@pytest.fixture(scope="module")
def demo_token(s):
    r = s.post(f"{API}/auth/login", json={"username": "demo", "password": "demo123"})
    assert r.status_code == 200, f"demo seeded user login failed: {r.status_code} {r.text}"
    data = r.json()
    assert "token" in data and "user" in data
    assert data["user"]["username"] == "demo"
    return data["token"]


@pytest.fixture(scope="module")
def new_user(s):
    username = _rand_user()
    r = s.post(f"{API}/auth/register", json={
        "username": username, "password": "secret123", "displayName": "T1 Tester"
    })
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["user"]["username"] == username
    assert data["user"]["displayName"] == "T1 Tester"
    return {"username": username, "token": data["token"], "id": data["user"]["id"]}


# ───────────── health ─────────────
def test_health(s):
    r = s.get(f"{API}/health")
    assert r.status_code == 200
    assert r.json().get("status") == "ok"


# ───────────── auth ─────────────
class TestAuth:
    def test_register_validation_short_username(self, s):
        r = s.post(f"{API}/auth/register", json={"username": "ab", "password": "secret123"})
        assert r.status_code == 400

    def test_register_validation_short_password(self, s):
        r = s.post(f"{API}/auth/register", json={"username": _rand_user(), "password": "123"})
        assert r.status_code == 400

    def test_register_duplicate(self, s, new_user):
        r = s.post(f"{API}/auth/register", json={
            "username": new_user["username"], "password": "secret123"
        })
        assert r.status_code == 409

    def test_login_demo(self, demo_token):
        assert isinstance(demo_token, str) and len(demo_token) > 20

    def test_login_invalid(self, s):
        r = s.post(f"{API}/auth/login", json={"username": "demo", "password": "WRONG"})
        assert r.status_code == 401

    def test_me_requires_auth(self, s):
        r = s.get(f"{API}/auth/me")
        assert r.status_code == 401

    def test_me_with_token(self, s, demo_token):
        r = s.get(f"{API}/auth/me", headers={"Authorization": f"Bearer {demo_token}"})
        assert r.status_code == 200
        assert r.json()["user"]["username"] == "demo"


# ───────────── projects + chats (authenticated) ─────────────
class TestProjectsAuth:
    def _h(self, tok):
        return {"Authorization": f"Bearer {tok}", "Content-Type": "application/json"}

    def test_requires_context(self, s):
        r = s.get(f"{API}/projects")
        assert r.status_code == 400

    def test_create_list_delete(self, s, new_user):
        h = self._h(new_user["token"])
        r = s.post(f"{API}/projects", json={"name": "TEST_Proj"}, headers=h)
        assert r.status_code == 200, r.text
        proj = r.json()
        assert "id" in proj and proj["name"] == "TEST_Proj"
        pid = proj["id"]

        r2 = s.get(f"{API}/projects", headers=h)
        assert r2.status_code == 200
        assert any(p["id"] == pid for p in r2.json()["projects"])

        # delete
        rd = s.delete(f"{API}/projects/{pid}", headers=h)
        assert rd.status_code == 200
        assert rd.json()["success"] is True

        # confirm gone
        r3 = s.get(f"{API}/projects", headers=h)
        assert not any(p["id"] == pid for p in r3.json()["projects"])


# ───────────── full chat flow (guest mode) ─────────────
class TestGuestChatFlow:
    def test_full_flow(self, s):
        gid = _guest_id()
        gh = {"x-guest-id": gid, "Content-Type": "application/json"}

        # invalid guest id format
        bad = s.post(f"{API}/projects", json={"name": "x"},
                     headers={"x-guest-id": "bad!", "Content-Type": "application/json"})
        assert bad.status_code == 400

        # create project
        r = s.post(f"{API}/projects", json={"name": "TEST_Guest_Coll"}, headers=gh)
        assert r.status_code == 200, r.text
        pid = r.json()["id"]

        # create chat
        r = s.post(f"{API}/projects/{pid}/chats", json={"title": "New Chat"}, headers=gh)
        assert r.status_code == 200, r.text
        cid = r.json()["id"]

        # list chats
        r = s.get(f"{API}/projects/{pid}/chats", headers=gh)
        assert r.status_code == 200
        assert any(c["id"] == cid for c in r.json()["chats"])

        # send a message — triggers lesson generation (~1.1s)
        r = s.post(f"{API}/chats/{cid}/message",
                   json={"prompt": "Explain neural networks", "bloomLevel": "understand"},
                   headers=gh)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "title" in data and "newSegments" in data and "allSegments" in data
        assert len(data["newSegments"]) >= 5
        # last segment must be checkpoint
        assert data["newSegments"][-1]["type"] == "checkpoint"
        types = {s["type"] for s in data["newSegments"]}
        assert {"heading", "text", "checkpoint"}.issubset(types)

        # get chat
        r = s.get(f"{API}/chats/{cid}", headers=gh)
        assert r.status_code == 200
        chat = r.json()
        assert len(chat["segments"]) == len(data["allSegments"])
        # title got auto-updated from "New Chat"
        assert not chat["title"].lower().startswith("new chat")

        # cross-tenant access denied
        other_gid = _guest_id()
        r = s.get(f"{API}/chats/{cid}",
                  headers={"x-guest-id": other_gid})
        assert r.status_code == 403

        # delete chat
        r = s.delete(f"{API}/chats/{cid}", headers=gh)
        assert r.status_code == 200

        # delete project
        r = s.delete(f"{API}/projects/{pid}", headers=gh)
        assert r.status_code == 200


# ───────────── stateless lesson endpoints ─────────────
class TestLessonEndpoints:
    def test_lesson(self, s):
        gh = {"x-guest-id": _guest_id(), "Content-Type": "application/json"}
        r = s.post(f"{API}/lesson",
                   json={"prompt": "Pythagorean theorem", "bloomLevel": "apply"}, headers=gh)
        assert r.status_code == 200
        data = r.json()
        assert "title" in data and isinstance(data["segments"], list)
        assert any(seg["type"] == "checkpoint" for seg in data["segments"])

    def test_lesson_validation(self, s):
        gh = {"x-guest-id": _guest_id(), "Content-Type": "application/json"}
        r = s.post(f"{API}/lesson", json={"prompt": ""}, headers=gh)
        assert r.status_code == 400

    def test_lesson_continue(self, s):
        gh = {"x-guest-id": _guest_id(), "Content-Type": "application/json"}
        r = s.post(f"{API}/lesson/continue", json={
            "checkpointResult": {"isCorrect": True, "question": "test"},
            "bloomLevel": "understand"
        }, headers=gh)
        assert r.status_code == 200
        assert "segments" in r.json()

    def test_lesson_clarify(self, s):
        gh = {"x-guest-id": _guest_id(), "Content-Type": "application/json"}
        r = s.post(f"{API}/lesson/clarify",
                   json={"topic": "gradient descent", "bloomLevel": "understand"}, headers=gh)
        assert r.status_code == 200
        assert r.json()["title"] == "Seen Differently"


# ───────────── audio (mocked) ─────────────
def test_audio_transcribe_mock():
    gh = {"x-guest-id": _guest_id()}
    files = {"audio": ("a.wav", b"\x00" * 2000, "audio/wav")}
    r = requests.post(f"{API}/audio/transcribe", files=files, headers=gh)
    assert r.status_code == 200, r.text
    assert "text" in r.json() and len(r.json()["text"]) > 0
