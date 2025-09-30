import unittest
from unittest.mock import Mock
from src.systems.campaign.progression_system import ProgressionSystem

class TestProgression(unittest.TestCase):
    def setUp(self):
        self.progression_system = ProgressionSystem()
        self.mock_character = Mock()
        self.mock_character.name = "Player"
        self.mock_character.unlocked_skills = []
        self.mock_character.achievements = []
        self.mock_character.score = 0

    def test_add_skill_tree(self):
        tree_data = {"skill1": {}, "skill2": {}}
        self.progression_system.add_skill_tree("Combat", tree_data)
        self.assertIn("Combat", self.progression_system.skill_trees)
        self.assertEqual(self.progression_system.skill_trees["Combat"], tree_data)

    def test_unlock_skill(self):
        # Mocking the character's method to unlock skills
        self.mock_character.unlock_skill = Mock()
        self.progression_system.unlock_skill(self.mock_character, "double_strike")
        self.mock_character.unlock_skill.assert_called_once_with("double_strike")

    def test_grant_achievement(self):
        # Mocking the character's method to grant achievements
        self.mock_character.grant_achievement = Mock()
        self.progression_system.grant_achievement(self.mock_character, "first_kill")
        self.mock_character.grant_achievement.assert_called_once_with("first_kill")

    def test_update_ranking(self):
        # Mocking the character's method to update score
        self.mock_character.update_score = Mock()
        self.progression_system.update_ranking(self.mock_character, 100)
        self.mock_character.update_score.assert_called_once_with(100)

    def test_get_character_progress(self):
        # Mocking the character's method to get progress
        self.mock_character.get_progress_info = Mock(return_value={
            "unlocked_skills": ["skill_a"],
            "achievements": ["ach_b"],
            "score": 500
        })
        progress = self.progression_system.get_character_progress(self.mock_character)
        self.assertEqual(progress["score"], 500)

if __name__ == '__main__':
    unittest.main()