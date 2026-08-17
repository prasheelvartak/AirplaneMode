"""
Telegram Mobile Remote Bridge for AirplaneMode
Allows remote prompts, code updates, git pushes, and Vercel deployments directly from your phone.
"""

import os
import sys
import time
import json
import subprocess
import requests

# --------------------------------------------------------------------------
# Configuration & Auto-load .env
# --------------------------------------------------------------------------
WORKSPACE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENV_FILE = os.path.join(WORKSPACE_DIR, ".env")

if os.path.exists(ENV_FILE):
    with open(ENV_FILE, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))

# Replace with your Telegram Bot Token from @BotFather
TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "YOUR_TELEGRAM_BOT_TOKEN_HERE")

# Optional: Set your Telegram Chat ID to restrict commands to only your phone
ALLOWED_CHAT_ID = os.environ.get("TELEGRAM_ALLOWED_CHAT_ID", None)

# Gemini API Key for autonomous code edits from phone prompts
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", None)

REPO_URL = "https://github.com/prasheelvartak/AirplaneMode.git"
VERCEL_URL = "https://airplane-mode.vercel.app"

API_BASE = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}"


def send_message(chat_id, text, parse_mode="Markdown"):
    """Send a message back to the user on Telegram."""
    url = f"{API_BASE}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": parse_mode
    }
    try:
        res = requests.post(url, json=payload, timeout=10)
        return res.json()
    except Exception as e:
        print(f"Error sending message: {e}")
        return None


def run_git_cmd(args):
    """Run a git command in the workspace directory."""
    git_paths = [
        r"C:\Program Files\Git\cmd\git.exe",
        "git"
    ]
    git_exe = "git"
    for p in git_paths:
        if os.path.exists(p):
            git_exe = p
            break

    cmd = [git_exe] + args
    res = subprocess.run(cmd, cwd=WORKSPACE_DIR, capture_output=True, text=True, timeout=30)
    return res.returncode, res.stdout.strip(), res.stderr.strip()


def handle_status_command(chat_id):
    """Return repository and deployment status."""
    code, out, err = run_git_cmd(["status", "--short"])
    _, log_out, _ = run_git_cmd(["log", "-1", "--oneline"])
    
    status_text = "🟢 Clean (All changes synced)" if not out else f"🟡 Uncommitted changes:\n`{out}`"
    msg = (
        f"✈️ *AirplaneMode Status*\n\n"
        f"📍 *Latest Commit:* `{log_out}`\n"
        f"📂 *Working Tree:* {status_text}\n"
        f"🌐 *Live Webapp:* {VERCEL_URL}\n"
        f"🔗 *GitHub Repo:* {REPO_URL}"
    )
    send_message(chat_id, msg)


def handle_push_command(chat_id, commit_msg="Mobile update via Telegram"):
    """Commit all local changes and push to GitHub (triggers Vercel deploy)."""
    send_message(chat_id, "⏳ Staging files, committing, and pushing to GitHub...")
    run_git_cmd(["add", "."])
    code, out, err = run_git_cmd(["commit", "-m", commit_msg])
    
    if code != 0 and "nothing to commit" in (out + err).lower():
        send_message(chat_id, "ℹ️ No changes to commit. Pushing latest main branch...")
    
    p_code, p_out, p_err = run_git_cmd(["push", "origin", "main"])
    if p_code == 0:
        send_message(
            chat_id,
            f"✅ *Pushed to GitHub successfully!*\n\n"
            f"🚀 Vercel is deploying the latest update.\n"
            f"🌐 Live in ~10 seconds at: {VERCEL_URL}"
        )
    else:
        send_message(chat_id, f"❌ Push failed:\n`{p_err or p_out}`")


