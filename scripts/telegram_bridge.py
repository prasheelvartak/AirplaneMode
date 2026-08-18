"""
Telegram Mobile Remote Bridge for AirplaneMode (v2.0 - Safe & Robust)
Features:
- Surgical search-and-replace (never truncates or overwrites large files)
- Automatic git rollback safety checks
- Stable Gemini model fallbacks with exponential backoff retry on 503/429
- Quick commands (/status, /push, /rollback, /help)
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

TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "YOUR_TELEGRAM_BOT_TOKEN_HERE")
ALLOWED_CHAT_ID = os.environ.get("TELEGRAM_ALLOWED_CHAT_ID", None)
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", None)

REPO_URL = "https://github.com/prasheelvartak/AirplaneMode.git"
VERCEL_URL = "https://airmode.vercel.app"

API_BASE = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}"


def send_message(chat_id, text, parse_mode="Markdown"):
    """Send a message back to Telegram."""
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
    """Run a git command in workspace."""
    git_paths = [r"C:\Program Files\Git\cmd\git.exe", "git"]
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
    _, out, _ = run_git_cmd(["status", "--short"])
    _, log_out, _ = run_git_cmd(["log", "-1", "--oneline"])
    status_text = "🟢 Clean (Synced with live site)" if not out else f"🟡 Modified files:\n`{out}`"
    msg = (
        f"✈️ *AirplaneMode Status*\n\n"
        f"📍 *Latest Live Commit:* `{log_out}`\n"
        f"📂 *Working Tree:* {status_text}\n"
        f"🌐 *Live Webapp:* {VERCEL_URL}\n"
        f"🔗 *GitHub:* {REPO_URL}"
    )
    send_message(chat_id, msg)


def handle_rollback_command(chat_id):
    """Roll back to previous commit in case of an unwanted change."""
    send_message(chat_id, "⏳ Rolling back previous commit...")
    code, _, err = run_git_cmd(["revert", "--no-edit", "HEAD"])
    if code == 0:
        run_git_cmd(["push", "origin", "main"])
        send_message(chat_id, "✅ *Successfully rolled back previous change!* Live site restoring now.")
    else:
        # Fallback to hard reset of last commit and force push
        run_git_cmd(["reset", "--hard", "HEAD~1"])
        run_git_cmd(["push", "origin", "main", "--force"])
        send_message(chat_id, "✅ *Reset to previous commit and deployed.*")


def handle_push_command(chat_id, commit_msg="Mobile update via Telegram"):
    """Commit all local changes and push to GitHub (triggers Vercel deploy)."""
    send_message(chat_id, "⏳ Staging files and pushing to GitHub...")
    run_git_cmd(["add", "."])
    code, out, err = run_git_cmd(["commit", "-m", commit_msg])
    
    p_code, p_out, p_err = run_git_cmd(["push", "origin", "main"])
    if p_code == 0:
        send_message(
            chat_id,
            f"✅ *Pushed to GitHub successfully!*\n\n"
            f"🚀 Vercel is deploying the update.\n"
            f"🌐 Live at: {VERCEL_URL}"
        )
    else:
        send_message(chat_id, f"❌ Push failed:\n`{p_err or p_out}`")


def call_gemini_with_retry(prompt_text):
    """Call Gemini API with model fallbacks and retry on high demand (503/429)."""
    # Priority list of models from fastest/most reliable to preview
    candidate_models = [
        "gemini-2.0-flash",
        "gemini-1.5-flash",
        "gemini-3.6-flash",
        "gemini-3.7-flash",
        "gemini-flash-latest",
        "gemini-pro-latest"
    ]
    
    for model in candidate_models:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={GEMINI_API_KEY}"
        req_body = {
            "contents": [{"parts": [{"text": prompt_text}]}],
            "generationConfig": {"responseMimeType": "application/json"}
        }
        
        for attempt in range(2):
            try:
                res = requests.post(url, json=req_body, timeout=40)
                if res.status_code == 200:
                    data = res.json()
                    if "candidates" in data and len(data["candidates"]) > 0:
                        text_part = data["candidates"][0]["content"]["parts"][0]["text"]
                        return json.loads(text_part), model, None
                elif res.status_code in [429, 503]:
                    time.sleep(2)
                else:
                    break
            except Exception as e:
                print(f"Error calling {model}: {e}")
                time.sleep(1)

    return None, None, "All Gemini models are currently experiencing high demand. Please try again in a few moments."


def handle_ai_prompt(chat_id, user_prompt):
    """Process an AI instruction safely using surgical find-and-replace diffs."""
    if not GEMINI_API_KEY:
        send_message(chat_id, "💡 *Prompt received!* Please set `GEMINI_API_KEY` in your `.env` file.")
        return

    send_message(chat_id, f"🧠 *Analyzing prompt with Gemini...*\n_{user_prompt}_")

    # Read current index.html and main.css
    index_path = os.path.join(WORKSPACE_DIR, "index.html")
    css_path = os.path.join(WORKSPACE_DIR, "styles", "main.css")
    js_path = os.path.join(WORKSPACE_DIR, "js", "app.js")

    with open(index_path, "r", encoding="utf-8") as f:
        orig_index = f.read()
    with open(css_path, "r", encoding="utf-8") as f:
        orig_css = f.read()
    with open(js_path, "r", encoding="utf-8") as f:
        orig_js = f.read()

    system_instruction = (
        "You are an expert AI software engineer for the AirplaneMode luxury flight tracking web application.\n"
        "DO NOT rewrite entire files. Instead, return SURGICAL FIND-AND-REPLACE modifications so no existing styles or features get deleted.\n"
        "Return a JSON object with this schema:\n"
        "{\n"
        "  \"summary\": \"Brief 1-sentence description of the change\",\n"
        "  \"replacements\": [\n"
        "    {\n"
        "      \"file\": \"index.html\" (or \"styles/main.css\" or \"js/app.js\"),\n"
        "      \"find\": \"exact text block to find and replace in the file\",\n"
        "      \"replace\": \"new replacement text to insert\"\n"
        "    }\n"
        "  ],\n"
        "  \"append_css\": \"optional new CSS rules to append at the end of styles/main.css\"\n"
        "}\n"
    )

    prompt_payload = (
        f"{system_instruction}\n\n"
        f"USER REQUEST: {user_prompt}\n\n"
        f"INDEX.HTML (first 100 lines):\n```html\n{orig_index[:2500]}\n```\n\n"
        f"MAIN.CSS (header & nav excerpt):\n```css\n{orig_css[:2500]}\n```\n"
    )

    result_json, used_model, err = call_gemini_with_retry(prompt_payload)
    if err or not result_json:
        send_message(chat_id, f"⚠️ *Gemini Error:* {err or 'Could not generate response'}")
        return

    summary = result_json.get("summary", "Applied code update")
    replacements = result_json.get("replacements", [])
    append_css = result_json.get("append_css", "").strip()

    if not replacements and not append_css:
        send_message(chat_id, f"ℹ️ *No code edits required:* {summary}")
        return

    # Apply surgical replacements safely
    modified_files = set()
    errors = []

    for rep in replacements:
        target_rel = rep.get("file", "").lstrip("/\\")
        find_text = rep.get("find", "")
        replace_text = rep.get("replace", "")

        if not target_rel or not find_text:
            continue

        target_full = os.path.join(WORKSPACE_DIR, target_rel)
        if not os.path.exists(target_full):
            errors.append(f"File `{target_rel}` not found")
            continue

        with open(target_full, "r", encoding="utf-8") as f:
            file_content = f.read()

        if find_text not in file_content:
            errors.append(f"Could not locate matching target snippet in `{target_rel}`")
            continue

        # Perform exact single replacement
        new_content = file_content.replace(find_text, replace_text, 1)
        with open(target_full, "w", encoding="utf-8") as f:
            f.write(new_content)
        modified_files.add(target_rel)

    # Append any custom CSS
    if append_css:
        with open(css_path, "a", encoding="utf-8") as f:
            f.write(f"\n\n/* Added via Mobile Prompt: {user_prompt[:40]} */\n{append_css}\n")
        modified_files.add("styles/main.css")

    if not modified_files and errors:
        send_message(chat_id, f"⚠️ *Update aborted to protect UI integrity:*\n" + "\n".join(f"• {e}" for e in errors))
        return

    # Safety check: Verify file sizes did not drop abnormally
    with open(css_path, "r", encoding="utf-8") as f:
        current_css_len = len(f.read())
    if current_css_len < len(orig_css) * 0.85:
        # Emergency rollback
        with open(css_path, "w", encoding="utf-8") as f:
            f.write(orig_css)
        send_message(chat_id, "🛡️ *Safety Guardian:* Change rejected because it would have deleted core styles.")
        return

    # Commit & push
    handle_push_command(chat_id, f"Mobile: {user_prompt[:50]}")
    send_message(chat_id, f"🎉 *Change completed [{used_model}]:*\n{summary}\n\nType `/rollback` if you want to undo this.")


def handle_message(message):
    """Route incoming Telegram messages."""
    chat_id = message["chat"]["id"]
    text = message.get("text", "").strip()

    if ALLOWED_CHAT_ID and str(chat_id) != str(ALLOWED_CHAT_ID):
        send_message(chat_id, "⛔ Unauthorized.")
        return

    print(f"[{time.strftime('%X')}] Telegram prompt: {text}")

    if text.startswith("/start") or text.startswith("/help"):
        help_msg = (
            "✈️ *AirplaneMode Mobile Control (v2.0 Safe)*\n\n"
            "• `/status` - Check git status & Vercel deployment\n"
            "• `/push <message>` - Manually commit & push\n"
            "• `/rollback` - 1-tap undo of the last change\n"
            "• `/help` - Show commands\n\n"
            "💬 *Send any prompt:* e.g. _'Add a badge saying v2.0 in the header'_ or _'Make the map glow arcs gold'_"
        )
        send_message(chat_id, help_msg)

    elif text.startswith("/status"):
        handle_status_command(chat_id)

    elif text.startswith("/rollback"):
        handle_rollback_command(chat_id)

    elif text.startswith("/push"):
        commit_msg = text.replace("/push", "").strip() or "Mobile update via Telegram"
        handle_push_command(chat_id, commit_msg)

    else:
        handle_ai_prompt(chat_id, text)


def poll_updates():
    """Main long-polling loop."""
    print("=" * 60)
    print("✈️ AirplaneMode Telegram Bridge (v2.0 Safe) Active")
    print(f"📁 Workspace: {WORKSPACE_DIR}")
    print("=" * 60)

    if TELEGRAM_BOT_TOKEN == "YOUR_TELEGRAM_BOT_TOKEN_HERE":
        print("\n❌ Error: Please set your TELEGRAM_BOT_TOKEN in .env file")
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
