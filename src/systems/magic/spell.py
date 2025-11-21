from __future__ import annotations

from typing import List, Dict, Optional, Any
from dataclasses import dataclass, field
from enum import Enum, auto
import time



class SpellSchool(Enum):
    ABJURATION = auto()  # Proteção e defesa
    CONJURATION = auto()  # Invocação e teleporte
    DIVINATION = auto()  # Conhecimento e detecção
    ENCHANTMENT = auto()  # Controle mental e buff
    EVOCATION = auto()  # Dano elemental e energia
    ILLUSION = auto()  # Engano e controle
    NECROMANCY = auto()  # Morte e alma
    TRANSMUTATION = auto()  # Transformação


class SpellType(Enum):
    ATTACK = auto()  # Dano direto
    DEFENSE = auto()  # Proteção
    UTILITY = auto()  # Utilidade geral
    HEALING = auto()  # Cura e restauração
    CONTROL = auto()  # Controle de campo
    SUMMONING = auto()  # Invocação de criaturas
    BUFF = auto()  # Melhorias temporárias
    DEBUFF = auto()  # Penalidades ao alvo


class CastType(Enum):
    INSTANT = auto()  # Efeito instantâneo
    CHANNELED = auto()  # Precisa canalizar
    CHARGED = auto()  # Pode ser carregada
    RITUAL = auto()  # Ritual longo
    PASSIVE = auto()  # Efeito passivo


class TargetType(Enum):
    SELF = auto()  # Apenas o conjurador
    SINGLE = auto()  # Um alvo
    AREA = auto()  # Área de efeito
    LINE = auto()  # Linha reta
    CONE = auto()  # Cone
    GLOBAL = auto()  # Todos na área/mapa


class Element(Enum):
    PHYSICAL = auto()
    FIRE = auto()
    ICE = auto()
    LIGHTNING = auto()
    EARTH = auto()
    WIND = auto()
    LIGHT = auto()
    DARK = auto()
    ARCANE = auto()


class SpellComponent(Enum):
    VERBAL = auto()  # Componente verbal (V)
    SOMATIC = auto()  # Componente somático (S)
    MATERIAL = auto()  # Componente material (M)
    FOCUS = auto()  # Foco arcano
    DIVINE_FOCUS = auto()  # Foco divino


class EffectType(Enum):
    DAMAGE = auto()
    HEALING = auto()
    BUFF = auto()
    DEBUFF = auto()
    CONDITION = auto()
    MOVEMENT = auto()
    AREA = auto()
    SUMMON = auto()
    DETECTION = auto()


class SpellLevel(Enum):
    CANTRIP = 0
    FIRST = 1
    SECOND = 2
    THIRD = 3
    FOURTH = 4
    FIFTH = 5
    SIXTH = 6
    SEVENTH = 7
    EIGHTH = 8
    NINTH = 9
    LEVEL_1 = 1
    LEVEL_2 = 2
    LEVEL_3 = 3
    LEVEL_4 = 4
    LEVEL_5 = 5
    LEVEL_6 = 6
    LEVEL_7 = 7
    LEVEL_8 = 8
    LEVEL_9 = 9


@dataclass
class SpellEffect:
    """Representa um efeito que uma magia pode causar."""

    name: str
    effect_type: EffectType = EffectType.DAMAGE
    target_type: TargetType = TargetType.SINGLE
    description: str = ""
    element: Element = Element.ARCANE
    power: int = 0
    duration: Optional[int] = None  # Em turnos
    tick_rate: Optional[int] = None  # A cada X turnos
    damage_dice: Optional[str] = None
    damage_type: Optional[str] = None
    healing_dice: Optional[str] = None
    healing_modifier: int = 0
    area_size: Optional[int] = None
    save_ability: Optional[str] = None
    save_dc: Optional[int] = None
    condition: Optional[str] = None
    detection_type: Optional[str] = None
    stat_modifiers: Dict[str, int] = field(default_factory=dict)
    status_effects: List[str] = field(default_factory=list)
    special_effects: Dict[str, Any] = field(default_factory=dict)


@dataclass
class SpellRequirement:
    """Requisitos para lançar uma magia."""

    level: int = 1
    mana_cost: int = 0
    health_cost: int = 0
    cast_time: float = 0.0  # Em segundos
    cooldown: float = 0.0  # Em segundos
    reagents: Dict[str, int] = field(default_factory=dict)
    stat_requirements: Dict[str, int] = field(default_factory=dict)
    skill_requirements: Dict[str, int] = field(default_factory=dict)


