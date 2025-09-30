from typing import Dict, Any, List
from dataclasses import dataclass, field

@dataclass
class Feat:
    name: str
    description: str
    prerequisites: Dict[str, Any] = field(default_factory=dict)
    effects: List[str] = field(default_factory=list)

# Exemplo de talentos (apenas para demonstração)
ABILITY_SCORE_IMPROVEMENT = Feat(
    name="Ability Score Improvement",
    description="Increase one ability score of your choice by 2, or increase two ability scores of your choice by 1. You can't increase an ability score above 20 using this feat.",
    prerequisites={},
    effects=["Increase ability scores"]
)

ACTOR = Feat(
    name="Actor",
    description="You have a knack for effective acting.",
    prerequisites={},
    effects=["Increase Charisma by 1", "Advantage on Deception and Performance checks when trying to pass as a different person", "Mimic voices and sounds"]
)

ALERT = Feat(
    name="Alert",
    description="Always on the lookout for danger.",
    prerequisites={},
    effects=["Gain +5 bonus to initiative", "Cannot be surprised while conscious", "Other creatures don't gain advantage on attack rolls against you as a result of being hidden from you"]
)

ATHLETE = Feat(
    name="Athlete",
    description="You have undergone extensive physical training.",
    prerequisites={},
    effects=["Increase Strength or Dexterity by 1", "Standing up from prone costs only 5 feet of movement", "Climbing doesn't cost you extra movement", "Running jump and long jump distances increase by 5 feet"]
)

CROSSBOW_EXPERT = Feat(
    name="Crossbow Expert",
    description="Thanks to extensive practice with the crossbow, you gain the following benefits.",
    prerequisites={},
    effects=["Ignore the loading quality of crossbows with which you are proficient", "Being within 5 feet of a hostile creature doesn't impose disadvantage on your ranged attack rolls", "When you use the Attack action and attack with a one-handed weapon, you can use a bonus action to attack with a hand crossbow you are holding"]
)

DUELING_FIGHTER = Feat(
    name="Dueling Fighter",
    description="When you are wielding a melee weapon in one hand and no other weapons, you gain a +2 bonus to damage rolls with that weapon.",
    prerequisites={"class": "Fighter"},
    effects=["Add +2 to damage rolls when dueling"]
)

GREAT_WEAPON_MASTER = Feat(
    name="Great Weapon Master",
    description="You've learned to throw the weight of a weapon into a blow, sacrificing accuracy for raw power.",
    prerequisites={},
    effects=["Before you make a melee attack with a heavy weapon that you are proficient with, you can choose to take a -5 penalty to the attack roll. If you do so and the attack hits, it deals +10 damage", "When you score a critical hit with a melee weapon or reduce a creature to 0 hit points with one, you can make one melee weapon attack as a bonus action"]
)

LUCKY = Feat(
    name="Lucky",
    description="You have an uncanny knack for getting lucky at just the right moment.",
    prerequisites={},
    effects=["You have 3 luck points. Whenever you make an attack roll, an ability check, or a saving throw, you can spend one luck point to roll an additional d20. You can choose to spend one of your luck points after you roll the die, but before the outcome is determined. You choose which of the d20s is used for the attack roll, ability check, or saving throw."]
)