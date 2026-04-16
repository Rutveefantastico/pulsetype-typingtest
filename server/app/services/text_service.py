import random

from app.schemas import Difficulty


TEXT_BANK: dict[Difficulty, list[str]] = {
    "easy": [
        "Small habits shape strong results. A short burst of focus each day can sharpen your typing speed and build lasting confidence.",
        "Typing well is about rhythm, not panic. Stay relaxed, keep your eyes ahead, and let your fingers move with calm precision.",
        "A clear mind helps your hands stay accurate. Smooth practice beats rushed effort every time you sit down to type.",
    ],
    "medium": [
        "Designing useful software means balancing speed, clarity, and reliability. Great products feel effortless because many thoughtful decisions are hidden beneath the surface.",
        "Remote teams thrive when communication is crisp and respectful. Clear writing, steady feedback, and shared ownership often matter more than the latest productivity trend.",
        "A developer portfolio should show more than code. It should tell a story about problem solving, product thinking, and the ability to turn ideas into polished experiences.",
    ],
    "hard": [
        "Modern web applications depend on careful coordination between interface design, client state, network requests, and persistent storage. When each layer is built with intention, the final experience feels fast, trustworthy, and deeply coherent across devices.",
        "Performance work is rarely about one dramatic optimization. More often, it comes from dozens of thoughtful improvements: reducing wasted renders, handling errors gracefully, shaping data for real user needs, and keeping the visual interface responsive during every interaction.",
        "Professional software stands out when engineering and design reinforce each other. A refined user journey, maintainable architecture, and observability-minded backend can transform a simple tool into something people return to with confidence.",
    ],
}


TIME_WORD_TARGETS = [
    (30, 35),
    (60, 75),
    (120, 150),
    (300, 220),
    (600, 270),
    (1000, 300),
]

DIFFICULTY_MULTIPLIERS: dict[Difficulty, float] = {
    "easy": 0.9,
    "medium": 1.0,
    "hard": 1.15,
}


def _get_target_word_count(difficulty: Difficulty, time_limit: int) -> int:
    baseline = TIME_WORD_TARGETS[-1][1]
    for max_seconds, word_target in TIME_WORD_TARGETS:
        if time_limit <= max_seconds:
            baseline = word_target
            break

    adjusted = int(baseline * DIFFICULTY_MULTIPLIERS[difficulty])
    return max(18, min(340, adjusted))


def get_random_text(difficulty: Difficulty, time_limit: int) -> str:
    candidates = TEXT_BANK[difficulty][:]
    random.shuffle(candidates)

    target_word_count = _get_target_word_count(difficulty, time_limit)
    selected_paragraphs = []
    current_word_count = 0

    while current_word_count < target_word_count:
        if not candidates:
            candidates = TEXT_BANK[difficulty][:]
            random.shuffle(candidates)

        paragraph = candidates.pop()
        selected_paragraphs.append(paragraph)
        current_word_count += len(paragraph.split())

    return " ".join(selected_paragraphs)