@dataclass
class Spell:
    """Classe base para todas as magias do jogo."""

    name: str
    level: SpellLevel
    school: SpellSchool
    casting_time: str
    range_feet: int
    duration: str
    components: List[SpellComponent] = field(default_factory=list)
    description: str = ""
    effects: List[SpellEffect] = field(default_factory=list)
    ritual: bool = False
    concentration: bool = False
    material_components: Optional[str] = None
    spell_type: SpellType = SpellType.UTILITY
    cast_type: CastType = CastType.INSTANT
    target_type: TargetType = TargetType.SINGLE
    element: Element = Element.ARCANE
    requirements: SpellRequirement = field(default_factory=SpellRequirement)
    is_learned: bool = False
    is_equipped: bool = False
    experience: int = 0
    max_charges: Optional[int] = None
    current_charges: Optional[int] = None
    last_cast_time: float = 0.0

    def _resolve_level(self, override_level: Optional[int]) -> int:
        if override_level is not None:
            return int(override_level)
        if isinstance(self.level, SpellLevel):
            return int(self.level.value)
        return int(self.level)

    def _mana_cost(self, override_level: Optional[int]) -> int:
        level_value = self._resolve_level(override_level)
        return max(level_value, 0)

    def can_cast(self, caster: Any, spell_level: Optional[int] = None) -> bool:
        mana_cost = self._mana_cost(spell_level)
        if mana_cost == 0:
            return True
        return caster.stats.get("mp", 0) >= mana_cost

    def cast(self, caster: Any, targets: List[Any], spell_level: Optional[int] = None) -> bool:
        if not self.can_cast(caster, spell_level):
            return False

        self.last_cast_time = 0.0
        self._apply_effects(caster, targets)
        self.experience += 1
        return True

    def _apply_effects(self, caster: Any, targets: List[Any]) -> None:
        """Aplica os efeitos da magia aos alvos."""
        for target in targets:
            for effect in self.effects:
                if effect.effect_type == EffectType.HEALING:
                    healing = effect.healing_modifier
                    if effect.healing_dice:
                        healing += self._average_roll(effect.healing_dice)
                    if hasattr(target, "heal"):
                        target.heal(healing)
                elif effect.effect_type == EffectType.DAMAGE:
                    damage = effect.power
                    if effect.damage_dice:
                        damage += self._average_roll(effect.damage_dice)
                    if hasattr(target, "take_damage"):
                        target.take_damage(damage)
                elif effect.effect_type == EffectType.CONDITION and hasattr(target, "add_status_effect"):
                    target.add_status_effect(effect.condition or effect.name, effect.duration)
                elif effect.effect_type == EffectType.BUFF and hasattr(target, "add_status_effect"):
                    target.add_status_effect(effect.name, effect.duration)
                elif effect.effect_type == EffectType.DEBUFF and hasattr(target, "add_status_effect"):
                    target.add_status_effect(effect.name, effect.duration)

    def _average_roll(self, dice_notation: str) -> int:
        """Calcula a média de um dado em notação NdM."""
        try:
            count, sides = dice_notation.lower().split("d")
            return (int(count) * (int(sides) + 1)) // 2
        except Exception:
            return 0

    def get_total_casts(self) -> int:
        """Retorna o número total de vezes que a magia foi lançada."""
        return self.experience

    def is_on_cooldown(self, current_time: float) -> bool:
        """Verifica se a magia está em cooldown."""
        return (current_time - self.last_cast_time) < self.requirements.cooldown

    def get_remaining_cooldown(self, current_time: float) -> float:
        """Retorna o tempo restante de cooldown."""
        if not self.is_on_cooldown(current_time):
            return 0.0
        return self.requirements.cooldown - (current_time - self.last_cast_time)

    def reset_cooldown(self) -> None:
        """Reseta o cooldown da magia."""
        self.last_cast_time = 0.0

    def restore_charge(self) -> None:
        """Restaura uma carga da magia."""
        if self.max_charges is None:
            return
        if self.current_charges is None:
            self.current_charges = self.max_charges
            return
        if self.current_charges < self.max_charges:
            self.current_charges += 1
