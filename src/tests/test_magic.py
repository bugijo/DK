import unittest
from src.systems.magic.spell import Spell, SpellSchool, SpellType, CastType, TargetType, Element, SpellEffect, SpellRequirement
from src.systems.magic.spellbook import SpellBook, SpellSlot
from src.systems.magic.elemental import ElementalSystem, ElementalInteraction
from src.systems.magic.magic_abilities import MagicAbility, MagicAbilityType, MagicAbilityManager
from src.systems.magic.magic_effects import MagicEffect, MagicEffectType
from src.systems.character.character import Character # Assuming Character class for testing
from src.systems.combat.status_effect import StatusEffect, StatusEffectType
from dataclasses import dataclass, field
from typing import Dict, Any, Optional

# Mock Character class for testing purposes
class MockCharacter:
    def __init__(self, name, hp, mana, intelligence, level):
        self.name = name
        self.current_hp = hp
        self.current_mana = mana
        self.stats = {'intelligence': intelligence, 'level': level}
        self.active_status_effects = {}

    def get_stat(self, stat_name):
        return self.stats.get(stat_name, 0)

    def heal(self, amount):
        self.current_hp += amount

    def take_damage(self, amount):
        self.current_hp -= amount

    def modify_stat(self, stat_name, value):
        self.stats[stat_name] = self.stats.get(stat_name, 0) + value

    def apply_status_effect(self, status_effect):
        self.active_status_effects[status_effect.name] = status_effect

    def remove_status_effect(self, effect_name):
        if effect_name in self.active_status_effects:
            del self.active_status_effects[effect_name]


class TestMagic(unittest.TestCase):

    def setUp(self):
        self.player = MockCharacter("Player", 100, 50, 15, 7)
        self.enemy = MockCharacter("Enemy", 50, 0, 8, 3)

        self.fireball_effect = SpellEffect(
            name="Fire Damage",
            description="Deals fire damage.",
            stat_modifiers={'hp': -20},
            element=Element.FIRE
        )
        self.fireball_req = SpellRequirement(min_intelligence=10, min_level=5)
        self.fireball = Spell(
            name="Fireball",
            description="Launches a fiery projectile.",
            school=SpellSchool.EVOCATION,
            spell_type=SpellType.OFFENSIVE,
            cast_type=CastType.ACTION,
            target_type=TargetType.SINGLE,
            mana_cost=10,
            cooldown=2,
            effects=[self.fireball_effect],
            requirements=self.fireball_req
        )

        self.heal_effect = SpellEffect(
            name="Healing",
            description="Restores health.",
            stat_modifiers={'hp': 30}
        )
        self.heal_spell = Spell(
            name="Cure Wounds",
            description="Heals a target.",
            school=SpellSchool.ABJURATION,
            spell_type=SpellType.SUPPORT,
            cast_type=CastType.ACTION,
            target_type=TargetType.SINGLE,
            mana_cost=8,
            effects=[self.heal_effect]
        )

        self.spellbook = SpellBook()
        self.spellbook.add_spell(self.fireball)
        self.spellbook.add_spell(self.heal_spell)

    def test_spell_casting(self):
        # Test successful cast
        initial_enemy_hp = self.enemy.current_hp
        self.assertTrue(self.fireball.can_cast(self.player))
        self.fireball.cast(self.player, self.enemy)
        self.assertEqual(self.player.current_mana, 40) # 50 - 10
        self.assertEqual(self.enemy.current_hp, initial_enemy_hp - 20)
        self.assertEqual(self.fireball.current_cooldown, 2)

        # Test cast on cooldown
        self.assertFalse(self.fireball.can_cast(self.player))

        # Test insufficient mana
        self.player.current_mana = 0
        self.assertFalse(self.fireball.can_cast(self.player))

    def test_spellbook(self):
        self.assertIn(self.fireball, self.spellbook.get_known_spells())
        self.assertEqual(self.spellbook.get_spell("Fireball"), self.fireball)

        # Test spell slots (if implemented in SpellBook)
        self.spellbook.add_spell_slot(SpellSlot(level=1, total_slots=2))
        self.spellbook.use_spell_slot(1)
        self.assertEqual(self.spellbook.get_available_spell_slots(1), 1)

    def test_elemental_system(self):
        elemental_system = ElementalSystem()
        interaction = ElementalInteraction(Element.FIRE, Element.WATER, "Steam", "Deals extra damage.")
        elemental_system.add_interaction(interaction)
        self.assertEqual(elemental_system.get_interaction(Element.FIRE, Element.WATER), interaction)

    def test_magic_ability(self):
        mana_regen_effect = MagicEffect("Mana Regeneration", "", MagicEffectType.BUFF, stat_modifiers={'mana_regen': 5})
        mana_aura = MagicAbility(
            name="Mana Aura",
            description="Passively regenerates mana.",
            ability_type=MagicAbilityType.PASSIVE,
            mana_cost=0,
            effects=[mana_regen_effect]
        )
        
        initial_mana = self.player.current_mana
        mana_aura.use(self.player) # Passive abilities might be 'used' to apply their initial effect
        # Assuming mana_regen_effect modifies mana_regen stat, not current_mana directly in this mock
        # For a real test, you'd check if the effect was applied to the character's status effects or stats

        # Test cooldown reduction
        fireball_ability = MagicAbility(
            name="Fireball Ability",
            description="",
            ability_type=MagicAbilityType.ACTIVE,
            mana_cost=20,
            cooldown=3,
            effects=[]
        )
        fireball_ability.use(self.player)
        self.assertEqual(fireball_ability.current_cooldown, 3)
        fireball_ability.reduce_cooldown()
        self.assertEqual(fireball_ability.current_cooldown, 2)

    def test_magic_effects(self):
        heal_effect_obj = MagicEffect(
            name="Minor Heal",
            description="Restores a small amount of health.",
            effect_type=MagicEffectType.HEAL,
            value=20
        )
        initial_hp = self.player.current_hp
        heal_effect_obj.apply(self.player)
        self.assertEqual(self.player.current_hp, initial_hp + 20)

        poison_status = StatusEffect(
            name="Poisoned",
            description="Takes damage over time.",
            effect_type=StatusEffectType.DOT,
            duration=2,
            value=5
        )
        poison_debuff_obj = MagicEffect(
            name="Poison Cloud",
            description="Applies poison to target.",
            effect_type=MagicEffectType.DEBUFF,
            status_effect_to_apply=poison_status
        )
        poison_debuff_obj.apply(self.enemy)
        self.assertIn("Poisoned", self.enemy.active_status_effects)

if __name__ == '__main__':
    unittest.main()