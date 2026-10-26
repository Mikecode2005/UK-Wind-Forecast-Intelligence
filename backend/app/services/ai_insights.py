"""AI or rule-based procurement insights from accuracy metrics.

Default provider: NVIDIA Integrate API (OpenAI-compatible).

  NVIDIA_API_KEY or AI_API_KEY or OPENAI_API_KEY
  AI_API_BASE   default https://integrate.api.nvidia.com/v1
  AI_MODEL      default nvidia/nemotron-3-ultra-550b-a55b
"""

from __future__ import annotations

import os
from typing import Any, Optional

import httpx

AI_API_KEY = (
    os.environ.get("NVIDIA_API_KEY")
    or os.environ.get("AI_API_KEY")
    or os.environ.get("OPENAI_API_KEY")
    or ""
)
AI_API_BASE = os.environ.get(
    "AI_API_BASE", "https://integrate.api.nvidia.com/v1"
).rstrip("/")
AI_MODEL = os.environ.get("AI_MODEL", "nvidia/nemotron-3-ultra-550b-a55b")


def rule_based_insights(payload: dict[str, Any]) -> str:
    mae = payload.get("maeMw")
    rmse = payload.get("rmseMw")
    bias = payload.get("biasMw")
    mape = payload.get("mapePercent")
    period = f"{payload.get('fromDate', '?')} to {payload.get('toDate', '?')}"
    cutoff = payload.get("cutoffHour", 11)

    lines = [
        f"Analysis period {period} with D-1 cutoff {cutoff}:00 UK.",
    ]

    if bias is not None:
        if bias > 200:
            lines.append(
                f"Systematic over-forecast: mean bias is +{bias:.0f} MW. "
                "Day-ahead wind should be treated as optimistic; residual demand "
                "to buy is likely higher than a naïve wind forecast implies."
            )
        elif bias < -200:
            lines.append(
                f"Systematic under-forecast: mean bias is {bias:.0f} MW. "
                "There is a risk of over-procuring other energy relative to realised wind."
            )
        else:
            lines.append(
                f"Mean bias is relatively modest ({bias:+.0f} MW); directional error is not extreme."
            )

    if mae is not None:
        lines.append(
            f"Typical absolute error (MAE) is about {mae:.0f} MW. "
            "Procurement buffers and flexible plant should be sized with this magnitude in mind."
        )

    if rmse is not None and mae is not None and rmse > mae * 1.2:
        lines.append(
            f"RMSE ({rmse:.0f} MW) exceeds MAE materially, indicating occasional large misses "
            "that dominate risk more than the average error."
        )

    if mape is not None:
        lines.append(f"MAPE is {mape:.1f}% (zero-actual intervals excluded).")

    lines.append(
        "Recommendation: use the selected D-1 forecast vintage as the planning baseline, "
        "then apply a bias adjustment and an uncertainty band informed by MAE/RMSE before "
        "finalising day-ahead volumes."
    )
    return "\n\n".join(lines)


def llm_insights(payload: dict[str, Any]) -> Optional[str]:
    if not AI_API_KEY:
        return None

    prompt = (
        "You are an energy trading analyst supporting a UK utility day-ahead desk. "
        "Given these wind forecast accuracy metrics for a historical pilot period, "
        "write a concise briefing (max 180 words) for procurement: what the errors imply "
        "for residual demand, bias direction, and practical next steps. Be factual and "
        "do not invent data.\n\n"
        f"Metrics: {payload}"
    )

    body: dict[str, Any] = {
        "model": AI_MODEL,
        "messages": [
            {
                "role": "system",
                "content": "You write short trading desk briefings for electricity procurement.",
            },
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.4,
        "top_p": 0.95,
        "max_tokens": 1024,
        "stream": False,
    }
    # Nemotron optional thinking flag (ignored by other models)
    if "nemotron" in AI_MODEL.lower():
        body["chat_template_kwargs"] = {"enable_thinking": False}

    try:
        with httpx.Client(timeout=90.0) as client:
            resp = client.post(
                f"{AI_API_BASE}/chat/completions",
                headers={
                    "Authorization": f"Bearer {AI_API_KEY}",
                    "Content-Type": "application/json",
                },
                json=body,
            )
            resp.raise_for_status()
            data = resp.json()
            content = data["choices"][0]["message"].get("content") or ""
            return content.strip() or None
    except Exception:
        return None


def generate_insights(payload: dict[str, Any]) -> tuple[str, str]:
    """Return (insights_text, source_label)."""
    llm = llm_insights(payload)
    if llm:
        return llm, f"llm:{AI_MODEL}"
    return rule_based_insights(payload), "rules"
