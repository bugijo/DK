import unittest
from src.systems.inventory.item import Item, ItemType, ItemRarity, ItemEffect, EquipmentSlot
from src.systems.inventory.inventory import Inventory, InventorySlot
from src.systems.inventory.consumable import Consumable, ConsumableType, ConsumableEffect
from src.systems.inventory.equipment import Equipment
from src.systems.inventory.crafting import CraftingManager, Recipe
from src.systems.inventory.economy import Currency, EconomyManager
from src.systems.character.character import Character # Assuming Character class for testing requirements

class TestInventory(unittest.TestCase):

    def setUp(self):
        self.inventory = Inventory(capacity=10)
        self.character = Character("TestChar", stats={'strength': 10, 'dexterity': 10})
        self.sword = Item(
            name="Short Sword",
            description="A basic sword.",
            item_type=ItemType.WEAPON,
            rarity=ItemRarity.COMMON,
            weight=2.0,
            value=100,
            durability=100,
            max_durability=100,
            requirements={'strength': 8}
        )
        self.potion = Consumable(
            name="Healing Potion",
            description="Restores health.",
            item_type=ItemType.CONSUMABLE,
            rarity=ItemRarity.COMMON,
            weight=0.1,
            value=50,
            consumable_type=ConsumableType.POTION,
            effects=[ConsumableEffect("Heal", stat_modifiers={'hp': 20})],
            stackable=True,
            max_stack=5
        )
        self.gold_coin = Item(
            name="Gold Coin",
            description="A shiny gold coin.",
            item_type=ItemType.TREASURE,
            rarity=ItemRarity.COMMON,
            weight=0.01,
            value=1000,
            stackable=True,
            max_stack=999
        )

    def test_add_item(self):
        self.assertTrue(self.inventory.add_item(self.sword))
        self.assertEqual(self.inventory.get_total_items(), 1)
        self.assertIn(self.sword, self.inventory.items)

    def test_add_stackable_item(self):
        self.assertTrue(self.inventory.add_item(self.potion))
        self.assertTrue(self.inventory.add_item(self.potion))
        self.assertEqual(self.inventory.get_total_items(), 1) # Should stack into one slot
        self.assertEqual(self.potion.current_stack, 2)

    def test_remove_item(self):
        self.inventory.add_item(self.sword)
        self.assertTrue(self.inventory.remove_item(self.sword))
        self.assertEqual(self.inventory.get_total_items(), 0)
        self.assertNotIn(self.sword, self.inventory.items)

    def test_inventory_capacity(self):
        for i in range(10):
            self.inventory.add_item(Item(f"Item{i}", "", ItemType.MATERIAL, ItemRarity.COMMON, 1.0, 1))
        self.assertFalse(self.inventory.add_item(Item("Overflow Item", "", ItemType.MATERIAL, ItemRarity.COMMON, 1.0, 1)))
        self.assertEqual(self.inventory.get_total_items(), 10)

    def test_item_durability(self):
        initial_durability = self.sword.durability
        self.sword.use_durability()
        self.assertEqual(self.sword.durability, initial_durability - 1)
        self.sword.repair(5)
        self.assertEqual(self.sword.durability, initial_durability - 1 + 5)
        self.sword.durability = 1 # Set to 1 for next test
        self.sword.use_durability()
        self.assertFalse(self.sword.use_durability()) # Should return False if durability is 0 or less

    def test_item_weight(self):
        self.inventory.add_item(self.sword)
        self.inventory.add_item(self.potion)
        self.assertEqual(self.inventory.get_total_weight(), self.sword.weight + self.potion.weight)

    def test_item_requirements(self):
        self.assertTrue(self.sword.meets_requirements(self.character))
        self.character.stats['strength'] = 5
        self.assertFalse(self.sword.meets_requirements(self.character))

    def test_crafting_manager(self):
        crafting_manager = CraftingManager()
        recipe = Recipe(
            name="Simple Bandage",
            description="Heals a small amount.",
            output_item=Consumable("Simple Bandage", "", ItemType.CONSUMABLE, ItemRarity.COMMON, 0.1, 10, ConsumableType.POTION, [ConsumableEffect("Heal", stat_modifiers={'hp': 5})]),
            ingredients={self.gold_coin.name: 2},
            crafting_time=1
        )
        crafting_manager.add_recipe(recipe)
        self.assertIn(recipe, crafting_manager.get_available_recipes(self.inventory))

        # Test crafting with insufficient ingredients
        self.assertFalse(crafting_manager.craft_item(recipe, self.inventory))

        # Add ingredients and test crafting
        self.inventory.add_item(self.gold_coin)
        self.inventory.add_item(self.gold_coin)
        self.assertTrue(crafting_manager.craft_item(recipe, self.inventory))
        self.assertEqual(self.inventory.get_total_items(), 1) # Bandage should be in inventory, gold coins removed

    def test_currency_conversion(self):
        currency = Currency(gold=1, silver=2, copper=3)
        self.assertEqual(currency.to_copper(), 1203)
        new_currency = Currency()
        new_currency.from_copper(1203)
        self.assertEqual(new_currency.gold, 1)
        self.assertEqual(new_currency.silver, 2)
        self.assertEqual(new_currency.copper, 3)

    def test_currency_arithmetic(self):
        wallet1 = Currency(gold=1, silver=5, copper=25)
        wallet2 = Currency(silver=12, copper=50)
        sum_wallet = wallet1.add(wallet2)
        self.assertEqual(sum_wallet.to_copper(), wallet1.to_copper() + wallet2.to_copper())

        sub_wallet = wallet1.subtract(Currency(copper=10))
        self.assertEqual(sub_wallet.to_copper(), wallet1.to_copper() - 10)

        with self.assertRaises(ValueError):
            wallet1.subtract(Currency(gold=100))

    def test_economy_manager(self):
        economy = EconomyManager()
        self.assertEqual(economy.convert_to_copper(1, "gold"), 1000)
        self.assertEqual(economy.convert_from_copper(1000, "silver"), 10.0)

        item_value_copper = 750 # 7 silver, 50 copper
        item_price = economy.get_item_price(item_value_copper)
        self.assertEqual(item_price.silver, 7)
        self.assertEqual(item_price.copper, 50)

if __name__ == '__main__':
    unittest.main()