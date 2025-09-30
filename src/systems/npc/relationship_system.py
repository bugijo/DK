from typing import Dict, Tuple, Optional
from dataclasses import dataclass

@dataclass
class Relationship:
    target_id: str
    value: int = 0 # -100 (Hate) to 100 (Love)
    attitude: str = "Neutral"

    def update_attitude(self):
        if self.value >= 75:
            self.attitude = "Friendly"
        elif self.value >= 25:
            self.attitude = "Positive"
        elif self.value <= -75:
            self.attitude = "Hostile"
        elif self.value <= -25:
            self.attitude = "Negative"
        else:
            self.attitude = "Neutral"

class RelationshipManager:
    def __init__(self):
        # Stores relationships as {source_id: {target_id: Relationship}}
        self.relationships: Dict[str, Dict[str, Relationship]] = {}

    def get_relationship(self, source_id: str, target_id: str) -> Optional[Relationship]:
        return self.relationships.get(source_id, {}).get(target_id)

    def update_relationship(self, source_id: str, target_id: str, change: int) -> Relationship:
        if source_id not in self.relationships:
            self.relationships[source_id] = {}
        
        if target_id not in self.relationships[source_id]:
            self.relationships[source_id][target_id] = Relationship(target_id=target_id, value=0)
        
        rel = self.relationships[source_id][target_id]
        rel.value = max(-100, min(100, rel.value + change))
        rel.update_attitude()
        return rel

    def set_relationship(self, source_id: str, target_id: str, value: int) -> Relationship:
        if source_id not in self.relationships:
            self.relationships[source_id] = {}
        
        rel = Relationship(target_id=target_id, value=max(-100, min(100, value)))
        rel.update_attitude()
        self.relationships[source_id][target_id] = rel
        return rel

    def get_all_relationships_for_source(self, source_id: str) -> Dict[str, Relationship]:
        return self.relationships.get(source_id, {})

# Exemplo de uso
if __name__ == "__main__":
    rel_manager = RelationshipManager()

    # Player interacts positively with NPC_A
    print("\n--- Player and NPC_A ---")
    rel_manager.update_relationship("Player", "NPC_A", 30)
    rel_A = rel_manager.get_relationship("Player", "NPC_A")
    print(f"Player's relationship with NPC_A: Value={rel_A.value}, Attitude={rel_A.attitude}")

    rel_manager.update_relationship("Player", "NPC_A", 50)
    rel_A = rel_manager.get_relationship("Player", "NPC_A")
    print(f"Player's relationship with NPC_A: Value={rel_A.value}, Attitude={rel_A.attitude}")

    # Player interacts negatively with NPC_B
    print("\n--- Player and NPC_B ---")
    rel_manager.update_relationship("Player", "NPC_B", -40)
    rel_B = rel_manager.get_relationship("Player", "NPC_B")
    print(f"Player's relationship with NPC_B: Value={rel_B.value}, Attitude={rel_B.attitude}")

    rel_manager.update_relationship("Player", "NPC_B", -50)
    rel_B = rel_manager.get_relationship("Player", "NPC_B")
    print(f"Player's relationship with NPC_B: Value={rel_B.value}, Attitude={rel_B.attitude}")

    # NPC_A and NPC_B have a hostile relationship
    print("\n--- NPC_A and NPC_B ---")
    rel_manager.set_relationship("NPC_A", "NPC_B", -80)
    rel_AB = rel_manager.get_relationship("NPC_A", "NPC_B")
    print(f"NPC_A's relationship with NPC_B: Value={rel_AB.value}, Attitude={rel_AB.attitude}")

    # Get all relationships for Player
    print("\n--- All Player Relationships ---")
    player_rels = rel_manager.get_all_relationships_for_source("Player")
    for target, rel in player_rels.items():
        print(f"  With {target}: Value={rel.value}, Attitude={rel.attitude}")