from typing import Dict, Any, List, Optional
from pydantic import BaseModel

class UIComponent(BaseModel):
    id: str
    type: str  # "progress_bar", "checklist", "metric_card", "action_button", "slider"
    title: str
    props: Dict[str, Any] = {}

class MiniAppSchema(BaseModel):
    id: str
    title: str
    category: str  # "fitness", "finance", "habits", "productivity"
    summary: str
    components: List[UIComponent]
    initial_state: Dict[str, Any] = {}

def create_sample_habit_app(user_id: str, habit_title: str, target_days: int = 7) -> Dict[str, Any]:
    """Cria um Mini-App padrão de rastreamento de hábitos caso o LLM solicite."""
    app_id = f"app_habit_{habit_title.lower().replace(' ', '_')}"
    return {
        "id": app_id,
        "title": f"Tracker: {habit_title}",
        "category": "habits",
        "summary": f"Acompanhamento diário para atingir {target_days} dias consecutivos.",
        "components": [
            {
                "id": "progress_1",
                "type": "progress_bar",
                "title": "Sequência Atual",
                "props": {
                    "current": 1,
                    "target": target_days,
                    "unit": "dias"
                }
            },
            {
                "id": "checklist_1",
                "type": "checklist",
                "title": "Etapas de Hoje",
                "props": {
                    "items": [
                        {"id": "c1", "label": f"Concluir {habit_title}", "done": False},
                        {"id": "c2", "label": "Registrar percepção ou dificuldade", "done": False}
                    ]
                }
            },
            {
                "id": "btn_checkin",
                "type": "action_button",
                "title": "Registrar Check-in de Hoje",
                "props": {
                    "action": "increment_progress",
                    "target_component": "progress_1"
                }
            }
        ],
        "initial_state": {
            "progress_1": {"current": 1, "target": target_days},
            "checklist_1": {"c1": False, "c2": False}
        }
    }
