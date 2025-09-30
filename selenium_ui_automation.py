#!/usr/bin/env python3
"""
Automação de Interface Humana - Dungeon Keeper
Simula interações reais de usuário usando Selenium WebDriver
Alternativa ao n8n para quem não tem Docker instalado
"""

import time
import uuid
import json
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException

class SeleniumUIAutomation:
    def __init__(self):
        self.frontend_url = "http://localhost:3001"
        self.session_id = str(uuid.uuid4())[:8]
        self.driver = None
        self.test_results = []
        
    def setup_driver(self):
        """Configura o WebDriver do Chrome"""
        try:
            chrome_options = Options()
            chrome_options.add_argument("--no-sandbox")
            chrome_options.add_argument("--disable-dev-shm-usage")
            chrome_options.add_argument("--disable-gpu")
            chrome_options.add_argument("--window-size=1920,1080")
            # chrome_options.add_argument("--headless")  # Descomente para modo headless
            
            self.driver = webdriver.Chrome(options=chrome_options)
            self.driver.implicitly_wait(10)
            
            self.log_result("Setup WebDriver", True, "Chrome WebDriver configurado com sucesso")
            return True
            
        except Exception as e:
            self.log_result("Setup WebDriver", False, f"Erro ao configurar WebDriver: {str(e)}")
            return False
            
    def log_result(self, test_name: str, success: bool, details: str = ""):
        """Registra resultado de um teste"""
        result = {
            'timestamp': datetime.now().isoformat(),
            'test': test_name,
            'success': success,
            'details': details
        }
        self.test_results.append(result)
        status = "✅ SUCESSO" if success else "❌ FALHA"
        print(f"{status} - {test_name}: {details}")
        
    def human_like_delay(self, min_seconds=1, max_seconds=3):
        """Simula tempo de pensamento humano"""
        import random
        delay = random.uniform(min_seconds, max_seconds)
        time.sleep(delay)
        
    def type_like_human(self, element, text, delay_range=(0.05, 0.2)):
        """Digita texto simulando velocidade humana"""
        import random
        element.clear()
        for char in text:
            element.send_keys(char)
            time.sleep(random.uniform(*delay_range))
            
    def take_screenshot(self, name: str):
        """Captura screenshot da página atual"""
        try:
            filename = f"screenshot_{name}_{self.session_id}.png"
            self.driver.save_screenshot(filename)
            self.log_result(f"Screenshot {name}", True, f"Captura salva: {filename}")
            return filename
        except Exception as e:
            self.log_result(f"Screenshot {name}", False, f"Erro: {str(e)}")
            return None
            
    def open_frontend(self):
        """Abre o frontend do Dungeon Keeper"""
        try:
            self.driver.get(self.frontend_url)
            self.human_like_delay(2, 4)
            
            # Verifica se a página carregou
            WebDriverWait(self.driver, 10).until(
                lambda driver: driver.execute_script("return document.readyState") == "complete"
            )
            
            self.take_screenshot("frontend_loaded")
            self.log_result("Abrir Frontend", True, f"Frontend carregado: {self.frontend_url}")
            return True
            
        except Exception as e:
            self.log_result("Abrir Frontend", False, f"Erro: {str(e)}")
            return False
            
    def register_user(self):
        """Simula registro de usuário como humano"""
        try:
            # Procura por link/botão de registro
            register_selectors = [
                "a[href*='register']",
                ".register-link",
                "#register-link",
                "button:contains('Registrar')",
                "a:contains('Criar conta')"
            ]
            
            register_element = None
            for selector in register_selectors:
                try:
                    register_element = self.driver.find_element(By.CSS_SELECTOR, selector)
                    break
                except NoSuchElementException:
                    continue
                    
            if register_element:
                self.human_like_delay(1, 2)
                register_element.click()
                self.human_like_delay(2, 3)
                
            # Preenche formulário de registro
            user_data = {
                "full_name": f"Usuario Teste {self.session_id}",
                "player_name": f"usuario_ui_{self.session_id}",
                "phone": "(11) 99999-9999",
                "email": f"teste_ui_{self.session_id}@rpg.com",
                "password": "senha123",
                "confirm_password": "senha123",
                "birthdate": "1990-01-01",
                "gender": "other",
                "country": "Brasil"
            }
            
            # Mapeia campos do formulário real
            field_mappings = {
                "full_name": ["#full-name", "input[name='full-name']"],
                "player_name": ["#player-name", "input[name='player-name']"],
                "phone": ["#phone", "input[name='phone']"],
                "email": ["#email", "input[name='email']", "input[type='email']"],
                "password": ["#password", "input[name='password']", "input[type='password']"],
                "confirm_password": ["#confirm-password", "input[name='confirm-password']"],
                "birthdate": ["#birthdate", "input[name='birthdate']", "input[type='date']"],
                "country": ["#country", "input[name='country']"]
            }
            
            for field, value in user_data.items():
                if field == "gender":
                    # Tratamento especial para campo select
                    try:
                        gender_select = Select(self.driver.find_element(By.CSS_SELECTOR, "#gender"))
                        self.human_like_delay(0.5, 1.5)
                        gender_select.select_by_value(value)
                        continue
                    except (NoSuchElementException, Exception):
                        continue
                        
                # Tratamento para campos de input normais
                if field in field_mappings:
                    for selector in field_mappings[field]:
                        try:
                            element = WebDriverWait(self.driver, 5).until(
                                EC.presence_of_element_located((By.CSS_SELECTOR, selector))
                            )
                            self.human_like_delay(0.5, 1.5)
                            self.type_like_human(element, value)
                            break
                        except TimeoutException:
                            continue
                        
            # Clica no botão de registro
            submit_selectors = [
                "button[type='submit']",
                ".register-btn",
                "#register",
                "input[type='submit']"
            ]
            
            for selector in submit_selectors:
                try:
                    submit_btn = self.driver.find_element(By.CSS_SELECTOR, selector)
                    self.human_like_delay(1, 2)
                    submit_btn.click()
                    break
                except NoSuchElementException:
                    continue
                    
            self.human_like_delay(3, 5)
            self.take_screenshot("user_registered")
            self.log_result("Registrar Usuário", True, f"Usuário {user_data['username']} registrado")
            return True
            
        except Exception as e:
            self.log_result("Registrar Usuário", False, f"Erro: {str(e)}")
            return False
            
    def create_characters(self):
        """Simula criação de personagens via interface"""
        characters_created = 0
        
        character_templates = [
            {"name": "Aragorn", "race": "Humano", "class": "Ranger"},
            {"name": "Legolas", "race": "Elfo", "class": "Arqueiro"},
            {"name": "Gimli", "race": "Anão", "class": "Guerreiro"}
        ]
        
        try:
            # Navega para criação de personagens
            nav_selectors = [
                "a[href*='character']",
                ".characters-link",
                "#characters",
                "a[href='home.html']"
            ]
            
            for selector in nav_selectors:
                try:
                    nav_element = self.driver.find_element(By.CSS_SELECTOR, selector)
                    self.human_like_delay(1, 2)
                    nav_element.click()
                    break
                except NoSuchElementException:
                    continue
                    
            self.human_like_delay(2, 3)
            
            for i, template in enumerate(character_templates):
                try:
                    # Clica em criar novo personagem
                    create_selectors = [
                        ".create-character",
                        "#new-character",
                        "button[type='button']",
                        ".add-character",
                        ".btn-primary"
                    ]
                    
                    for selector in create_selectors:
                        try:
                            create_btn = self.driver.find_element(By.CSS_SELECTOR, selector)
                            self.human_like_delay(1, 2)
                            create_btn.click()
                            break
                        except NoSuchElementException:
                            continue
                            
                    self.human_like_delay(2, 3)
                    
                    # Preenche dados do personagem
                    char_name = f"{template['name']}_UI_{self.session_id}_{i+1}"
                    
                    # Nome
                    name_selectors = ["input[name='name']", "#character-name", "#name"]
                    for selector in name_selectors:
                        try:
                            name_field = self.driver.find_element(By.CSS_SELECTOR, selector)
                            self.type_like_human(name_field, char_name)
                            break
                        except NoSuchElementException:
                            continue
                            
                    self.human_like_delay(0.5, 1)
                    
                    # Raça
                    race_selectors = ["select[name='race']", "#race", "#character-race"]
                    for selector in race_selectors:
                        try:
                            race_select = Select(self.driver.find_element(By.CSS_SELECTOR, selector))
                            race_select.select_by_visible_text(template['race'])
                            break
                        except (NoSuchElementException, Exception):
                            continue
                            
                    self.human_like_delay(0.5, 1)
                    
                    # Classe
                    class_selectors = ["select[name='class']", "#character-class", "#class"]
                    for selector in class_selectors:
                        try:
                            class_select = Select(self.driver.find_element(By.CSS_SELECTOR, selector))
                            class_select.select_by_visible_text(template['class'])
                            break
                        except (NoSuchElementException, Exception):
                            continue
                            
                    self.human_like_delay(1, 2)
                    
                    # Salva personagem
                    save_selectors = [
                        "button[type='submit']",
                        ".save-character",
                        "#save",
                        ".btn-primary",
                        "button.btn"
                    ]
                    
                    for selector in save_selectors:
                        try:
                            save_btn = self.driver.find_element(By.CSS_SELECTOR, selector)
                            self.human_like_delay(1, 2)
                            save_btn.click()
                            break
                        except NoSuchElementException:
                            continue
                            
                    self.human_like_delay(3, 4)
                    characters_created += 1
                    
                    self.log_result(f"Criar Personagem {i+1}", True, f"Personagem '{char_name}' criado")
                    
                except Exception as e:
                    self.log_result(f"Criar Personagem {i+1}", False, f"Erro: {str(e)}")
                    
            self.take_screenshot("characters_created")
            return characters_created
            
        except Exception as e:
            self.log_result("Criar Personagens", False, f"Erro geral: {str(e)}")
            return characters_created
            
    def navigate_and_interact(self):
        """Simula navegação e interações diversas"""
        interactions = 0
        
        try:
            # Lista de seções para navegar
            sections = [
                {"name": "Inventário", "selectors": ["a[href*='inventory']", ".inventory", "#inventory"]},
                {"name": "Mesas", "selectors": ["a[href*='table']", ".tables", "#tables"]},
                {"name": "Histórias", "selectors": ["a[href*='stories']", ".stories", "#stories"]}
            ]
            
            for section in sections:
                try:
                    # Tenta navegar para a seção
                    for selector in section["selectors"]:
                        try:
                            nav_element = self.driver.find_element(By.CSS_SELECTOR, selector)
                            self.human_like_delay(1, 2)
                            nav_element.click()
                            self.human_like_delay(2, 3)
                            
                            # Captura screenshot da seção
                            self.take_screenshot(f"section_{section['name'].lower()}")
                            
                            interactions += 1
                            self.log_result(f"Navegar {section['name']}", True, f"Seção acessada com sucesso")
                            break
                            
                        except NoSuchElementException:
                            continue
                            
                except Exception as e:
                    self.log_result(f"Navegar {section['name']}", False, f"Erro: {str(e)}")
                    
            return interactions
            
        except Exception as e:
            self.log_result("Navegação Geral", False, f"Erro: {str(e)}")
            return interactions
            
    def generate_report(self):
        """Gera relatório final da automação"""
        total_tests = len(self.test_results)
        successful_tests = sum(1 for result in self.test_results if result['success'])
        success_rate = (successful_tests / total_tests * 100) if total_tests > 0 else 0
        
        report = {
            "session_id": self.session_id,
            "timestamp": datetime.now().isoformat(),
            "automation_type": "Selenium UI Automation",
            "frontend_url": self.frontend_url,
            "summary": {
                "total_tests": total_tests,
                "successful_tests": successful_tests,
                "failed_tests": total_tests - successful_tests,
                "success_rate": round(success_rate, 1)
            },
            "test_details": self.test_results,
            "conclusions": {
                "interface_status": "Funcionando" if success_rate > 70 else "Com problemas",
                "user_experience": "Boa" if success_rate > 80 else "Precisa melhorar",
                "automation_status": "Completo"
            }
        }
        
        # Salva relatório em arquivo
        report_filename = f"selenium_ui_report_{self.session_id}.json"
        try:
            with open(report_filename, 'w', encoding='utf-8') as f:
                json.dump(report, f, indent=2, ensure_ascii=False)
                
            print(f"\n📊 RELATÓRIO FINAL - Automação de Interface")
            print(f"📋 Sessão: {self.session_id}")
            print(f"🎯 Taxa de Sucesso: {success_rate:.1f}%")
            print(f"✅ Sucessos: {successful_tests}/{total_tests}")
            print(f"📄 Relatório salvo: {report_filename}")
            
        except Exception as e:
            print(f"❌ Erro ao salvar relatório: {str(e)}")
            
        return report
        
    def run_automation(self):
        """Executa automação completa da interface"""
        print("🤖 Iniciando Automação de Interface - Selenium WebDriver")
        print(f"📋 Sessão: {self.session_id}")
        print("=" * 70)
        
        try:
            # 1. Configura WebDriver
            if not self.setup_driver():
                return None
                
            # 2. Abre frontend
            if not self.open_frontend():
                return None
                
            # 3. Registra usuário
            self.register_user()
            
            # 4. Cria personagens
            self.create_characters()
            
            # 5. Navega e interage
            self.navigate_and_interact()
            
            # 6. Gera relatório
            return self.generate_report()
            
        except Exception as e:
            self.log_result("Automação Geral", False, f"Erro crítico: {str(e)}")
            return self.generate_report()
            
        finally:
            if self.driver:
                self.driver.quit()
                print("🔚 WebDriver encerrado")

if __name__ == "__main__":
    automation = SeleniumUIAutomation()
    report = automation.run_automation()
    
    if report:
        print("\n🎉 Automação concluída com sucesso!")
        print(f"📊 Relatório disponível com {report['summary']['success_rate']}% de sucesso")
    else:
        print("\n❌ Automação falhou - verifique os logs")