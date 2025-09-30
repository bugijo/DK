import unittest
from unittest.mock import Mock
from src.systems.npc.npc_manager import NPCManager
from src.systems.npc.relationship_system import RelationshipManager, Relationship

class TestNPC(unittest.TestCase):
    def setUp(self):
        self.npc_manager = NPCManager()
        self.relationship_manager = RelationshipManager()
        self.mock_character = Mock()
        self.mock_character.name = "Player"

    def test_add_npc(self):
        npc_id = "goblin_1"
        self.npc_manager.add_npc(npc_id, "Goblin", "A small goblin.")
        self.assertIn(npc_id, self.npc_manager.npcs)

    def test_remove_npc(self):
        npc_id = "goblin_1"
        self.npc_manager.add_npc(npc_id, "Goblin", "A small goblin.")
        self.npc_manager.remove_npc(npc_id)
        self.assertNotIn(npc_id, self.npc_manager.npcs)

    def test_start_dialogue(self):
        npc_id = "merchant_1"
        self.npc_manager.add_npc(npc_id, "Merchant", "A friendly merchant.")
        # Mocking dialogue system interaction
        self.npc_manager.start_dialogue(npc_id, self.mock_character)
        # Assertions would go here to check if dialogue system was called correctly

    def test_relationship_creation(self):
        entity1 = "Player"
        entity2 = "NPC_A"
        relationship = self.relationship_manager.get_relationship(entity1, entity2)
        self.assertIsInstance(relationship, Relationship)
        self.assertEqual(relationship.value, 0)
        self.assertEqual(relationship.attitude, "neutral")

    def test_relationship_modification(self):
        entity1 = "Player"
        entity2 = "NPC_B"
        self.relationship_manager.modify_relationship(entity1, entity2, 10)
        relationship = self.relationship_manager.get_relationship(entity1, entity2)
        self.assertEqual(relationship.value, 10)
        self.assertEqual(relationship.attitude, "friendly")

    def test_relationship_attitude_change(self):
        entity1 = "Player"
        entity2 = "NPC_C"
        self.relationship_manager.modify_relationship(entity1, entity2, -60)
        relationship = self.relationship_manager.get_relationship(entity1, entity2)
        self.assertEqual(relationship.attitude, "hostile")

if __name__ == '__main__':
    unittest.main()