class ProgressionSystem:
    def __init__(self):
        self.skill_trees = {}
        self.achievements = []
        self.rankings = {}

    def add_skill_tree(self, name, tree_data):
        self.skill_trees[name] = tree_data

    def unlock_skill(self, character, skill_id):
        # Lógica para desbloquear uma habilidade para um personagem
        pass

    def grant_achievement(self, character, achievement_id):
        # Lógica para conceder um achievement a um personagem
        pass

    def update_ranking(self, character, score):
        # Lógica para atualizar o ranking de um personagem
        pass

    def get_character_progress(self, character):
        # Retorna o progresso de um personagem (habilidades desbloqueadas, achievements, etc.)
        pass