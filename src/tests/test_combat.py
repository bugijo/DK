import unittest
from src.systems.character.character import Character
from src.systems.combat.combat_state import CombatState, CombatAction, CombatPhase
from src.systems.combat.combat_round import CombatRound, ActionType
from src.systems.combat.initiative import Initiative
from src.systems.combat.condition import ConditionManager
from src.systems.combat.damage_type import DamageTypeManager
from src.systems.combat.ability_effect import AbilityEffectManager
from src.systems.combat.combat_environment import CombatEnvironmentManager, CoverType, TerrainFeature, CombatOpportunity, CombatCombo

class TestCombat(unittest.TestCase):

    def setUp(self):
        self.char1 = Character("Hero", stats={'hp': 100, 'max_hp': 100, 'dexterity': 14})
        self.char2 = Character("Goblin", stats={'hp': 50, 'max_hp': 50, 'dexterity': 12})
        self.combat_state = CombatState()
        self.combat_round = CombatRound(self.combat_state)
        self.combat_env = CombatEnvironmentManager()

    def test_combat_state_start_end(self):
        self.combat_state.start_combat([self.char1, self.char2])
        self.assertEqual(self.combat_state.phase, CombatPhase.COMBAT)
        self.assertEqual(self.combat_state.round_number, 1)
        self.assertIn(self.char1, self.combat_state.participants)
        self.combat_state.end_combat()
        self.assertEqual(self.combat_state.phase, CombatPhase.ENDED)
        self.assertEqual(len(self.combat_state.participants), 0)

    def test_initiative_roll_and_next_turn(self):
        self.combat_state.start_combat([self.char1, self.char2])
        # Assuming random rolls, but checking if next_turn cycles
        first_char = self.combat_state.get_current_character()
        self.assertIsNotNone(first_char)
        next_char = self.combat_state.next_turn()
        self.assertIsNotNone(next_char)
        self.assertNotEqual(first_char, next_char) # Should be different if only two chars

    def test_combat_action_recording(self):
        self.combat_state.start_combat([self.char1, self.char2])
        action = CombatAction(actor=self.char1, target=self.char2, action_type="attack", damage_amount=10)
        self.combat_state.record_action(action)
        self.assertEqual(len(self.combat_state.get_action_history()), 1)
        self.assertEqual(self.combat_state.get_action_history()[0].actor.name, "Hero")

    def test_combat_round_action_usage(self):
        self.combat_state.start_combat([self.char1, self.char2])
        self.combat_round.start_round()
        self.assertTrue(self.combat_round.can_take_action(self.char1, ActionType.STANDARD))
        self.combat_round.use_action(self.char1, ActionType.STANDARD)
        self.assertFalse(self.combat_round.can_take_action(self.char1, ActionType.STANDARD))

    def test_combat_round_reaction_opportunity(self):
        self.combat_state.start_combat([self.char1, self.char2])
        self.combat_round.start_round()
        self.combat_round.register_reaction_opportunity(self.char2, "opportunity_attack")
        self.assertTrue(self.combat_round.can_react_to(self.char2, "opportunity_attack"))
        reaction_action = CombatAction(actor=self.char2, target=self.char1, action_type="reaction_attack")
        self.assertTrue(self.combat_round.process_reaction(self.char2, "opportunity_attack", reaction_action))
        self.assertFalse(self.combat_round.can_react_to(self.char2, "opportunity_attack")) # Reaction used

    def test_combat_environment_terrain(self):
        forest_terrain = TerrainFeature("Dense Forest", "Difficult terrain.", movement_cost_multiplier=2.0)
        self.combat_env.add_terrain_feature((0, 0), forest_terrain)
        retrieved_terrain = self.combat_env.get_terrain_at_position((0, 0))
        self.assertEqual(retrieved_terrain.name, "Dense Forest")
        self.assertEqual(retrieved_terrain.movement_cost_multiplier, 2.0)

    def test_combat_environment_cover(self):
        self.combat_env.set_cover((0, 0), (1, 1), CoverType.HALF)
        cover = self.combat_env.get_cover((0, 0), (1, 1))
        self.assertEqual(cover, CoverType.HALF)
        self.assertEqual(self.combat_env.get_cover((0,0), (2,2)), CoverType.NONE)

    def test_combat_environment_opportunity(self):
        opportunity_attack = CombatOpportunity("Opportunity Attack", "", "enemy_leaves_reach", "reaction_attack")
        self.combat_env.add_opportunity(opportunity_attack)
        opportunities = self.combat_env.get_opportunities_by_trigger("enemy_leaves_reach")
        self.assertEqual(len(opportunities), 1)
        self.assertEqual(opportunities[0].name, "Opportunity Attack")

    def test_combat_environment_combo(self):
        shove_attack_combo = CombatCombo("Shove and Attack", "", ["shove", "attack"], "advantage_on_attack")
        self.combat_env.add_combo(shove_attack_combo)
        combos = self.combat_env.get_combos_by_actions(["shove", "attack", "move"])
        self.assertEqual(len(combos), 1)
        self.assertEqual(combos[0].name, "Shove and Attack")

if __name__ == '__main__':
    unittest.main()