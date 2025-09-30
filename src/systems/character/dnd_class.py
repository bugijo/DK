from typing import Dict, Any, List
from dataclasses import dataclass, field

@dataclass
class DnDClass:
    name: str
    description: str
    hit_die: int
    primary_ability: List[str]
    saving_throw_proficiencies: List[str]
    skill_proficiencies_choice: int
    skill_proficiencies_options: List[str]
    starting_equipment: List[str]
    features_by_level: Dict[int, List[str]] = field(default_factory=dict)

# Exemplo de classes (apenas para demonstração)
BARBARIAN = DnDClass(
    name="Barbarian",
    description="A fierce warrior of primitive background who can enter a battle rage.",
    hit_die=12,
    primary_ability=["strength"],
    saving_throw_proficiencies=["strength", "constitution"],
    skill_proficiencies_choice=2,
    skill_proficiencies_options=["Animal Handling", "Athletics", "Intimidation", "Nature", "Perception", "Survival"],
    starting_equipment=["Greataxe", "two handaxes", "explorer's pack", "four javelins"],
    features_by_level={
        1: ["Rage", "Unarmored Defense"],
        2: ["Reckless Attack", "Danger Sense"],
        3: ["Primal Path"],
        4: ["Ability Score Improvement"],
    }
)

BARD = DnDClass(
    name="Bard",
    description="A master of song, speech, and the magic they contain.",
    hit_die=8,
    primary_ability=["charisma"],
    saving_throw_proficiencies=["dexterity", "charisma"],
    skill_proficiencies_choice=3,
    skill_proficiencies_options=["Acrobatics", "Animal Handling", "Arcana", "Athletics", "Deception", "History", "Insight", "Intimidation", "Investigation", "Medicine", "Nature", "Perception", "Performance", "Persuasion", "Religion", "Sleight of Hand", "Stealth", "Survival"],
    starting_equipment=["Rapier", "diplomat's pack", "lute", "leather armor", "dagger"],
    features_by_level={
        1: ["Bardic Inspiration (d6)", "Spellcasting"],
        2: ["Jack of All Trades", "Song of Rest (d6)"],
        3: ["Bard College"],
        4: ["Ability Score Improvement"],
    }
)

CLERIC = DnDClass(
    name="Cleric",
    description="A priestly champion who wields divine magic in service of a higher power.",
    hit_die=8,
    primary_ability=["wisdom"],
    saving_throw_proficiencies=["wisdom", "charisma"],
    skill_proficiencies_choice=2,
    skill_proficiencies_options=["History", "Insight", "Medicine", "Persuasion", "Religion"],
    starting_equipment=["Mace", "scale mail", "light crossbow and 20 bolts", "priest's pack", "shield", "holy symbol"],
    features_by_level={
        1: ["Spellcasting", "Divine Domain"],
        2: ["Channel Divinity (1/rest)"],
        3: ["Divine Domain Feature"],
        4: ["Ability Score Improvement"],
    }
)

FIGHTER = DnDClass(
    name="Fighter",
    description="A master of martial combat, skilled with a variety of weapons and armor.",
    hit_die=10,
    primary_ability=["strength", "dexterity"],
    saving_throw_proficiencies=["strength", "constitution"],
    skill_proficiencies_choice=2,
    skill_proficiencies_options=["Acrobatics", "Animal Handling", "Athletics", "History", "Insight", "Intimidation", "Perception", "Survival"],
    starting_equipment=["Chain mail", "longsword", "shield", "light crossbow and 20 bolts", "dungeoneer's pack"],
    features_by_level={
        1: ["Fighting Style", "Second Wind"],
        2: ["Action Surge (one use)"],
        3: ["Martial Archetype"],
        4: ["Ability Score Improvement"],
    }
)

ROGUE = DnDClass(
    name="Rogue",
    description="A scoundrel who uses stealth and trickery to overcome obstacles and enemies.",
    hit_die=8,
    primary_ability=["dexterity"],
    saving_throw_proficiencies=["dexterity", "intelligence"],
    skill_proficiencies_choice=4,
    skill_proficiencies_options=["Acrobatics", "Athletics", "Deception", "Insight", "Intimidation", "Investigation", "Perception", "Performance", "Persuasion", "Sleight of Hand", "Stealth"],
    starting_equipment=["Rapier", "shortbow and 20 arrows", "burglar's pack", "leather armor", "two daggers", "thieves' tools"],
    features_by_level={
        1: ["Expertise", "Sneak Attack", "Thieves' Cant"],
        2: ["Cunning Action"],
        3: ["Roguish Archetype"],
        4: ["Ability Score Improvement"],
    }
)

WIZARD = DnDClass(
    name="Wizard",
    description="A scholarly magic-user adept at wielding spells.",
    hit_die=6,
    primary_ability=["intelligence"],
    saving_throw_proficiencies=["intelligence", "wisdom"],
    skill_proficiencies_choice=2,
    skill_proficiencies_options=["Arcana", "History", "Insight", "Investigation", "Medicine", "Religion"],
    starting_equipment=["Quarterstaff", "component pouch", "scholar's pack", "spellbook"],
    features_by_level={
        1: ["Spellcasting", "Arcane Recovery"],
        2: ["Arcane Tradition"],
        3: ["Spellcasting (new level)"],
        4: ["Ability Score Improvement"],
    }
)