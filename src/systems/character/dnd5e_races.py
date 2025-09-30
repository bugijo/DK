from typing import Dict, List, Optional
from dataclasses import dataclass, field
from enum import Enum, auto

class Race(Enum):
    HUMAN = "human"
    ELF = "elf"
    DWARF = "dwarf"
    HALFLING = "halfling"
    DRAGONBORN = "dragonborn"
    GNOME = "gnome"
    HALF_ELF = "half_elf"
    HALF_ORC = "half_orc"
    TIEFLING = "tiefling"

class Size(Enum):
    TINY = "tiny"
    SMALL = "small"
    MEDIUM = "medium"
    LARGE = "large"
    HUGE = "huge"
    GARGANTUAN = "gargantuan"

@dataclass
class RacialTrait:
    """Representa uma característica racial."""
    name: str
    description: str
    level_requirement: int = 1

@dataclass
class AbilityScoreIncrease:
    """Aumento de atributo racial."""
    ability: str
    increase: int

@dataclass
class DnD5eRace:
    """Representa uma raça de D&D 5e."""
    name: str
    ability_score_increases: List[AbilityScoreIncrease]
    size: Size
    speed: int
    languages: List[str]
    proficiencies: List[str] = field(default_factory=list)
    traits: List[RacialTrait] = field(default_factory=list)
    subraces: List[str] = field(default_factory=list)
    darkvision: int = 0  # Alcance em pés, 0 se não tiver
    extra_languages: int = 0  # Idiomas adicionais à escolha
    extra_skills: int = 0  # Perícias adicionais à escolha

# Definições das raças

def create_human() -> DnD5eRace:
    """Cria a raça Humano."""
    traits = [
        RacialTrait(
            "Versatility", 
            "Humanos são adaptáveis e versáteis, ganhando uma perícia adicional à escolha."
        )
    ]
    
    return DnD5eRace(
        name="Human",
        ability_score_increases=[
            AbilityScoreIncrease("strength", 1),
            AbilityScoreIncrease("dexterity", 1),
            AbilityScoreIncrease("constitution", 1),
            AbilityScoreIncrease("intelligence", 1),
            AbilityScoreIncrease("wisdom", 1),
            AbilityScoreIncrease("charisma", 1)
        ],
        size=Size.MEDIUM,
        speed=30,
        languages=["Common"],
        traits=traits,
        extra_languages=1,
        extra_skills=1
    )

def create_elf() -> DnD5eRace:
    """Cria a raça Elfo."""
    traits = [
        RacialTrait(
            "Keen Senses", 
            "Proficiência na perícia Percepção."
        ),
        RacialTrait(
            "Fey Ancestry", 
            "Vantagem em testes de resistência contra ser enfeitiçado, e magia não pode colocá-lo para dormir."
        ),
        RacialTrait(
            "Trance", 
            "Elfos não precisam dormir. Em vez disso, meditam profundamente por 4 horas por dia."
        )
    ]
    
    return DnD5eRace(
        name="Elf",
        ability_score_increases=[
            AbilityScoreIncrease("dexterity", 2)
        ],
        size=Size.MEDIUM,
        speed=30,
        languages=["Common", "Elvish"],
        proficiencies=["Perception"],
        traits=traits,
        darkvision=60,
        subraces=["High Elf", "Wood Elf", "Dark Elf (Drow)"]
    )

def create_dwarf() -> DnD5eRace:
    """Cria a raça Anão."""
    traits = [
        RacialTrait(
            "Dwarven Resilience", 
            "Vantagem em testes de resistência contra veneno, e resistência a dano de veneno."
        ),
        RacialTrait(
            "Dwarven Combat Training", 
            "Proficiência com machados de batalha, machadinhas, martelos leves e martelos de guerra."
        ),
        RacialTrait(
            "Stonecunning", 
            "Sempre que fizer um teste de Inteligência (História) relacionado à origem de trabalho em pedra, adicione o dobro do bônus de proficiência."
        )
    ]
    
    return DnD5eRace(
        name="Dwarf",
        ability_score_increases=[
            AbilityScoreIncrease("constitution", 2)
        ],
        size=Size.MEDIUM,
        speed=25,
        languages=["Common", "Dwarvish"],
        proficiencies=["Battleaxe", "Handaxe", "Light Hammer", "Warhammer"],
        traits=traits,
        darkvision=60,
        subraces=["Hill Dwarf", "Mountain Dwarf"]
    )

