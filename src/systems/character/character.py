from typing import Dict, Any, Optional, List
from dataclasses import dataclass, field
from .race import Race
from .dnd_class import DnDClass
from .background import Background
from .feat import Feat

@dataclass
class Character:
    name: str
    stats: Dict[str, int] = field(default_factory=dict)
    level: int = 1
    experience: int = 0
    inventory: Dict[str, Any] = field(default_factory=dict)
    equipment: Dict[str, Any] = field(default_factory=dict)
    abilities: Dict[str, Any] = field(default_factory=dict)
    status_effects: Dict[str, Any] = field(default_factory=dict)
    race: Optional[Race] = None
    dnd_class: Optional[DnDClass] = None
    background: Optional[Background] = None
    feats: List[Feat] = field(default_factory=list)
    
    def __hash__(self) -> int:
        """Torna a classe hashable baseada no nome do personagem."""
        return hash(self.name)
    
    def __eq__(self, other) -> bool:
        """Compara personagens baseado no nome."""
        if not isinstance(other, Character):
            return False
        return self.name == other.name
    
    def __post_init__(self):
        # Inicializa stats padrão se não fornecidos
        default_stats = {
            'strength': 10,
            'dexterity': 10,
            'constitution': 10,
            'intelligence': 10,
            'wisdom': 10,
            'charisma': 10,
            'hp': 10,
            'max_hp': 10,
            'mp': 10,
            'max_mp': 10,
            'armor_class': 10,
            'initiative_bonus': 0
        }
        for stat, value in default_stats.items():
            if stat not in self.stats:
                self.stats[stat] = value

        if self.race:
            self.race.apply_racial_bonuses(self.stats)

        # TODO: Aplicar bônus de classe, antecedentes e talentos
    
    def modify_stat(self, stat: str, amount: int) -> None:
        """Modifica um atributo do personagem."""
        if stat in self.stats:
            self.stats[stat] += amount
    
    def get_stat(self, stat: str) -> Optional[int]:
        """Retorna o valor de um atributo."""
        return self.stats.get(stat)
    
    def is_alive(self) -> bool:
        """Verifica se o personagem está vivo."""
        return self.stats['hp'] > 0
    
    def heal(self, amount: int) -> None:
        """Cura o personagem."""
        self.stats['hp'] = min(self.stats['hp'] + amount, self.stats['max_hp'])
    
    def take_damage(self, amount: int) -> None:
        """Causa dano ao personagem."""
        self.stats['hp'] = max(0, self.stats['hp'] - amount)
    
    def restore_mana(self, amount: int) -> None:
        """Restaura mana do personagem."""
        self.stats['mp'] = min(self.stats['mp'] + amount, self.stats['max_mp'])
    
    def use_mana(self, amount: int) -> bool:
        """Tenta usar mana. Retorna True se sucesso."""
        if self.stats['mp'] >= amount:
            self.stats['mp'] -= amount
            return True
        return False
    
    def add_experience(self, amount: int) -> None:
        """Adiciona experiência ao personagem."""
        self.experience += amount
        self._check_level_up()
    
    def _check_level_up(self) -> None:
        """Verifica se o personagem pode subir de nível."""
        # Implementação básica: 1000 XP por nível
        while self.experience >= self.level * 1000:
            self.level_up()
    
    def level_up(self) -> None:
        """Aumenta o nível do personagem."""
        self.level += 1
        # Aumenta stats base
        self.stats['max_hp'] += 5
        self.stats['hp'] = self.stats['max_hp']
        self.stats['max_mp'] += 3
        self.stats['mp'] = self.stats['max_mp']
    
    def equip_item(self, slot: str, item: Any) -> bool:
        """Equipa um item em um slot."""
        if slot in self.equipment:
            old_item = self.equipment[slot]
            self.inventory[old_item.name] = old_item
        self.equipment[slot] = item
        return True
    
    def unequip_item(self, slot: str) -> Optional[Any]:
        """Remove um item equipado."""
        if slot in self.equipment:
            item = self.equipment.pop(slot)
            self.inventory[item.name] = item
            return item
        return None
    
    def add_to_inventory(self, item: Any) -> bool:
        """Adiciona um item ao inventário."""
        self.inventory[item.name] = item
        return True
    
    def remove_from_inventory(self, item_name: str) -> Optional[Any]:
        """Remove um item do inventário."""
        return self.inventory.pop(item_name, None)
    
    def has_item(self, item_name: str) -> bool:
        """Verifica se tem um item no inventário."""
        return item_name in self.inventory
    
    def add_ability(self, ability_name: str, ability: Any) -> None:
        """Adiciona uma habilidade ao personagem."""
        self.abilities[ability_name] = ability
    
    def remove_ability(self, ability_name: str) -> Optional[Any]:
        """Remove uma habilidade do personagem."""
        return self.abilities.pop(ability_name, None)
    
    def has_ability(self, ability_name: str) -> bool:
        """Verifica se tem uma habilidade."""
        return ability_name in self.abilities
    
    def add_status_effect(self, effect_name: str, effect: Any) -> None:
        """Adiciona um efeito de status."""
        self.status_effects[effect_name] = effect
    
    def remove_status_effect(self, effect_name: str) -> Optional[Any]:
        """Remove um efeito de status."""
        return self.status_effects.pop(effect_name, None)
    
    def has_status_effect(self, effect_name: str) -> bool:
        """Verifica se tem um efeito de status."""
        return effect_name in self.status_effects