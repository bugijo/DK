from typing import Dict
from dataclasses import dataclass

@dataclass
class Currency:
    gold: int = 0
    silver: int = 0
    copper: int = 0

    def to_copper(self) -> int:
        return self.gold * 1000 + self.silver * 100 + self.copper

    def from_copper(self, total_copper: int) -> None:
        self.gold = total_copper // 1000
        remaining_copper = total_copper % 1000
        self.silver = remaining_copper // 100
        self.copper = remaining_copper % 100

    def add(self, other: 'Currency') -> 'Currency':
        total_copper = self.to_copper() + other.to_copper()
        new_currency = Currency()
        new_currency.from_copper(total_copper)
        return new_currency

    def subtract(self, other: 'Currency') -> 'Currency':
        total_copper = self.to_copper() - other.to_copper()
        if total_copper < 0:
            raise ValueError("Insufficient funds")
        new_currency = Currency()
        new_currency.from_copper(total_copper)
        return new_currency

    def __str__(self):
        parts = []
        if self.gold > 0: parts.append(f"{self.gold} gp")
        if self.silver > 0: parts.append(f"{self.silver} sp")
        if self.copper > 0: parts.append(f"{self.copper} cp")
        return ", ".join(parts) if parts else "0 cp"

class EconomyManager:
    def __init__(self):
        self.exchange_rates: Dict[str, int] = {
            "gold": 1000,
            "silver": 100,
            "copper": 1
        }

    def convert_to_copper(self, amount: int, currency_type: str) -> int:
        rate = self.exchange_rates.get(currency_type.lower())
        if rate is None:
            raise ValueError(f"Unknown currency type: {currency_type}")
        return amount * rate

    def convert_from_copper(self, total_copper: int, target_currency_type: str) -> float:
        rate = self.exchange_rates.get(target_currency_type.lower())
        if rate is None:
            raise ValueError(f"Unknown currency type: {target_currency_type}")
        return total_copper / rate

    def get_item_price(self, item_value_in_copper: int) -> Currency:
        price = Currency()
        price.from_copper(item_value_in_copper)
        return price

# Exemplo de uso
if __name__ == "__main__":
    wallet = Currency(gold=1, silver=5, copper=25)
    print(f"Wallet: {wallet}")
    print(f"Total copper: {wallet.to_copper()} cp")

    cost = Currency(silver=12, copper=50)
    print(f"Cost: {cost}")

    try:
        new_wallet = wallet.subtract(cost)
        print(f"New wallet after purchase: {new_wallet}")
    except ValueError as e:
        print(e)

    economy = EconomyManager()
    item_price_copper = 750 # 7 silver, 50 copper
    item_price = economy.get_item_price(item_price_copper)
    print(f"Item price: {item_price}")

    converted_gold = economy.convert_from_copper(1250, "gold")
    print(f"1250 copper is {converted_gold} gold")