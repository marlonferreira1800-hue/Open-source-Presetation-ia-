import subprocess
import time
import datetime
import sys

def run_cmd(cmd):
    try:
        res = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        return res.stdout.strip()
    except Exception as e:
        return str(e)

def auto_save_loop(interval_seconds=60):
    print(f"[*] Auto-Save ativo. Sincronizando com o GitHub a cada {interval_seconds}s...")
    while True:
        status = run_cmd("git status --porcelain")
        if status:
            now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            print(f"[{now}] Alterações detectadas. Salvando e enviando para o repositório...")
            run_cmd("git add -A")
            commit_msg = f"auto-save: {now}"
            run_cmd(f'git commit -m "{commit_msg}"')
            push_res = run_cmd("git push origin main")
            print(f"[{now}] Sincronizado com sucesso: {push_res}")
        time.sleep(interval_seconds)

if __name__ == "__main__":
    interval = int(sys.argv[1]) if len(sys.argv) > 1 else 60
    auto_save_loop(interval)
