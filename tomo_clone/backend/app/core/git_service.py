import subprocess
import datetime
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

class GitService:
    def __init__(self):
        pass

    def run_cmd(self, command: str) -> str:
        try:
            res = subprocess.run(
                command,
                shell=True,
                capture_output=True,
                text=True,
                check=False
            )
            return res.stdout.strip() or res.stderr.strip()
        except Exception as e:
            logger.error(f"Erro ao executar comando git: {e}")
            return str(e)

    def get_status(self) -> Dict[str, Any]:
        """Verifica o status atual do repositório Git."""
        branch = self.run_cmd("git rev-parse --abbrev-ref HEAD") or "main"
        status_raw = self.run_cmd("git status --short")
        last_commit = self.run_cmd("git log -1 --pretty=format:'%h - %s (%cr)'")
        has_changes = bool(status_raw)

        return {
            "branch": branch,
            "has_uncommitted_changes": has_changes,
            "changed_files_count": len(status_raw.splitlines()) if status_raw else 0,
            "last_commit": last_commit,
            "status_summary": status_raw
        }

    def auto_commit_and_push(self, custom_message: str = None) -> Dict[str, Any]:
        """Adiciona, comita e envia as alterações automaticamente para o GitHub."""
        status = self.get_status()
        if not status["has_uncommitted_changes"]:
            return {
                "success": True,
                "message": "Nenhuma alteração pendente para salvar.",
                "status": status
            }

        now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        commit_msg = custom_message or f"auto-save: atualizações do Tomo Clone ({now_str})"

        add_out = self.run_cmd("git add .")
        commit_out = self.run_cmd(f'git commit -m "{commit_msg}"')
        push_out = self.run_cmd(f'git push origin {status["branch"]}')

        return {
            "success": True,
            "commit_message": commit_msg,
            "commit_output": commit_out,
            "push_output": push_out,
            "updated_status": self.get_status()
        }

git_service = GitService()
