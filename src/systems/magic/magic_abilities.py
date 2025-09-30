from typing import List, Dict, Any, Optional
from dataclasses import dataclass, field
from enum import Enum, auto

from src.systems.character.character import Character
from src.systems.combat.ability_effect import AbilityEffect

class MagicAbilityType(Enum):
    PASSIVE = auto()
    ACTIVE = auto()
    TOGGLE = auto()

@dataclass
class MagicAbility:
    name: str
    description: str
    ability_type: MagicAbilityType
    mana_cost: int = 0
    cooldown: int = 0
    current_cooldown: int = 0
    effects: List[AbilityEffect] = field(default_factory=list)
    requirements: Dict[str, Any] = field(default_factory=dict) # e.g., {'intelligence': 12, 'level': 5}

    def can_use(self, caster: Character) -> bool:
        if self.current_cooldown > 0:
            return False
        if caster.current_mana < self.mana_cost:
            return False
        for req_stat, req_value in self.requirements.items():
            if caster.get_stat(req_stat) < req_value:
                return False
        return True

    def use(self, caster: Character, target: Optional[Character] = None) -> bool:
        if not self.can_use(caster):
            return False

        caster.current_mana -= self.mana_cost
        self.current_cooldown = self.cooldown

        for effect in self.effects:
            effect.apply(target if target else caster) # Apply effects to target if provided, else caster
        return True

    def reduce_cooldown(self, amount: int = 1) -> None:
        self.current_cooldown = max(0, self.current_cooldown - amount)


@dataclass
class MagicAbilityManager:
    abilities: Dict[str, MagicAbility] = field(default_factory=dict)

    def add_ability(self, ability: MagicAbility) -> None:
        self.abilities[ability.name] = ability

    def get_ability(self, name: str) -> Optional[MagicAbility]:
        return self.abilities.get(name)

    def update_cooldowns(self) -> None:
        for ability in self.abilities.values():
            ability.reduce_cooldown()

# Exemplo de uso
if __name__ == "__main__":
    # Supondo uma classe Character e AbilityEffect simples para o exemplo
    class MockCharacter:
        def __init__(self, name, mana, intelligence, level):
            self.name = name
            self.current_mana = mana
            self.stats = {'intelligence': intelligence, 'level': level}
            self.status_effects = []

        def get_stat(self, stat_name):
            return self.stats.get(stat_name, 0)

        def apply_status_effect(self, effect):
            print(f"{self.name} received status effect: {effect.name}")
            self.status_effects.append(effect)

        def modify_stat(self, stat_name, value):
            self.stats[stat_name] = self.stats.get(stat_name, 0) + value
            print(f"{self.name}'s {stat_name} changed by {value}. New value: {self.stats[stat_name]}")

    @dataclass
    class MockAbilityEffect:
        name: str
        description: str
        stat_modifiers: Dict[str, int] = field(default_factory=dict)

        def apply(self, target: MockCharacter) -> None:
            for stat, modifier in self.stat_modifiers.items():
                target.modify_stat(stat, modifier)

    player = MockCharacter("Player", 100, 15, 7)
    enemy = MockCharacter("Enemy", 50, 8, 3)

    fireball_effect = MockAbilityEffect("Burn", "Deals fire damage over time.", {'hp': -10})
    fireball = MagicAbility(
        name="Fireball",
        description="Launches a fiery projectile.",
        ability_type=MagicAbilityType.ACTIVE,
        mana_cost=20,
        cooldown=3,
        effects=[fireball_effect],
        requirements={'intelligence': 10, 'level': 5}
    )

    mana_regen_effect = MockAbilityEffect("Mana Regeneration", "Restores mana over time.", {'mana_regen': 5})
    mana_regen_aura = MagicAbility(
        name="Mana Aura",
        description="Passively regenerates mana for nearby allies.",
        ability_type=MagicAbilityType.PASSIVE,
        mana_cost=0,
        effects=[mana_regen_effect]
    )

    ability_manager = MagicAbilityManager()
    ability_manager.add_ability(fireball)
    ability_manager.add_ability(mana_regen_aura)

    print(f"\n--- Using Fireball ---")
    if fireball.can_use(player):
        print(f"Player uses Fireball on Enemy.")
        fireball.use(player, enemy)
    else:
        print(f"Player cannot use Fireball.")

    print(f"Player Mana: {player.current_mana}")
    print(f"Fireball Cooldown: {fireball.current_cooldown}")

    print(f"\n--- Updating Cooldowns ---")
    ability_manager.update_cooldowns()
    print(f"Fireball Cooldown after 1 turn: {fireball.current_cooldown}")

    print(f"\n--- Mana Aura Effect (Passive) ---")
    mana_regen_aura.use(player) # Passive abilities might be 'used' to apply their initial effect or toggle

    print(f"\n--- Trying to use Fireball again (on cooldown) ---")
    if fireball.can_use(player):
        print(f"Player uses Fireball on Enemy.")
        fireball.use(player, enemy)
    else:
        print(f"Player cannot use Fireball (on cooldown or insufficient mana).")