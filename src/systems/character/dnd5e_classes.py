from typing import Dict, List, Optional
from dataclasses import dataclass, field
from enum import Enum, auto

class CharacterClass(Enum):
    FIGHTER = "fighter"
    WIZARD = "wizard"
    ROGUE = "rogue"
    CLERIC = "cleric"
    RANGER = "ranger"
    PALADIN = "paladin"
    BARBARIAN = "barbarian"
    BARD = "bard"
    DRUID = "druid"
    MONK = "monk"
    SORCERER = "sorcerer"
    WARLOCK = "warlock"

class HitDie(Enum):
    D6 = 6
    D8 = 8
    D10 = 10
    D12 = 12

@dataclass
class ClassFeature:
    """Representa uma habilidade de classe."""
    name: str
    description: str
    level: int
    uses_per_rest: Optional[int] = None
    rest_type: str = "long"  # "short" ou "long"

@dataclass
class SpellcastingInfo:
    """Informações sobre conjuração de magias."""
    spellcasting_ability: str  # "intelligence", "wisdom", "charisma"
    spell_slots_by_level: Dict[int, List[int]] = field(default_factory=dict)
    spells_known: Optional[List[int]] = None
    cantrips_known: List[int] = field(default_factory=list)
    ritual_casting: bool = False
    spellbook: bool = False

@dataclass
class DnD5eClass:
    """Representa uma classe de D&D 5e."""
    name: str
    hit_die: HitDie
    primary_ability: List[str]
    saving_throw_proficiencies: List[str]
    skill_proficiencies: List[str]
    skill_choices: int
    armor_proficiencies: List[str]
    weapon_proficiencies: List[str]
    tool_proficiencies: List[str]
    equipment: List[str]
    features_by_level: Dict[int, List[ClassFeature]] = field(default_factory=dict)
    spellcasting: Optional[SpellcastingInfo] = None

# Definições das classes

def create_fighter() -> DnD5eClass:
    """Cria a classe Guerreiro."""
    features = {
        1: [
            ClassFeature("Fighting Style", "Escolha um estilo de luta", 1),
            ClassFeature("Second Wind", "Recupere 1d10 + nível de guerreiro PV", 1, 1, "short")
        ],
        2: [
            ClassFeature("Action Surge", "Ação adicional no turno", 2, 1, "short")
        ],
        3: [
            ClassFeature("Martial Archetype", "Escolha um arquétipo marcial", 3)
        ],
        4: [
            ClassFeature("Ability Score Improvement", "Aumente atributos ou escolha talento", 4)
        ],
        5: [
            ClassFeature("Extra Attack", "Ataque adicional quando usar ação Atacar", 5)
        ],
        6: [
            ClassFeature("Ability Score Improvement", "Aumente atributos ou escolha talento", 6)
        ],
        9: [
            ClassFeature("Indomitable", "Refaça um teste de resistência falhado", 9, 1, "long")
        ],
        11: [
            ClassFeature("Extra Attack (2)", "Terceiro ataque quando usar ação Atacar", 11)
        ],
        20: [
            ClassFeature("Extra Attack (3)", "Quarto ataque quando usar ação Atacar", 20)
        ]
    }
    
    return DnD5eClass(
        name="Fighter",
        hit_die=HitDie.D10,
        primary_ability=["strength", "dexterity"],
        saving_throw_proficiencies=["strength", "constitution"],
        skill_proficiencies=["acrobatics", "animal_handling", "athletics", "history", "insight", "intimidation", "perception", "survival"],
        skill_choices=2,
        armor_proficiencies=["light", "medium", "heavy", "shields"],
        weapon_proficiencies=["simple", "martial"],
        tool_proficiencies=[],
        equipment=["chain_mail", "shield", "martial_weapon", "light_crossbow", "explorers_pack"],
        features_by_level=features
    )

