import unittest
from unittest.mock import Mock

# Mocking Quest related classes as they are in TypeScript in the provided structure
class MockQuest:
    def __init__(self, quest_id, name, description, objectives, rewards):
        self.quest_id = quest_id
        self.name = name
        self.description = description
        self.objectives = objectives
        self.rewards = rewards
        self.is_completed = False

    def complete_objective(self, objective_id):
        for obj in self.objectives:
            if obj.objective_id == objective_id:
                obj.complete()
                break
        self.check_completion()

    def check_completion(self):
        self.is_completed = all(obj.is_completed for obj in self.objectives)
        return self.is_completed

class MockQuestObjective:
    def __init__(self, objective_id, description, target_count=1):
        self.objective_id = objective_id
        self.description = description
        self.target_count = target_count
        self.current_count = 0
        self.is_completed = False

    def progress(self, amount=1):
        self.current_count += amount
        if self.current_count >= self.target_count:
            self.is_completed = True

    def complete(self):
        self.is_completed = True

class MockQuestReward:
    def __init__(self, reward_id, description, value):
        self.reward_id = reward_id
        self.description = description
        self.value = value

    def apply_reward(self, character):
        # Logic to apply reward to character
        pass

class MockQuestManager:
    def __init__(self):
        self.quests = {}

    def add_quest(self, quest):
        self.quests[quest.quest_id] = quest

    def get_quest(self, quest_id):
        return self.quests.get(quest_id)

    def complete_quest(self, quest_id, character):
        quest = self.get_quest(quest_id)
        if quest and quest.is_completed:
            for reward in quest.rewards:
                reward.apply_reward(character)
            return True
        return False

class TestQuests(unittest.TestCase):
    def setUp(self):
        self.quest_manager = MockQuestManager()
        self.mock_character = Mock()
        self.mock_character.name = "Player"

        self.objective1 = MockQuestObjective("obj1", "Collect 5 items", 5)
        self.objective2 = MockQuestObjective("obj2", "Defeat 3 enemies", 3)
        self.reward1 = MockQuestReward("rew1", "Gain 100 XP", 100)

        self.quest1 = MockQuest("quest1", "The First Quest", "A simple quest.",
                                  [self.objective1, self.objective2], [self.reward1])
        self.quest_manager.add_quest(self.quest1)

    def test_quest_addition(self):
        self.assertIsNotNone(self.quest_manager.get_quest("quest1"))

    def test_objective_progress(self):
        self.objective1.progress(3)
        self.assertEqual(self.objective1.current_count, 3)
        self.assertFalse(self.objective1.is_completed)
        self.objective1.progress(2)
        self.assertEqual(self.objective1.current_count, 5)
        self.assertTrue(self.objective1.is_completed)

    def test_quest_completion(self):
        self.assertFalse(self.quest1.is_completed)
        self.objective1.complete()
        self.objective2.complete()
        self.assertTrue(self.quest1.check_completion())

    def test_complete_quest_with_rewards(self):
        self.objective1.complete()
        self.objective2.complete()
        self.quest1.check_completion()

        # Mock the apply_reward method to check if it's called
        self.reward1.apply_reward = Mock()

        self.assertTrue(self.quest_manager.complete_quest("quest1", self.mock_character))
        self.reward1.apply_reward.assert_called_once_with(self.mock_character)

if __name__ == '__main__':
    unittest.main()