from typing import Dict, Any, List
from dataclasses import dataclass, field

@dataclass
class Race:
    name: str
    description: str
    ability_score_bonuses: Dict[str, int] = field(default_factory=dict)
    speed: int = 30
    size: str = "Medium"
    traits: List[str] = field(default_factory=list)
    languages: List[str] = field(default_factory=list)

    def apply_racial_bonuses(self, character_stats: Dict[str, int]) -> None:
        """Aplica os bônus raciais aos atributos do personagem."""
        for stat, bonus in self.ability_score_bonuses.items():
            character_stats[stat] = character_stats.get(stat, 0) + bonus

# Exemplo de raças (apenas para demonstração)
DRAGONBORN = Race(
    name="Dragonborn",
    description="Proud, draconic humanoids.",
    ability_score_bonuses={"strength": 2, "charisma": 1},
    traits=["Draconic Ancestry", "Breath Weapon", "Damage Resistance"],
    languages=["Common", "Draconic"]
)

DWARF = Race(
    name="Dwarf",
    description="Stout and hardy folk.",
    ability_score_bonuses={"constitution": 2},
    speed=25,
    traits=["Darkvision", "Dwarven Resilience", "Stonecunning"],
    languages=["Common", "Dwarven"]
)

ELF = Race(
    name="Elf",
    description="Graceful and long-lived.",
    ability_score_bonuses={"dexterity": 2},
    traits=["Darkvision", "Fey Ancestry", "Trance", "Keen Senses"],
    languages=["Common", "Elvish"]
)

GNOME = Race(
    name="Gnome",
    description="Small, inventive, and curious.",
    ability_score_bonuses={"intelligence": 2},
    speed=25,
    traits=["Darkvision", "Gnome Cunning"],
    languages=["Common", "Gnomish"]
)

HUMAN = Race(
    name="Human",
    description="Versatile and ambitious.",
    ability_score_bonuses={
        "strength": 1, "dexterity": 1, "constitution": 1,
        "intelligence": 1, "wisdom": 1, "charisma": 1
    },
    languages=["Common", "One extra language of your choice"]
)

HALFLING = Race(
    name="Halfling",
    description="Small, nimble, and lucky.",
    ability_score_bonuses={"dexterity": 2},
    traits=["Lucky", "Brave", "Halfling Nimbleness"],
    languages=["Common", "Halfling"]
)

TIEFLING = Race(
    name="Tiefling",
    description="Humanoids with infernal heritage.",
    ability_score_bonuses={"charisma": 2, "intelligence": 1},
    traits=["Darkvision", "Hellish Resistance", "Infernal Legacy"],
    languages=["Common", "Infernal"]
)

ORC = Race(
    name="Orc",
    description="Fierce and strong warriors.",
    ability_score_bonuses={"strength": 2, "constitution": 1},
    traits=["Darkvision", "Aggressive", "Relentless Endurance"],
    languages=["Common", "Orc"]
)

HALF_ELF = Race(
    name="Half-Elf",
    description="Combining the best of two worlds.",
    ability_score_bonuses={"charisma": 2},
    traits=["Darkvision", "Fey Ancestry", "Skill Versatility"],
    languages=["Common", "Elvish", "One extra language of your choice"]
)

HALF_ORC = Race(
    name="Half-Orc",
    description="A blend of human and orcish might.",
    ability_score_bonuses={"strength": 2, "constitution": 1},
    traits=["Darkvision", "Menacing", "Relentless Endurance", "Savage Attacks"],
    languages=["Common", "Orc"]
)