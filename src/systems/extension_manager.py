import logging

class ExtensionManager:
    def __init__(self):
        self.loaded_extensions = {}

    def load_extension(self, extension_name, extension_path):
        """Carrega uma extensão a partir de um caminho especificado.
        Args:
            extension_name (str): Nome da extensão.
            extension_path (str): Caminho para a extensão.
        Returns:
            bool: True se carregou com sucesso, False caso contrário.
        """
        try:
            logging.info(f"Carregando extensão: {extension_name} de {extension_path}")
            self.loaded_extensions[extension_name] = {"path": extension_path, "active": True}
            return True
        except Exception as e:
            logging.error(f"Erro ao carregar extensão {extension_name}: {e}")
            return False

    def unload_extension(self, extension_name):
        """Descarrega uma extensão ativa.
        Args:
            extension_name (str): Nome da extensão.
        Returns:
            bool: True se descarregou, False caso contrário.
        """
        if extension_name in self.loaded_extensions:
            del self.loaded_extensions[extension_name]
            logging.info(f"Extensão {extension_name} descarregada.")
            return True
        return False

    def get_active_extensions(self):
        """Retorna uma lista das extensões atualmente carregadas.
        Returns:
            list: Lista de nomes das extensões ativas.
        """
        return list(self.loaded_extensions.keys())

    def apply_customization(self, customization_data):
        """Aplica dados de customização fornecidos por extensões.
        Args:
            customization_data (dict): Dados de customização.
        """
        logging.info(f"Aplicando customização: {customization_data}")
        # Lógica para integrar a customização ao sistema principal
        pass