def create_halfling() -> DnD5eRace:
    """Cria a raça Halfling."""
    traits = [
        RacialTrait(
            "Lucky", 
            "Quando rolar um 1 natural em uma rolagem de ataque, teste de habilidade ou teste de resistência, pode rolar novamente e deve usar o novo resultado."
        ),
        RacialTrait(
            "Brave", 
            "Vantagem em testes de resistência contra ser amedrontado."
        ),
        RacialTrait(
            "Halfling Nimbleness", 
            "Pode mover-se através do espaço de qualquer criatura de tamanho Médio ou maior."
        )
    ]
    
    return DnD5eRace(
        name="Halfling",
        ability_score_increases=[
            AbilityScoreIncrease("dexterity", 2)
        ],
        size=Size.SMALL,
        speed=25,
        languages=["Common", "Halfling"],
        traits=traits,
        subraces=["Lightfoot", "Stout"]
    )

def create_dragonborn() -> DnD5eRace:
    """Cria a raça Draconato."""
    traits = [
        RacialTrait(
            "Draconic Ancestry", 
            "Escolha um tipo de dragão. Isso determina sua arma de sopro e resistência a dano."
        ),
        RacialTrait(
            "Breath Weapon", 
            "Pode usar sua ação para exalar energia destrutiva. Cada criatura na área deve fazer um teste de resistência (CD = 8 + modificador de CON + bônus de proficiência)."
        ),
        RacialTrait(
            "Damage Resistance", 
            "Resistência ao tipo de dano associado à sua ancestralidade dracônica."
        )
    ]
    
    return DnD5eRace(
        name="Dragonborn",
        ability_score_increases=[
            AbilityScoreIncrease("strength", 2),
            AbilityScoreIncrease("charisma", 1)
        ],
        size=Size.MEDIUM,
        speed=30,
        languages=["Common", "Draconic"],
        traits=traits
    )

def create_gnome() -> DnD5eRace:
    """Cria a raça Gnomo."""
    traits = [
        RacialTrait(
            "Gnome Cunning", 
            "Vantagem em todos os testes de resistência de Inteligência, Sabedoria e Carisma contra magia."
        )
    ]
    
    return DnD5eRace(
        name="Gnome",
        ability_score_increases=[
            AbilityScoreIncrease("intelligence", 2)
        ],
        size=Size.SMALL,
        speed=25,
        languages=["Common", "Gnomish"],
        traits=traits,
        darkvision=60,
        subraces=["Forest Gnome", "Rock Gnome"]
    )

def create_half_elf() -> DnD5eRace:
    """Cria a raça Meio-elfo."""
    traits = [
        RacialTrait(
            "Fey Ancestry", 
            "Vantagem em testes de resistência contra ser enfeitiçado, e magia não pode colocá-lo para dormir."
        ),
        RacialTrait(
            "Skill Versatility", 
            "Proficiência em duas perícias à sua escolha."
        )
    ]
    
    return DnD5eRace(
        name="Half-Elf",
        ability_score_increases=[
            AbilityScoreIncrease("charisma", 2)
            # +1 em dois outros atributos à escolha
        ],
        size=Size.MEDIUM,
        speed=30,
        languages=["Common", "Elvish"],
        traits=traits,
        darkvision=60,
        extra_languages=1,
        extra_skills=2
    )

