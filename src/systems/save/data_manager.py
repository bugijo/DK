import json
import logging

class DataManager:
    def __init__(self):
        pass

    def export_game_data(self, game_state, file_path):
        """Exporta o estado atual do jogo para um arquivo.
        Args:
            game_state (dict): Estado atual do jogo.
            file_path (str): Caminho do arquivo de destino.
        Returns:
            bool: True se exportou com sucesso, False caso contrário.
        """
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(game_state, f, ensure_ascii=False, indent=4)
            logging.info(f"Dados exportados com sucesso para {file_path}")
            return True
        except Exception as e:
            logging.error(f"Erro ao exportar dados: {e}")
            return False

    def import_game_data(self, file_path):
        """Importa o estado do jogo de um arquivo.
        Args:
            file_path (str): Caminho do arquivo de origem.
        Returns:
            dict|None: Estado do jogo importado ou None em caso de erro.
        """
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                game_state = json.load(f)
            logging.info(f"Dados importados com sucesso de {file_path}")
            return game_state
        except FileNotFoundError:
            logging.warning(f"Arquivo não encontrado: {file_path}")
            return None
        except json.JSONDecodeError:
            logging.error(f"Erro ao decodificar JSON do arquivo: {file_path}")
            return None
        except Exception as e:
            logging.error(f"Erro ao importar dados: {e}")
            return None