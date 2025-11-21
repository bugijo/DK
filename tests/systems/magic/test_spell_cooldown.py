import pytest

from src.systems.magic.spell import (
    Spell,
    SpellEffect,
    EffectType,
    SpellLevel,
    SpellRequirement,
    SpellSchool,
    SpellType,
    TargetType,
    CastType,
    Element,
)


class DummyTarget:
    def __init__(self):
        self.hp = 100

    def take_damage(self, amount: int):
        self.hp -= amount


class DummyCaster:
    def __init__(self, mp: int = 10):
        self.stats = {"mp": mp}


def make_simple_spell(name: str, cooldown: float) -> Spell:
    effect = SpellEffect(
        name=f"{name} Damage",
        effect_type=EffectType.DAMAGE,
        target_type=TargetType.SINGLE,
        power=5,
        damage_type="arcane",
    )
    req = SpellRequirement(level=1, mana_cost=1, cooldown=cooldown)
    return Spell(
        name=name,
        level=SpellLevel.FIRST,
        school=SpellSchool.EVOCATION,
        casting_time="1 action",
        range_feet=30,
        duration="Instantaneous",
        components=[],
        description="",
        effects=[effect],
        ritual=False,
        concentration=False,
        spell_type=SpellType.ATTACK,
        cast_type=CastType.INSTANT,
        target_type=TargetType.SINGLE,
        element=Element.ARCANE,
        requirements=req,
    )


def test_cooldown_prevents_recast(monkeypatch):
    base_time = 1000.0

    # Patch interno do módulo para controle preciso de tempo
    monkeypatch.setattr("src.systems.magic.spell.time.time", lambda: base_time)

    caster = DummyCaster(mp=10)
    target = DummyTarget()
    spell = make_simple_spell("Arcane Bolt", cooldown=1.0)

    # Primeiro cast deve passar e registrar last_cast_time
    assert spell.cast(caster, [target]) is True
    assert spell.last_cast_time == base_time

    # Tentativa imediata deve falhar por cooldown
    assert spell.cast(caster, [target]) is False
    assert spell.is_on_cooldown(base_time) is True

    # Avança meio segundo: ainda em cooldown
    monkeypatch.setattr("src.systems.magic.spell.time.time", lambda: base_time + 0.5)
    assert spell.is_on_cooldown(base_time + 0.5) is True
    remaining = spell.get_remaining_cooldown(base_time + 0.5)
    assert pytest.approx(remaining, 0.001) == 0.5

    # Avança além do cooldown: pode conjurar novamente
    monkeypatch.setattr("src.systems.magic.spell.time.time", lambda: base_time + 1.01)
    assert spell.is_on_cooldown(base_time + 1.01) is False
    assert spell.cast(caster, [target]) is True


def test_remaining_cooldown_precision(monkeypatch):
    base_time = 2000.0
    monkeypatch.setattr("src.systems.magic.spell.time.time", lambda: base_time)

    caster = DummyCaster(mp=10)
    target = DummyTarget()
    spell = make_simple_spell("Precision", cooldown=1.5)

    assert spell.cast(caster, [target]) is True
    # Avança 0.3s
    now = base_time + 0.3
    assert spell.is_on_cooldown(now) is True
    remaining = spell.get_remaining_cooldown(now)
    assert pytest.approx(remaining, 0.001) == 1.2


def test_multiple_spells_independent_cooldowns(monkeypatch):
    base_time = 3000.0
    monkeypatch.setattr("src.systems.magic.spell.time.time", lambda: base_time)

    caster = DummyCaster(mp=10)
    target = DummyTarget()
    s1 = make_simple_spell("Alpha", cooldown=2.0)
    s2 = make_simple_spell("Beta", cooldown=1.0)

    assert s1.cast(caster, [target]) is True
    assert s2.cast(caster, [target]) is True

    # Ambos em cooldown imediatamente após o cast
    assert s1.is_on_cooldown(base_time) is True
    assert s2.is_on_cooldown(base_time) is True

    # Avança 1.05s: Beta deve liberar, Alpha ainda não
    monkeypatch.setattr("src.systems.magic.spell.time.time", lambda: base_time + 1.05)
    assert s2.is_on_cooldown(base_time + 1.05) is False
    assert s1.is_on_cooldown(base_time + 1.05) is True

    # Recast Beta com sucesso
    assert s2.cast(caster, [target]) is True