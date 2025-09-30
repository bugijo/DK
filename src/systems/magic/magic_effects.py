from typing import Dict, Any, Optional
from dataclasses import dataclass, field
from enum import Enum, auto

from src.systems.character.character import Character
from src.systems.combat.status_effect import StatusEffect, StatusEffectType

class MagicEffectType(Enum):
    BUFF = auto()
    DEBUFF = auto()
    HEAL = auto()
    DAMAGE = auto()
    CONTROL = auto() # Stun, Root, Silence, etc.
    UTILITY = auto() # Teleport, Shield, etc.

@dataclass
class MagicEffect:
    name: str
    description: str
    effect_type: MagicEffectType
    duration: Optional[int] = None # Duration in turns, None for instant or permanent
    value: Optional[Any] = None # e.g., damage amount, heal amount, stat modifier value
    stat_modifiers: Dict[str, int] = field(default_factory=dict)
    status_effect_to_apply: Optional[StatusEffect] = None
    # Add more specific parameters as needed, e.g., area_of_effect, target_type, etc.

    def apply(self, target: Character) -> None:
        print(f"Applying magic effect '{self.name}' to {target.name}")
        if self.effect_type == MagicEffectType.HEAL:
            if isinstance(self.value, int):
                target.heal(self.value)
        elif self.effect_type == MagicEffectType.DAMAGE:
            if isinstance(self.value, int):
                target.take_damage(self.value) # Assuming take_damage method exists
        
        for stat, modifier in self.stat_modifiers.items():
            target.modify_stat(stat, modifier)

        if self.status_effect_to_apply:
            target.apply_status_effect(self.status_effect_to_apply)

    def remove(self, target: Character) -> None:
        print(f"Removing magic effect '{self.name}' from {target.name}")
        # Revert stat modifiers if they were permanent or need to be removed
        for stat, modifier in self.stat_modifiers.items():
            target.modify_stat(stat, -modifier)
        # Logic to remove status effect if it was applied by this MagicEffect
        if self.status_effect_to_apply:
            target.remove_status_effect(self.status_effect_to_apply.name) # Assuming remove_status_effect by name

# Exemplo de uso
if __name__ == "__main__":
    # Mock Character class for demonstration
    class MockCharacter:
        def __init__(self, name, hp, mana, strength):
            self.name = name
            self.current_hp = hp
            self.current_mana = mana
            self.stats = {'strength': strength}
            self.active_status_effects = {}

        def heal(self, amount):
            self.current_hp += amount
            print(f"{self.name} healed for {amount}. Current HP: {self.current_hp}")

        def take_damage(self, amount):
            self.current_hp -= amount
            print(f"{self.name} took {amount} damage. Current HP: {self.current_hp}")

        def modify_stat(self, stat_name, value):
            self.stats[stat_name] = self.stats.get(stat_name, 0) + value
            print(f"{self.name}'s {stat_name} changed by {value}. New value: {self.stats[stat_name]}")

        def apply_status_effect(self, status_effect):
            self.active_status_effects[status_effect.name] = status_effect
            print(f"{self.name} applied status effect: {status_effect.name}")

        def remove_status_effect(self, effect_name):
            if effect_name in self.active_status_effects:
                del self.active_status_effects[effect_name]
                print(f"{self.name} removed status effect: {effect_name}")

    player = MockCharacter("Hero", 100, 50, 10)
    enemy = MockCharacter("Goblin", 50, 0, 5)

    # Healing effect
    heal_effect = MagicEffect(
        name="Minor Heal",
        description="Restores a small amount of health.",
        effect_type=MagicEffectType.HEAL,
        value=20,
        duration=None # Instant
    )
    heal_effect.apply(player)

    # Damage effect
    fire_damage = MagicEffect(
        name="Fireball Damage",
        description="Deals fire damage.",
        effect_type=MagicEffectType.DAMAGE,
        value=30,
        duration=None # Instant
    )
    fire_damage.apply(enemy)

    # Buff effect with stat modifier
    strength_buff = MagicEffect(
        name="Might Buff",
        description="Increases strength for a duration.",
        effect_type=MagicEffectType.BUFF,
        duration=3,
        stat_modifiers={'strength': 5}
    )
    strength_buff.apply(player)

    # Debuff effect with status effect
    poison_status = StatusEffect(
        name="Poisoned",
        description="Takes damage over time.",
        effect_type=StatusEffectType.DOT,
        duration=2,
        value=5 # 5 damage per turn
    )
    poison_debuff = MagicEffect(
        name="Poison Cloud",
        description="Applies poison to target.",
        effect_type=MagicEffectType.DEBUFF,
        duration=2,
        status_effect_to_apply=poison_status
    )
    poison_debuff.apply(enemy)

    print(f"\nPlayer's final HP: {player.current_hp}, Strength: {player.stats['strength']}")
    print(f"Enemy's final HP: {enemy.current_hp}, Active Status Effects: {list(enemy.active_status_effects.keys())}")

    # Demonstrate removal of buff
    print("\n--- After duration (simulated) ---")
    strength_buff.remove(player)
    print(f"Player's strength after buff removal: {player.stats['strength']}")