def handle_ai_prompt(chat_id, prompt):
    """Process an AI instruction with Gemini and apply changes to codebase."""
    if not GEMINI_API_KEY:
        send_message(
            chat_id,
            "💡 *Prompt received!* To enable autonomous AI code generation directly from Telegram, set `GEMINI_API_KEY`.\n\n"
            "You can also use quick commands like `/push [msg]` or `/status`."
        )
        return

    send_message(chat_id, f"🧠 *Processing prompt with Gemini...*\n_{prompt}_")

    # Call Gemini API to modify files
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"
    
    # Read core app files
    index_html = ""
    main_css = ""
    with open(os.path.join(WORKSPACE_DIR, "index.html"), "r", encoding="utf-8") as f:
        index_html = f.read()
    with open(os.path.join(WORKSPACE_DIR, "styles", "main.css"), "r", encoding="utf-8") as f:
        main_css = f.read()

    system_instruction = (
        "You are an AI coding assistant. The user wants to update their AirplaneMode flight tracking web app. "
        "Return a valid JSON object with the files that need updating: {\"files\": [{\"path\": \"relative/path\", \"content\": \"full updated content\"}], \"summary\": \"description of change\"}."
    )
    
    req_body = {
        "contents": [
            {
                "parts": [
                    {"text": f"System: {system_instruction}\n\nTask: {prompt}\n\nCurrent index.html:\n{index_html[:4000]}...\n\nCurrent main.css:\n{main_css[:4000]}..."}
                ]
            }
        ],
        "generationConfig": {
            "responseMimeType": "application/json"
        }
    }

    try:
        res = requests.post(url, json=req_body, timeout=45)
        res_data = res.json()
        raw_text = res_data["candidates"][0]["content"]["parts"][0]["text"]
        result = json.loads(raw_text)

        summary = result.get("summary", "Updated files based on prompt")
        files = result.get("files", [])
        
        for file_info in files:
            target_path = os.path.join(WORKSPACE_DIR, file_info["path"])
            with open(target_path, "w", encoding="utf-8") as f:
                f.write(file_info["content"])

        # Auto commit and push
        handle_push_command(chat_id, f"Mobile Prompt: {prompt[:50]}")
        send_message(chat_id, f"🎉 *Change completed:* {summary}")
    except Exception as e:
        send_message(chat_id, f"⚠️ Error processing AI prompt: `{e}`")


def handle_message(message):
    """Route incoming Telegram messages."""
    chat_id = message["chat"]["id"]
    text = message.get("text", "").strip()

    # Security check if set
    if ALLOWED_CHAT_ID and str(chat_id) != str(ALLOWED_CHAT_ID):
        send_message(chat_id, "⛔ Unauthorized. This bot is private to the repository owner.")
        return

    print(f"[{time.strftime('%X')}] Message from {chat_id}: {text}")

    if text.startswith("/start") or text.startswith("/help"):
        help_msg = (
            "✈️ *Welcome to AirplaneMode Mobile Bridge!*\n\n"
            "You can iterate on your web app directly from Telegram on your phone:\n\n"
            "📌 *Commands:*\n"
            "• `/status` - Check git status & Vercel deployment\n"
            "• `/push <message>` - Commit & push changes to trigger Vercel build\n"
            "• `/help` - Show this menu\n\n"
            "💬 *Plain Text Prompts:*\n"
            "Type any prompt (e.g. _'Add a dark blue gradient to the header'_ or _'Add JFK to demo routes'_) to execute code updates on the go!"
        )
        send_message(chat_id, help_msg)

    elif text.startswith("/status"):
        handle_status_command(chat_id)

    elif text.startswith("/push"):
        commit_msg = text.replace("/push", "").strip() or "Mobile update via Telegram"
        handle_push_command(chat_id, commit_msg)

    else:
        handle_ai_prompt(chat_id, text)


def poll_updates():
    """Long polling loop for incoming Telegram messages."""
    print("=" * 60)
    print("✈️ AirplaneMode Telegram Bridge Active")
    print(f"📁 Workspace: {WORKSPACE_DIR}")
    print("=" * 60)
    
    if TELEGRAM_BOT_TOKEN == "YOUR_TELEGRAM_BOT_TOKEN_HERE":
        print("\n❌ Error: Please set your TELEGRAM_BOT_TOKEN in telegram_bridge.py")
        print("👉 Message @BotFather on Telegram, type /newbot, and paste the token.\n")
        return

    last_update_id = 0
    while True:
        try:
            url = f"{API_BASE}/getUpdates?offset={last_update_id + 1}&timeout=30"
            res = requests.get(url, timeout=35)
            if res.status_code == 200:
                data = res.json()
                for update in data.get("result", []):
                    last_update_id = update["update_id"]
                    if "message" in update:
                        handle_message(update["message"])
            else:
                time.sleep(2)
        except Exception as e:
            print(f"Polling error: {e}")
            time.sleep(3)


if __name__ == "__main__":
    poll_updates()
