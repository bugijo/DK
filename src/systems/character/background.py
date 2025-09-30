from typing import List, Dict
from dataclasses import dataclass, field

@dataclass
class Background:
    name: str
    description: str
    skill_proficiencies: List[str] = field(default_factory=list)
    tool_proficiencies: List[str] = field(default_factory=list)
    languages: List[str] = field(default_factory=list)
    equipment: List[str] = field(default_factory=list)
    feature_name: str = ""
    feature_description: str = ""

# Exemplo de antecedentes (apenas para demonstração)
ACOLYTE = Background(
    name="Acolyte",
    description="You have spent your life in the service of a temple or other religious institution.",
    skill_proficiencies=["Insight", "Religion"],
    languages=["Two languages of your choice"],
    equipment=["A holy symbol", "a prayer book or prayer wheel", "5 sticks of incense", "vestments", "a set of common clothes", "15 gp"],
    feature_name="Shelter of the Faithful",
    feature_description="As an acolyte, you command the respect of those who share your faith, and you can perform the religious ceremonies of your deity. You and your adventuring companions can expect to receive free healing and care at a temple, shrine, or other established presence of your faith, though you must provide any material components for spells. Those who share your religion will support you (and only you) at a modest lifestyle."
)

CRIMINAL = Background(
    name="Criminal",
    description="You are an experienced criminal with a history of breaking the law.",
    skill_proficiencies=["Deception", "Stealth"],
    tool_proficiencies=["One type of gaming set", "Thieves' tools"],
    equipment=["A crowbar", "a set of dark common clothes including a hood", "a belt pouch containing 15 gp"],
    feature_name="Criminal Contact",
    feature_description="You have a reliable and trustworthy contact who acts as your liaison to a network of other criminals. You know who to go to for the information you need as well as a safe haven."
)

FOLK_HERO = Background(
    name="Folk Hero",
    description="You are a champion of the common people, who rose from humble beginnings to perform a great deed.",
    skill_proficiencies=["Animal Handling", "Survival"],
    tool_proficiencies=["One type of artisan's tools", "Vehicles (land)"],
    equipment=["A set of artisan's tools (one of your choice)", "a shovel", "an iron pot", "a set of common clothes", "a belt pouch containing 10 gp"],
    feature_name="Rustic Hospitality",
    feature_description="Since you come from the ranks of the common folk, you fit in among them with ease. You can find a place to hide, rest, or recuperate among other commoners, unless you have shown yourself to be a danger to them. They will shield you from the law or anyone else searching for you, though they will not risk their lives for you."
)

NOBLE = Background(
    name="Noble",
    description="You understand wealth, power, and privilege. You carry a noble title, and your family owns land and has influence.",
    skill_proficiencies=["History", "Persuasion"],
    tool_proficiencies=["One type of gaming set"],
    languages=["One language of your choice"],
    equipment=["A set of fine clothes", "a signet ring", "a scroll of pedigree", "a purse containing 25 gp"],
    feature_name="Position of Privilege",
    feature_description="Thanks to your noble birth, people are inclined to think the best of you. You are welcome in high society, and people assume you have the right to be wherever you are. The common folk make every effort to accommodate you and avoid your displeasure."
)

SAGE = Background(
    name="Sage",
    description="You are a scholar, tutored in a wide array of subjects.",
    skill_proficiencies=["Arcana", "History"],
    languages=["Two languages of your choice"],
    equipment=["A bottle of black ink", "a quill", "a small knife", "a letter from a dead colleague posing a question you have not yet been able to answer", "a set of common clothes", "10 gp"],
    feature_name="Researcher",
    feature_description="When you attempt to learn or recall a piece of lore, if you do not already know that information, you often know where and from whom you can obtain it. Usually, this information comes from a library, scriptorium, university, or a sage or other learned individual or creature."
)

SOLDIER = Background(
    name="Soldier",
    description="War has been your life for as long as you care to remember.",
    skill_proficiencies=["Athletics", "Intimidation"],
    tool_proficiencies=["One type of gaming set", "Vehicles (land)"],
    equipment=["An insignia of rank", "a trophy taken from a fallen enemy (a dagger, broken blade, or piece of a banner)", "a set of bone dice or a deck of cards", "a set of common clothes", "a belt pouch containing 10 gp"],
    feature_name="Military Rank",
    feature_description="You have a military rank from your career as a soldier. Soldiers loyal to your former military organization still recognize your authority and influence, and they defer to you if they are of a lower rank. You can invoke your rank to exert influence over other soldiers and requisition simple equipment or horses for temporary use. You can also usually gain access to friendly military encampments and fortresses where your rank is recognized."
)