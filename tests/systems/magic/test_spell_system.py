import pytest
from src.systems.magic.spell import (
    Spell,
    SpellComponent,
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
from src.systems.magic.spell_system import SpellSystem
from src.systems.character.character import Character

@pytest.fixture
def spell_system():
    return SpellSystem()

@pytest.fixture
def test_character():
    return Character(
        name="Test Wizard",
        stats={
            "strength": 10,
            "dexterity": 14,
            "constitution": 12,
            "intelligence": 16,
            "wisdom": 13,
            "charisma": 8,
            "hp": 20,
            "max_hp": 20,
            "mp": 15,
            "max_mp": 15
        },
        level=3,
        experience=900
    )

@pytest.fixture
def fireball_spell():
    effect = SpellEffect(
        name="Fireball Damage",
        effect_type=EffectType.DAMAGE,
        target_type=TargetType.AREA,
        damage_dice="8d6",
        damage_type="fire",
        area_size=20,
        save_ability="dexterity",
        save_dc=15
    )
    
    return Spell(
        name="Fireball",
        level=SpellLevel.THIRD,
        school=SpellSchool.EVOCATION,
        casting_time="1 action",
        range_feet=150,
        duration="Instantaneous",
        components=[SpellComponent.VERBAL, SpellComponent.SOMATIC, SpellComponent.MATERIAL],
        material_components="A tiny ball of bat guano and sulfur",
        description="A bright streak flashes from your pointing finger to a point you choose within range and then blossoms with a low roar into an explosion of flame.",
        effects=[effect],
        ritual=False,
        concentration=False
    )

@pytest.fixture
def healing_spell():
    effect = SpellEffect(
        name="Cure Wounds",
        effect_type=EffectType.HEALING,
        target_type=TargetType.SINGLE,
        healing_dice="1d8",
        healing_modifier=3
    )
    
    return Spell(
        name="Cure Wounds",
        level=SpellLevel.FIRST,
        school=SpellSchool.EVOCATION,
        casting_time="1 action",
        range_feet=0,  # Touch
        duration="Instantaneous",
        components=[SpellComponent.VERBAL, SpellComponent.SOMATIC],
        description="A creature you touch regains a number of hit points.",
        effects=[effect],
        ritual=False,
        concentration=False
    )

@pytest.fixture
def cantrip_spell():
    effect = SpellEffect(
        name="Fire Bolt Damage",
        effect_type=EffectType.DAMAGE,
        target_type=TargetType.SINGLE,
        damage_dice="1d10",
        damage_type="fire"
    )
    
    return Spell(
        name="Fire Bolt",
        level=SpellLevel.CANTRIP,
        school=SpellSchool.EVOCATION,
        casting_time="1 action",
        range_feet=120,
        duration="Instantaneous",
        components=[SpellComponent.VERBAL, SpellComponent.SOMATIC],
        description="You hurl a mote of fire at a creature or object within range.",
        effects=[effect],
        ritual=False,
        concentration=False
    )

def test_spell_creation(fireball_spell):
    """Testa a criação de uma magia."""
    assert fireball_spell.name == "Fireball"
    assert fireball_spell.level == SpellLevel.THIRD
    assert fireball_spell.school == SpellSchool.EVOCATION
    assert len(fireball_spell.effects) == 1
    assert fireball_spell.effects[0].damage_dice == "8d6"

def test_spell_system_add_spell(spell_system, fireball_spell):
    """Testa adicionar uma magia ao sistema."""
    spell_system.add_spell(fireball_spell)
    assert "Fireball" in spell_system.spells
    assert spell_system.get_spell("Fireball") == fireball_spell

def test_spell_system_get_spells_by_level(spell_system, fireball_spell, healing_spell, cantrip_spell):
    """Testa buscar magias por nível."""
    spell_system.add_spell(fireball_spell)
    spell_system.add_spell(healing_spell)
    spell_system.add_spell(cantrip_spell)
    
    cantrips = spell_system.get_spells_by_level(SpellLevel.CANTRIP)
    first_level = spell_system.get_spells_by_level(SpellLevel.FIRST)
    third_level = spell_system.get_spells_by_level(SpellLevel.THIRD)
    
    assert len(cantrips) == 1
    assert cantrips[0].name == "Fire Bolt"
    assert len(first_level) == 1
    assert first_level[0].name == "Cure Wounds"
    assert len(third_level) == 1
    assert third_level[0].name == "Fireball"

def test_spell_system_get_spells_by_school(spell_system, fireball_spell, healing_spell):
    """Testa buscar magias por escola."""
    spell_system.add_spell(fireball_spell)
    spell_system.add_spell(healing_spell)
    
    evocation_spells = spell_system.get_spells_by_school(SpellSchool.EVOCATION)
    assert len(evocation_spells) == 2
    
    spell_names = [spell.name for spell in evocation_spells]
    assert "Fireball" in spell_names
    assert "Cure Wounds" in spell_names

def test_cantrip_no_spell_slot_cost(spell_system, cantrip_spell, test_character):
    """Testa que truques não consomem espaços de magia."""
    spell_system.add_spell(cantrip_spell)
    
    initial_mp = test_character.stats["mp"]
    
    # Truques não devem consumir MP
    can_cast = spell_system.can_cast_spell(test_character, "Fire Bolt")
    assert can_cast
    
    # Simula conjuração (truques não consomem recursos)
    result = spell_system.cast_spell(test_character, "Fire Bolt")
    assert result["success"]
    assert test_character.stats["mp"] == initial_mp

def test_spell_slot_consumption(spell_system, fireball_spell, test_character):
    """Testa que magias de nível consomem espaços de magia."""
    spell_system.add_spell(fireball_spell)
    
    initial_mp = test_character.stats["mp"]
    
    # Verifica se pode conjurar
    can_cast = spell_system.can_cast_spell(test_character, "Fireball")
    assert can_cast
    
    # Conjura a magia (deve consumir MP)
    result = spell_system.cast_spell(test_character, "Fireball")
    assert result["success"]
    
    # MP deve ter diminuído (custo de magia de 3º nível)
    expected_cost = 3  # Nível da magia
    assert test_character.stats["mp"] == initial_mp - expected_cost

def test_insufficient_mana(spell_system, fireball_spell, test_character):
    """Testa conjuração com MP insuficiente."""
    spell_system.add_spell(fireball_spell)
    
    # Reduz MP para menos que o necessário
    test_character.stats["mp"] = 2
    
    can_cast = spell_system.can_cast_spell(test_character, "Fireball")
    assert not can_cast
    
    result = spell_system.cast_spell(test_character, "Fireball")
    assert not result["success"]
    assert "insufficient mana" in result["message"].lower()

def test_spell_effect_damage(fireball_spell):
    """Testa o efeito de dano de uma magia."""
    effect = fireball_spell.effects[0]
    
    assert effect.effect_type == EffectType.DAMAGE
    assert effect.damage_dice == "8d6"
    assert effect.damage_type == "fire"
    assert effect.target_type == TargetType.AREA
    assert effect.area_size == 20

def test_spell_effect_healing(healing_spell):
    """Testa o efeito de cura de uma magia."""
    effect = healing_spell.effects[0]
    
    assert effect.effect_type == EffectType.HEALING
    assert effect.healing_dice == "1d8"
    assert effect.healing_modifier == 3
    assert effect.target_type == TargetType.SINGLE

def test_spell_components(fireball_spell, healing_spell, cantrip_spell):
    """Testa os componentes das magias."""
    # Fireball tem todos os componentes
    assert SpellComponent.VERBAL in fireball_spell.components
    assert SpellComponent.SOMATIC in fireball_spell.components
    assert SpellComponent.MATERIAL in fireball_spell.components
    assert fireball_spell.material_components is not None
    
    # Cure Wounds só tem V e S
    assert SpellComponent.VERBAL in healing_spell.components
    assert SpellComponent.SOMATIC in healing_spell.components
    assert SpellComponent.MATERIAL not in healing_spell.components
    
    # Fire Bolt só tem V e S
    assert SpellComponent.VERBAL in cantrip_spell.components
    assert SpellComponent.SOMATIC in cantrip_spell.components
    assert SpellComponent.MATERIAL not in cantrip_spell.components

def test_spell_schools():
    """Testa as escolas de magia."""
    schools = list(SpellSchool)
    expected_schools = [
        SpellSchool.ABJURATION,
        SpellSchool.CONJURATION,
        SpellSchool.DIVINATION,
        SpellSchool.ENCHANTMENT,
        SpellSchool.EVOCATION,
        SpellSchool.ILLUSION,
        SpellSchool.NECROMANCY,
        SpellSchool.TRANSMUTATION
    ]
    
    for school in expected_schools:
        assert school in schools

def test_spell_levels():
    """Testa os níveis de magia."""
    levels = list(SpellLevel)
    expected_levels = [
        SpellLevel.CANTRIP,
        SpellLevel.FIRST,
        SpellLevel.SECOND,
        SpellLevel.THIRD,
        SpellLevel.FOURTH,
        SpellLevel.FIFTH,
        SpellLevel.SIXTH,
        SpellLevel.SEVENTH,
        SpellLevel.EIGHTH,
        SpellLevel.NINTH
    ]
    
    for level in expected_levels:
        assert level in levels

def test_concentration_spells(spell_system):
    """Testa magias que requerem concentração."""
    concentration_effect = SpellEffect(
        name="Hold Person",
        effect_type=EffectType.CONDITION,
        target_type=TargetType.SINGLE,
        condition="paralyzed",
        duration=60  # 1 minuto
    )
    
    hold_person = Spell(
        name="Hold Person",
        level=SpellLevel.SECOND,
        school=SpellSchool.ENCHANTMENT,
        casting_time="1 action",
        range_feet=60,
        duration="Concentration, up to 1 minute",
        components=[SpellComponent.VERBAL, SpellComponent.SOMATIC, SpellComponent.MATERIAL],
        material_components="A small, straight piece of iron",
        description="Choose a humanoid that you can see within range.",
        effects=[concentration_effect],
        ritual=False,
        concentration=True
    )
    
    spell_system.add_spell(hold_person)
    
    assert hold_person.concentration
    assert hold_person.effects[0].condition == "paralyzed"

def test_ritual_spells(spell_system):
    """Testa magias que podem ser conjuradas como ritual."""
    ritual_effect = SpellEffect(
        name="Detect Magic",
        effect_type=EffectType.DETECTION,
        target_type=TargetType.SELF,
        detection_type="magic",
        duration=600  # 10 minutos
    )
    
    detect_magic = Spell(
        name="Detect Magic",
        level=SpellLevel.FIRST,
        school=SpellSchool.DIVINATION,
        casting_time="1 action",
        range_feet=0,  # Self
        duration="Concentration, up to 10 minutes",
        components=[SpellComponent.VERBAL, SpellComponent.SOMATIC],
        description="For the duration, you sense the presence of magic within 30 feet of you.",
        effects=[ritual_effect],
        ritual=True,
        concentration=True
    )
    
    spell_system.add_spell(detect_magic)
    
    assert detect_magic.ritual
    assert detect_magic.concentration

def test_upcast_spell(spell_system, healing_spell, test_character):
    """Testa conjurar uma magia em nível superior."""
    spell_system.add_spell(healing_spell)
    
    # Conjura Cure Wounds no 2º nível (upcast)
    result = spell_system.cast_spell(test_character, "Cure Wounds", spell_level=2)
    
    assert result["success"]
    # Deve consumir MP equivalente ao nível usado (2º nível)
    assert result["mana_cost"] == 2

def test_spell_save_dc_calculation(spell_system, fireball_spell, test_character):
    """Testa o cálculo da CD de resistência de magias."""
    spell_system.add_spell(fireball_spell)
    
    # CD = 8 + bônus de proficiência + modificador de habilidade
    # Nível 3 = +2 proficiência, INT 16 = +3 modificador
    expected_dc = 8 + 2 + 3  # 13
    
    dc = spell_system.calculate_spell_save_dc(test_character, "intelligence")
    assert dc == expected_dc