def create_wizard() -> DnD5eClass:
    """Cria a classe Mago."""
    spellcasting = SpellcastingInfo(
        spellcasting_ability="intelligence",
        spell_slots_by_level={
            1: [2], 2: [3], 3: [4, 2], 4: [4, 3], 5: [4, 3, 2],
            6: [4, 3, 3], 7: [4, 3, 3, 1], 8: [4, 3, 3, 2], 9: [4, 3, 3, 3, 1],
            10: [4, 3, 3, 3, 2], 11: [4, 3, 3, 3, 2, 1], 12: [4, 3, 3, 3, 2, 1],
            13: [4, 3, 3, 3, 2, 1, 1], 14: [4, 3, 3, 3, 2, 1, 1],
            15: [4, 3, 3, 3, 2, 1, 1, 1], 16: [4, 3, 3, 3, 2, 1, 1, 1],
            17: [4, 3, 3, 3, 2, 1, 1, 1, 1], 18: [4, 3, 3, 3, 3, 1, 1, 1, 1],
            19: [4, 3, 3, 3, 3, 2, 1, 1, 1], 20: [4, 3, 3, 3, 3, 2, 2, 1, 1]
        },
        cantrips_known=[3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
        ritual_casting=True,
        spellbook=True
    )
    
    features = {
        1: [
            ClassFeature("Spellcasting", "Conjure magias usando Inteligência", 1),
            ClassFeature("Arcane Recovery", "Recupere espaços de magia em descanso curto", 1, 1, "long")
        ],
        2: [
            ClassFeature("Arcane Tradition", "Escolha uma tradição arcana", 2)
        ],
        4: [
            ClassFeature("Ability Score Improvement", "Aumente atributos ou escolha talento", 4)
        ],
        18: [
            ClassFeature("Spell Mastery", "Conjure magias de 1º e 2º nível à vontade", 18)
        ],
        20: [
            ClassFeature("Signature Spells", "Duas magias de 3º nível sempre preparadas", 20)
        ]
    }
    
    return DnD5eClass(
        name="Wizard",
        hit_die=HitDie.D6,
        primary_ability=["intelligence"],
        saving_throw_proficiencies=["intelligence", "wisdom"],
        skill_proficiencies=["arcana", "history", "insight", "investigation", "medicine", "religion"],
        skill_choices=2,
        armor_proficiencies=[],
        weapon_proficiencies=["daggers", "darts", "slings", "quarterstaffs", "light_crossbows"],
        tool_proficiencies=[],
        equipment=["quarterstaff", "component_pouch", "scholars_pack", "spellbook"],
        features_by_level=features,
        spellcasting=spellcasting
    )

def create_rogue() -> DnD5eClass:
    """Cria a classe Ladino."""
    features = {
        1: [
            ClassFeature("Expertise", "Dobre bônus de proficiência em 2 perícias", 1),
            ClassFeature("Sneak Attack", "Dano extra em ataques furtivos (1d6)", 1)
        ],
        2: [
            ClassFeature("Thieves' Cant", "Linguagem secreta dos ladinos", 2),
            ClassFeature("Cunning Action", "Correr, Esquivar ou Esconder como ação bônus", 2)
        ],
        3: [
            ClassFeature("Roguish Archetype", "Escolha um arquétipo de ladino", 3),
            ClassFeature("Sneak Attack", "Dano extra em ataques furtivos (2d6)", 3)
        ],
        4: [
            ClassFeature("Ability Score Improvement", "Aumente atributos ou escolha talento", 4)
        ],
        5: [
            ClassFeature("Uncanny Dodge", "Reduza dano pela metade como reação", 5),
            ClassFeature("Sneak Attack", "Dano extra em ataques furtivos (3d6)", 5)
        ],
        6: [
            ClassFeature("Expertise", "Dobre bônus de proficiência em mais 2 perícias", 6)
        ],
        7: [
            ClassFeature("Evasion", "Sem dano em testes de Destreza bem-sucedidos", 7),
            ClassFeature("Sneak Attack", "Dano extra em ataques furtivos (4d6)", 7)
        ]
    }
    
    return DnD5eClass(
        name="Rogue",
        hit_die=HitDie.D8,
        primary_ability=["dexterity"],
        saving_throw_proficiencies=["dexterity", "intelligence"],
        skill_proficiencies=["acrobatics", "athletics", "deception", "insight", "intimidation", "investigation", "perception", "performance", "persuasion", "sleight_of_hand", "stealth"],
        skill_choices=4,
        armor_proficiencies=["light"],
        weapon_proficiencies=["simple", "hand_crossbows", "longswords", "rapiers", "shortswords"],
        tool_proficiencies=["thieves_tools"],
        equipment=["rapier", "shortbow", "burglar_pack", "leather_armor", "thieves_tools"],
        features_by_level=features
    )

def create_cleric() -> DnD5eClass:
    """Cria a classe Clérigo."""
    spellcasting = SpellcastingInfo(
        spellcasting_ability="wisdom",
        spell_slots_by_level={
            1: [2], 2: [3], 3: [4, 2], 4: [4, 3], 5: [4, 3, 2],
            6: [4, 3, 3], 7: [4, 3, 3, 1], 8: [4, 3, 3, 2], 9: [4, 3, 3, 3, 1],
            10: [4, 3, 3, 3, 2], 11: [4, 3, 3, 3, 2, 1], 12: [4, 3, 3, 3, 2, 1],
            13: [4, 3, 3, 3, 2, 1, 1], 14: [4, 3, 3, 3, 2, 1, 1],
            15: [4, 3, 3, 3, 2, 1, 1, 1], 16: [4, 3, 3, 3, 2, 1, 1, 1],
            17: [4, 3, 3, 3, 2, 1, 1, 1, 1], 18: [4, 3, 3, 3, 3, 1, 1, 1, 1],
            19: [4, 3, 3, 3, 3, 2, 1, 1, 1], 20: [4, 3, 3, 3, 3, 2, 2, 1, 1]
        },
        cantrips_known=[3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
        ritual_casting=True
    )
    
    features = {
        1: [
            ClassFeature("Spellcasting", "Conjure magias usando Sabedoria", 1),
            ClassFeature("Divine Domain", "Escolha um domínio divino", 1)
        ],
        2: [
            ClassFeature("Channel Divinity", "Canalize energia divina", 2, 1, "short"),
            ClassFeature("Turn Undead", "Afugente mortos-vivos", 2)
        ],
        4: [
            ClassFeature("Ability Score Improvement", "Aumente atributos ou escolha talento", 4)
        ],
        5: [
            ClassFeature("Destroy Undead (CR 1/2)", "Destrua mortos-vivos fracos", 5)
        ],
        6: [
            ClassFeature("Channel Divinity (2/rest)", "Use Channel Divinity duas vezes", 6)
        ],
        10: [
            ClassFeature("Divine Intervention", "Peça ajuda direta da divindade", 10, 1, "long")
        ]
    }
    
    return DnD5eClass(
        name="Cleric",
        hit_die=HitDie.D8,
        primary_ability=["wisdom"],
        saving_throw_proficiencies=["wisdom", "charisma"],
        skill_proficiencies=["history", "insight", "medicine", "persuasion", "religion"],
        skill_choices=2,
        armor_proficiencies=["light", "medium", "shields"],
        weapon_proficiencies=["simple"],
        tool_proficiencies=[],
        equipment=["scale_mail", "shield", "mace", "light_crossbow", "priests_pack"],
        features_by_level=features,
        spellcasting=spellcasting
    )

# Dicionário com todas as classes
DND5E_CLASSES = {
    CharacterClass.FIGHTER: create_fighter(),
    CharacterClass.WIZARD: create_wizard(),
    CharacterClass.ROGUE: create_rogue(),
    CharacterClass.CLERIC: create_cleric()
}

def get_class_info(character_class: CharacterClass) -> DnD5eClass:
    """Retorna informações sobre uma classe específica."""
    return DND5E_CLASSES.get(character_class)

def get_class_features(character_class: CharacterClass, level: int) -> List[ClassFeature]:
    """Retorna todas as habilidades de classe até o nível especificado."""
    class_info = get_class_info(character_class)
    if not class_info:
        return []
    
    features = []
    for lvl in range(1, level + 1):
        if lvl in class_info.features_by_level:
            features.extend(class_info.features_by_level[lvl])
    
    return features

def calculate_hit_points(character_class: CharacterClass, level: int, constitution_modifier: int) -> int:
    """Calcula os pontos de vida baseado na classe, nível e modificador de Constituição."""
    class_info = get_class_info(character_class)
    if not class_info:
        return 0
    
    # Primeiro nível: máximo do dado + CON
    hp = class_info.hit_die.value + constitution_modifier
    
    # Níveis subsequentes: média do dado + CON
    if level > 1:
        average_roll = (class_info.hit_die.value // 2) + 1
        hp += (level - 1) * (average_roll + constitution_modifier)
    
    return max(hp, level)  # Mínimo de 1 PV por nível

def get_proficiency_bonus(level: int) -> int:
    """Retorna o bônus de proficiência baseado no nível."""
    if level >= 17:
        return 6
    elif level >= 13:
        return 5
    elif level >= 9:
        return 4
    elif level >= 5:
        return 3
    else:
        return 2

def get_spell_slots(character_class: CharacterClass, level: int) -> List[int]:
    """Retorna os espaços de magia disponíveis para a classe e nível."""
    class_info = get_class_info(character_class)
    if not class_info or not class_info.spellcasting:
        return []
    
    return class_info.spellcasting.spell_slots_by_level.get(level, [])

def get_cantrips_known(character_class: CharacterClass, level: int) -> int:
    """Retorna o número de truques conhecidos para a classe e nível."""
    class_info = get_class_info(character_class)
    if not class_info or not class_info.spellcasting:
        return 0
    
    cantrips = class_info.spellcasting.cantrips_known
    if level <= len(cantrips):
        return cantrips[level - 1]
    return cantrips[-1] if cantrips else 0