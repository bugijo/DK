from typing import List, Optional, Dict, Any
from src.systems.npc.npc import NPC
from src.systems.npc.dialogue import DialogueManager, DialogueNode
from src.systems.npc.faction_system import FactionManager, Faction
from src.systems.npc.quest_system import QuestManager, Quest
from src.systems.ai.AIBehavior import AIBehavior # Assuming AIBehavior exists
from src.systems.inventory.merchant import Merchant # Assuming Merchant exists

class NPCManager:
    def __init__(self, dialogue_manager: DialogueManager, faction_manager: FactionManager, quest_manager: QuestManager):
        self.npcs: Dict[str, NPC] = {}
        self.dialogue_manager = dialogue_manager
        self.faction_manager = faction_manager
        self.quest_manager = quest_manager

    def add_npc(self, npc: NPC) -> None:
        if npc.name in self.npcs:
            print(f"Warning: NPC with name {npc.name} already exists. Overwriting.")
        self.npcs[npc.name] = npc

    def get_npc(self, name: str) -> Optional[NPC]:
        return self.npcs.get(name)

    def remove_npc(self, name: str) -> bool:
        if name in self.npcs:
            del self.npcs[name]
            return True
        return False

    def initiate_dialogue(self, player_character: Any, npc_name: str) -> Optional[DialogueNode]:
        npc = self.get_npc(npc_name)
        if npc and npc.dialogue_tree:
            return self.dialogue_manager.start_dialogue(player_character, npc)
        print(f"No dialogue available for {npc_name}.")
        return None

    def assign_quest_to_npc(self, npc_name: str, quest: Quest) -> bool:
        npc = self.get_npc(npc_name)
        if npc:
            npc.add_quest(quest)
            return True
        return False

    def get_quests_from_npc(self, npc_name: str) -> List[Quest]:
        npc = self.get_npc(npc_name)
        if npc:
            return npc.get_available_quests()
        return []

    def update_npc_ai(self, npc_name: str, new_behavior: AIBehavior) -> bool:
        npc = self.get_npc(npc_name)
        if npc:
            npc.set_ai_behavior(new_behavior)
            return True
        return False

    def setup_merchant_for_npc(self, npc_name: str, merchant: Merchant) -> bool:
        npc = self.get_npc(npc_name)
        if npc:
            npc.set_merchant_data(merchant)
            return True
        return False

    def get_merchant_from_npc(self, npc_name: str) -> Optional[Merchant]:
        npc = self.get_npc(npc_name)
        if npc:
            return npc.get_merchant_data()
        return None

    def update_all_npcs(self, delta_time: float) -> None:
        for npc in self.npcs.values():
            npc.update(delta_time)

# Exemplo de uso (requer classes mockadas para DialogueManager, FactionManager, QuestManager, NPC, AIBehavior, Merchant)
if __name__ == "__main__":
    # Mock classes
    class MockDialogueManager:
        def start_dialogue(self, player, npc): return DialogueNode("Hello", [])

    class MockFactionManager:
        pass

    class MockQuestManager:
        pass

    class MockNPC:
        def __init__(self, name, dialogue_tree=None):
            self.name = name
            self.dialogue_tree = dialogue_tree
            self._quests = []
            self._ai_behavior = None
            self._merchant_data = None

        def add_quest(self, quest): self._quests.append(quest)
        def get_available_quests(self): return self._quests
        def set_ai_behavior(self, behavior): self._ai_behavior = behavior
        def set_merchant_data(self, merchant): self._merchant_data = merchant
        def get_merchant_data(self): return self._merchant_data
        def update(self, dt): pass

    class MockAIBehavior:
        pass

    class MockMerchant:
        pass

    class MockQuest:
        def __init__(self, name): self.name = name

    class MockPlayerCharacter:
        def __init__(self, name): self.name = name

    dialogue_mgr = MockDialogueManager()
    faction_mgr = MockFactionManager()
    quest_mgr = MockQuestManager()
    npc_manager = NPCManager(dialogue_mgr, faction_mgr, quest_mgr)

    # Create a simple dialogue tree
    dialogue_node_start = DialogueNode("Greetings, traveler!", [
        ("Tell me about this town.", DialogueNode("This town is peaceful.", [])),
        ("Goodbye.", None)
    ])

    # Create an NPC
    villager = MockNPC("Villager Bob", dialogue_tree=dialogue_node_start)
    npc_manager.add_npc(villager)

    # Test dialogue initiation
    player = MockPlayerCharacter("Hero")
    print("\n--- Initiating Dialogue ---")
    current_dialogue = npc_manager.initiate_dialogue(player, "Villager Bob")
    if current_dialogue:
        print(f"NPC: {current_dialogue.text}")

    # Test quest assignment
    print("\n--- Assigning Quest ---")
    fetch_quest = MockQuest("Fetch the Golden Apple")
    if npc_manager.assign_quest_to_npc("Villager Bob", fetch_quest):
        print(f"Quest '{fetch_quest.name}' assigned to Villager Bob.")
    print(f"Villager Bob's quests: {[q.name for q in npc_manager.get_quests_from_npc('Villager Bob')]}")

    # Test AI behavior update
    print("\n--- Updating AI Behavior ---")
    combat_ai = MockAIBehavior()
    if npc_manager.update_npc_ai("Villager Bob", combat_ai):
        print("Villager Bob's AI updated.")

    # Test merchant setup
    print("\n--- Setting up Merchant ---")
    shopkeeper_merchant = MockMerchant()
    if npc_manager.setup_merchant_for_npc("Villager Bob", shopkeeper_merchant):
        print("Villager Bob is now a merchant.")
    print(f"Villager Bob has merchant data: {npc_manager.get_merchant_from_npc('Villager Bob') is not None}")

    # Test NPC removal
    print("\n--- Removing NPC ---")
    if npc_manager.remove_npc("Villager Bob"):
        print("Villager Bob removed.")
    print(f"Villager Bob exists: {npc_manager.get_npc('Villager Bob') is not None}")