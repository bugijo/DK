from typing import List, Dict, Optional, Any
from dataclasses import dataclass, field
from .spell import Spell, SpellSchool, SpellLevel, SpellType

@dataclass
class SpellSystem:
    """Sistema de gerenciamento de magias."""
    spells: List[Spell] = field(default_factory=list)
    spell_slots: Dict[int, int] = field(default_factory=dict)  # level -> available slots
    
    def __post_init__(self):
        """Inicializa o sistema de magias."""
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
                9: 0
            }
    
    def add_spell(self, spell: Spell) -> None:
        """Adiciona uma magia ao sistema."""
        if spell not in self.spells:
            self.spells.append(spell)
    
    def remove_spell(self, spell: Spell) -> bool:
        """Remove uma magia do sistema."""
        if spell in self.spells:
            self.spells.remove(spell)
            return True
        return False
    
    def get_spells_by_level(self, level: int) -> List[Spell]:
        """Retorna todas as magias de um nível específico."""
        return [spell for spell in self.spells if spell.level == level]
    
    def get_spells_by_school(self, school: SpellSchool) -> List[Spell]:
        """Retorna todas as magias de uma escola específica."""
        return [spell for spell in self.spells if spell.school == school]
    
    def get_spells_by_type(self, spell_type: SpellType) -> List[Spell]:
        """Retorna todas as magias de um tipo específico."""
        return [spell for spell in self.spells if spell.spell_type == spell_type]
    
    def can_cast_spell(self, spell: Spell, caster: Any) -> bool:
        """Verifica se uma magia pode ser lançada."""
        # Verifica se é um cantrip (não consome slot)
        if spell.level == 0:
            return spell.can_cast(caster)
        
        # Verifica se há slots disponíveis
        if self.spell_slots.get(spell.level, 0) <= 0:
            return False
        
        return spell.can_cast(caster)
    
    def cast_spell(self, spell: Spell, caster: Any, targets: List[Any]) -> bool:
        """Lança uma magia."""
        if not self.can_cast_spell(spell, caster):
            return False
        
        # Tenta lançar a magia
        if spell.cast(caster, targets):
            # Consome slot se não for cantrip
            if spell.level > 0:
                self.spell_slots[spell.level] -= 1
            return True
        
        return False
    
    def restore_spell_slot(self, level: int, amount: int = 1) -> None:
        """Restaura slots de magia."""
        if level in self.spell_slots:
            self.spell_slots[level] += amount
    
    def get_available_slots(self, level: int) -> int:
        """Retorna o número de slots disponíveis para um nível."""
        return self.spell_slots.get(level, 0)
    
    def long_rest(self) -> None:
        """Restaura todos os slots de magia (descanso longo)."""
        # Restaura slots baseado no nível do conjurador
        # Esta é uma implementação básica
        self.spell_slots = {
            1: 2,
            2: 1,
            3: 0,
            4: 0,
            5: 0,
            6: 0,
            7: 0,
            8: 0,
            9: 0
        }
    
    def short_rest(self) -> None:
        """Restaura alguns recursos (descanso curto)."""
        # Algumas classes podem recuperar slots em descanso curto
        # Implementação básica - pode ser expandida
        pass
    
    def get_known_spells(self) -> List[Spell]:
        """Retorna todas as magias conhecidas."""
        return [spell for spell in self.spells if spell.is_learned]
    
    def learn_spell(self, spell: Spell) -> bool:
        """Aprende uma nova magia."""
        if spell not in self.spells:
            self.add_spell(spell)
        spell.is_learned = True
        return True
    
    def forget_spell(self, spell: Spell) -> bool:
        """Esquece uma magia."""
        if spell in self.spells:
            spell.is_learned = False
            return True
        return False