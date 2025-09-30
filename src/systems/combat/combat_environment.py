from typing import Dict, Any, List, Tuple
from dataclasses import dataclass, field
from enum import Enum

class CoverType(Enum):
    NONE = 0
    HALF = 1
    THREE_QUARTERS = 2
    FULL = 3

@dataclass
class TerrainFeature:
    name: str
    description: str
    movement_cost_multiplier: float = 1.0
    effects: List[str] = field(default_factory=list)

@dataclass
class CombatOpportunity:
    name: str
    description: str
    trigger: str # e.g., "enemy_leaves_reach", "spell_cast_in_melee"
    action_type: str # e.g., "reaction_attack", "bonus_action_spell"

@dataclass
class CombatCombo:
    name: str
    description: str
    required_actions: List[str] # e.g., ["attack", "shove"]
    bonus_effect: str # e.g., "extra_damage", "prone_target"

class CombatEnvironmentManager:
    def __init__(self):
        self.terrain_features: Dict[Tuple[int, int], TerrainFeature] = {}
        self.cover_map: Dict[Tuple[int, int], Dict[Tuple[int, int], CoverType]] = {}
        self.opportunities: List[CombatOpportunity] = []
        self.combos: List[CombatCombo] = []

    def add_terrain_feature(self, position: Tuple[int, int], feature: TerrainFeature) -> None:
        self.terrain_features[position] = feature

    def get_terrain_at_position(self, position: Tuple[int, int]) -> Optional[TerrainFeature]:
        return self.terrain_features.get(position)

    def set_cover(self, from_pos: Tuple[int, int], to_pos: Tuple[int, int], cover_type: CoverType) -> None:
        if from_pos not in self.cover_map:
            self.cover_map[from_pos] = {}
        self.cover_map[from_pos][to_pos] = cover_type

    def get_cover(self, from_pos: Tuple[int, int], to_pos: Tuple[int, int]) -> CoverType:
        return self.cover_map.get(from_pos, {}).get(to_pos, CoverType.NONE)

    def add_opportunity(self, opportunity: CombatOpportunity) -> None:
        self.opportunities.append(opportunity)

    def get_opportunities_by_trigger(self, trigger: str) -> List[CombatOpportunity]:
        return [op for op in self.opportunities if op.trigger == trigger]

    def add_combo(self, combo: CombatCombo) -> None:
        self.combos.append(combo)

    def get_combos_by_actions(self, actions: List[str]) -> List[CombatCombo]:
        # Simple check: all required actions must be present
        return [combo for combo in self.combos if all(req_action in actions for req_action in combo.required_actions)]

# Exemplo de uso (para demonstração)
if __name__ == "__main__":
    env_manager = CombatEnvironmentManager()

    # Adicionar terreno
    forest_terrain = TerrainFeature("Dense Forest", "Difficult terrain, provides light cover.", movement_cost_multiplier=2.0)
    env_manager.add_terrain_feature((0, 0), forest_terrain)
    print(f"Terrain at (0,0): {env_manager.get_terrain_at_position((0,0)).name}")

    # Adicionar cobertura
    env_manager.set_cover((0,0), (1,1), CoverType.HALF)
    print(f"Cover from (0,0) to (1,1): {env_manager.get_cover((0,0), (1,1)).name}")

    # Adicionar oportunidade
    opportunity_attack = CombatOpportunity("Opportunity Attack", "When a hostile creature that you can see moves out of your reach.", "enemy_leaves_reach", "reaction_attack")
    env_manager.add_opportunity(opportunity_attack)
    print(f"Opportunities for 'enemy_leaves_reach': {[op.name for op in env_manager.get_opportunities_by_trigger('enemy_leaves_reach')]}")

    # Adicionar combo
    shove_attack_combo = CombatCombo("Shove and Attack", "Shove an enemy prone then attack with advantage.", ["shove", "attack"], "advantage_on_attack")
    env_manager.add_combo(shove_attack_combo)
    print(f"Combos for ['shove', 'attack']: {[c.name for c in env_manager.get_combos_by_actions(['shove', 'attack'])]}")