def create_half_orc() -> DnD5eRace:
    """Cria a raça Meio-orc."""
    traits = [
        RacialTrait(
            "Relentless Endurance", 
            "Quando reduzido a 0 pontos de vida mas não morto, pode cair para 1 ponto de vida. Uma vez por descanso longo."
        ),
        RacialTrait(
            "Savage Attacks", 
            "Quando marcar um acerto crítico com um ataque corpo a corpo, pode rolar um dos dados de dano da arma mais uma vez e adicioná-lo ao dano extra do crítico."
        )
    ]
    
    return DnD5eRace(
        name="Half-Orc",
        ability_score_increases=[
            AbilityScoreIncrease("strength", 2),
            AbilityScoreIncrease("constitution", 1)
        ],
        size=Size.MEDIUM,
        speed=30,
        languages=["Common", "Orc"],
        proficiencies=["Intimidation"],
        traits=traits,
        darkvision=60
    )

def create_tiefling() -> DnD5eRace:
    """Cria a raça Tiefling."""
    traits = [
        RacialTrait(
            "Hellish Resistance", 
            "Resistência a dano de fogo."
        ),
        RacialTrait(
            "Infernal Legacy", 
            "Conhece o truque thaumaturgy. Quando alcançar o 3º nível, pode conjurar hellish rebuke uma vez por dia. Quando alcançar o 5º nível, pode conjurar darkness uma vez por dia. Carisma é sua habilidade de conjuração."
        )
    ]
    
    return DnD5eRace(
        name="Tiefling",
        ability_score_increases=[
            AbilityScoreIncrease("intelligence", 1),
            AbilityScoreIncrease("charisma", 2)
        ],
        size=Size.MEDIUM,
        speed=30,
        languages=["Common", "Infernal"],
        traits=traits,
        darkvision=60
    )

# Dicionário com todas as raças
DND5E_RACES = {
    Race.HUMAN: create_human(),
    Race.ELF: create_elf(),
    Race.DWARF: create_dwarf(),
    Race.HALFLING: create_halfling(),
    Race.DRAGONBORN: create_dragonborn(),
    Race.GNOME: create_gnome(),
    Race.HALF_ELF: create_half_elf(),
    Race.HALF_ORC: create_half_orc(),
    Race.TIEFLING: create_tiefling()
}

def get_race_info(race: Race) -> DnD5eRace:
    """Retorna informações sobre uma raça específica."""
    return DND5E_RACES.get(race)

def apply_racial_bonuses(race: Race, base_abilities: Dict[str, int]) -> Dict[str, int]:
    """Aplica os bônus raciais aos atributos base."""
    race_info = get_race_info(race)
    if not race_info:
        return base_abilities
    
    modified_abilities = base_abilities.copy()
    
    for bonus in race_info.ability_score_increases:
        if bonus.ability in modified_abilities:
            modified_abilities[bonus.ability] += bonus.increase
    
    return modified_abilities

def get_racial_traits(race: Race, level: int = 1) -> List[RacialTrait]:
    """Retorna todas as características raciais disponíveis no nível especificado."""
    race_info = get_race_info(race)
    if not race_info:
        return []
    
    return [trait for trait in race_info.traits if trait.level_requirement <= level]

def get_racial_proficiencies(race: Race) -> List[str]:
    """Retorna todas as proficiências concedidas pela raça."""
    race_info = get_race_info(race)
    if not race_info:
        return []
    
    return race_info.proficiencies

def get_racial_languages(race: Race) -> List[str]:
    """Retorna todos os idiomas conhecidos pela raça."""
    race_info = get_race_info(race)
    if not race_info:
        return []
    
    return race_info.languages

def has_darkvision(race: Race) -> tuple[bool, int]:
    """Retorna se a raça tem visão no escuro e o alcance."""
    race_info = get_race_info(race)
    if not race_info:
        return False, 0
    
    return race_info.darkvision > 0, race_info.darkvision

def get_movement_speed(race: Race) -> int:
    """Retorna a velocidade de movimento da raça."""
    race_info = get_race_info(race)
    if not race_info:
        return 30  # Velocidade padrão
    
    return race_info.speed

def get_size_category(race: Race) -> Size:
    """Retorna a categoria de tamanho da raça."""
    race_info = get_race_info(race)
    if not race_info:
        return Size.MEDIUM  # Tamanho padrão
    
    return race_info.size