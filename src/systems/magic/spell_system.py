from __future__ import annotations

from typing import List, Dict, Optional, Any
from dataclasses import dataclass, field
import time

from .spell import Spell, SpellSchool, SpellLevel, SpellType


@dataclass
class SpellSystem:
    """Sistema de gerenciamento de magias."""

    spells: Dict[str, Spell] = field(default_factory=dict)
    spell_slots: Dict[int, int] = field(default_factory=dict)  # level -> available slots

    def __post_init__(self) -> None:
        # Inicializa spell slots padrão
        if not self.spell_slots:
            self.spell_slots = {
                1: 2,  # 2 slots de nível 1
                2: 1,  # 1 slot de nível 2
                3: 0,  # 0 slots de nível 3
                4: 0,  # etc...
                5: 0,
                6: 0,
                7: 0,
                8: 0,
                9: 0,
            }

    # Gerenciamento de magias básicas
    def add_spell(self, spell: Spell) -> None:
        self.spells[spell.name] = spell

    def remove_spell(self, spell: Spell) -> bool:
        if spell.name in self.spells:
            del self.spells[spell.name]
            return True
        return False

    def get_spell(self, name: str) -> Optional[Spell]:
        return self.spells.get(name)

    def get_spells_by_level(self, level: SpellLevel) -> List[Spell]:
        return [spell for spell in self.spells.values() if spell.level == level]

    def get_spells_by_school(self, school: SpellSchool) -> List[Spell]:
        return [spell for spell in self.spells.values() if spell.school == school]

    def get_spells_by_type(self, spell_type: SpellType) -> List[Spell]:
        return [spell for spell in self.spells.values() if spell.spell_type == spell_type]

    # Conjuração e recursos
    def _resolve_spell_level(self, spell: Spell, override: Optional[int]) -> int:
        if override is not None:
            return int(override)
        if isinstance(spell.level, SpellLevel):
            return int(spell.level.value)
        return int(spell.level)

    def _mana_cost(self, spell: Spell, override: Optional[int]) -> int:
        spell_level = self._resolve_spell_level(spell, override)
        return max(spell_level, 0)

    def can_cast_spell(
        self,
        caster: Any,
        spell_name: str,
        spell_level: Optional[int] = None,
    ) -> bool:
        spell = self.get_spell(spell_name)
        if not spell:
            return False

        mana_cost = self._mana_cost(spell, spell_level)
        if mana_cost == 0:
            return True
        return caster.stats.get("mp", 0) >= mana_cost

    def cast_spell(
        self,
        caster: Any,
        spell_name: str,
        spell_level: Optional[int] = None,
        targets: Optional[List[Any]] = None,
    ) -> Dict[str, Any]:
        spell = self.get_spell(spell_name)
        if not spell:
            return {"success": False, "message": "Spell not found"}

        now = time.time()
        if spell.is_on_cooldown(now):
            return {
                "success": False,
                "message": "Spell on cooldown",
                "remaining_cooldown": spell.get_remaining_cooldown(now),
            }

        mana_cost = self._mana_cost(spell, spell_level)
        available_mana = caster.stats.get("mp", 0)

        if mana_cost > available_mana:
            return {"success": False, "message": "Insufficient mana", "mana_cost": mana_cost}

        if mana_cost:
            caster.stats["mp"] = available_mana - mana_cost

        if targets is None:
            targets = []
        did_cast = spell.cast(caster, targets, spell_level=spell_level)
        if not did_cast:
            # Falha inesperada na conjuração (ex.: cooldown alterado entre verificações)
            # Reverte custo de mana se já deduzido
            caster.stats["mp"] = available_mana
            return {"success": False, "message": "Spell cast failed"}
        return {"success": True, "message": "Spell cast", "mana_cost": mana_cost}

    # Recuperação e utilidades
    def restore_spell_slot(self, level: int, amount: int = 1) -> None:
        if level in self.spell_slots:
            self.spell_slots[level] += amount

    def get_available_slots(self, level: int) -> int:
        return self.spell_slots.get(level, 0)

    def long_rest(self) -> None:
        self.spell_slots = {1: 2, 2: 1, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0}

    def short_rest(self) -> None:
        # Implementação básica - pode ser expandida
        pass

    def get_known_spells(self) -> List[Spell]:
        return [spell for spell in self.spells.values() if spell.is_learned]

    def learn_spell(self, spell: Spell) -> bool:
        if spell.name not in self.spells:
            self.add_spell(spell)
        self.spells[spell.name].is_learned = True
        return True

    def forget_spell(self, spell: Spell) -> bool:
        if spell.name in self.spells:
            self.spells[spell.name].is_learned = False
            return True
        return False

    def calculate_spell_save_dc(self, caster: Any, ability: str) -> int:
        ability_score = caster.stats.get(ability, 10)
        ability_modifier = (ability_score - 10) // 2
        proficiency = self._calculate_proficiency_bonus(caster.level)
        return 8 + proficiency + ability_modifier

    @staticmethod
    def _calculate_proficiency_bonus(level: int) -> int:
        # Regra básica de D&D 5e
        return 2 + ((max(level, 1) - 1) // 4)
