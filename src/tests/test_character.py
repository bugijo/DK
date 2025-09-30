import unittest
from src.systems.character.character import Character
from src.systems.character.race import Race
from src.systems.character.dnd_class import DnDClass
from src.systems.character.background import Background
from src.systems.character.feat import Feat

class TestCharacter(unittest.TestCase):

    def setUp(self):
        self.human_race = Race(
            name="Human",
            description="Versatile and ambitious.",
            ability_score_bonuses={
                "strength": 1, "dexterity": 1, "constitution": 1,
                "intelligence": 1, "wisdom": 1, "charisma": 1
            },
            languages=["Common", "One extra language of your choice"]
        )
        self.fighter_class = DnDClass(
            name="Fighter",
            description="A master of martial combat, skilled with a variety of weapons and armor.",
            hit_die=10,
            primary_ability=["strength", "dexterity"],
            saving_throw_proficiencies=["strength", "constitution"],
            skill_proficiencies_choice=2,
            skill_proficiencies_options=["Acrobatics", "Animal Handling", "Athletics", "History", "Insight", "Intimidation", "Perception", "Survival"],
            starting_equipment=["Chain mail", "longsword", "shield", "light crossbow and 20 bolts", "dungeoneer's pack"],
            features_by_level={
                1: ["Fighting Style", "Second Wind"],
            }
        )
        self.acolyte_background = Background(
            name="Acolyte",
            description="You have spent your life in the service of a temple or other religious institution.",
            skill_proficiencies=["Insight", "Religion"],
            languages=["Two languages of your choice"],
            equipment=["A holy symbol", "a prayer book or prayer wheel", "5 sticks of incense", "vestments", "a set of common clothes", "15 gp"],
            feature_name="Shelter of the Faithful",
            feature_description="As an acolyte, you command the respect of those who share your faith, and you can perform the religious ceremonies of your deity."
        )
        self.alert_feat = Feat(
            name="Alert",
            description="Always on the lookout for danger.",
            prerequisites={},
            effects=["Gain +5 bonus to initiative", "Cannot be surprised while conscious"]
        )

    def test_character_creation(self):
        char = Character("Test Character")
        self.assertEqual(char.name, "Test Character")
        self.assertEqual(char.level, 1)
        self.assertEqual(char.experience, 0)
        self.assertIn('strength', char.stats)

    def test_stat_modification(self):
        char = Character("Test Character")
        initial_strength = char.get_stat('strength')
        char.modify_stat('strength', 2)
        self.assertEqual(char.get_stat('strength'), initial_strength + 2)

    def test_health_management(self):
        char = Character("Test Character")
        char.take_damage(5)
        self.assertEqual(char.stats['hp'], 5)
        char.heal(3)
        self.assertEqual(char.stats['hp'], 8)
        char.take_damage(20)
        self.assertEqual(char.stats['hp'], 0)
        self.assertFalse(char.is_alive())

    def test_mana_management(self):
        char = Character("Test Character")
        char.use_mana(5)
        self.assertEqual(char.stats['mp'], 5)
        self.assertTrue(char.use_mana(5))
        self.assertEqual(char.stats['mp'], 0)
        self.assertFalse(char.use_mana(1))

    def test_experience_and_level_up(self):
        char = Character("Test Character")
        char.add_experience(1000)
        self.assertEqual(char.level, 2)
        self.assertEqual(char.stats['max_hp'], 15) # 10 (initial) + 5 (level up)

    def test_inventory_management(self):
        char = Character("Test Character")
        item = type('Item', (object,), {'name': 'Sword'})()
        char.add_to_inventory(item)
        self.assertTrue(char.has_item('Sword'))
        removed_item = char.remove_from_inventory('Sword')
        self.assertEqual(removed_item.name, 'Sword')
        self.assertFalse(char.has_item('Sword'))

    def test_equipment_management(self):
        char = Character("Test Character")
        sword = type('Item', (object,), {'name': 'Sword'})()
        shield = type('Item', (object,), {'name': 'Shield'})()
        char.equip_item('main_hand', sword)
        self.assertEqual(char.equipment['main_hand'].name, 'Sword')
        char.equip_item('off_hand', shield)
        self.assertEqual(char.equipment['off_hand'].name, 'Shield')
        unequipped_sword = char.unequip_item('main_hand')
        self.assertEqual(unequipped_sword.name, 'Sword')
        self.assertNotIn('main_hand', char.equipment)
        self.assertTrue(char.has_item('Sword')) # Should be back in inventory

    def test_ability_management(self):
        char = Character("Test Character")
        ability = type('Ability', (object,), {'name': 'Fireball'})()
        char.add_ability('Fireball', ability)
        self.assertTrue(char.has_ability('Fireball'))
        removed_ability = char.remove_ability('Fireball')
        self.assertEqual(removed_ability.name, 'Fireball')
        self.assertFalse(char.has_ability('Fireball'))

    def test_status_effect_management(self):
        char = Character("Test Character")
        effect = type('Effect', (object,), {'name': 'Poisoned'})()
        char.add_status_effect('Poisoned', effect)
        self.assertTrue(char.has_status_effect('Poisoned'))
        removed_effect = char.remove_status_effect('Poisoned')
        self.assertEqual(removed_effect.name, 'Poisoned')
        self.assertFalse(char.has_status_effect('Poisoned'))

    def test_race_application(self):
        char = Character("Test Character", race=self.human_race)
        # Assuming initial stats are 10, human adds +1 to all
        self.assertEqual(char.get_stat('strength'), 11)
        self.assertEqual(char.get_stat('dexterity'), 11)
        self.assertEqual(char.get_stat('constitution'), 11)
        self.assertEqual(char.get_stat('intelligence'), 11)
        self.assertEqual(char.get_stat('wisdom'), 11)
        self.assertEqual(char.get_stat('charisma'), 11)

    def test_class_assignment(self):
        char = Character("Test Character", dnd_class=self.fighter_class)
        self.assertEqual(char.dnd_class.name, "Fighter")

    def test_background_assignment(self):
        char = Character("Test Character", background=self.acolyte_background)
        self.assertEqual(char.background.name, "Acolyte")

    def test_feat_assignment(self):
        char = Character("Test Character", feats=[self.alert_feat])
        self.assertEqual(len(char.feats), 1)
        self.assertEqual(char.feats[0].name, "Alert")

if __name__ == '__main__':
    unittest.main()