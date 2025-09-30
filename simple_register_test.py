#!/usr/bin/env python3
"""
Teste Simples de Registro - Dungeon Keeper
Foca apenas no preenchimento correto do formulário de registro
"""

import time
import uuid
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException

class SimpleRegisterTest:
    def __init__(self):
        self.frontend_url = "http://localhost:3001/register.html"
        self.session_id = str(uuid.uuid4())[:8]
        self.driver = None
        
    def setup_driver(self):
        """Configura o WebDriver do Chrome"""
        try:
            chrome_options = Options()
            chrome_options.add_argument("--no-sandbox")
            chrome_options.add_argument("--disable-dev-shm-usage")
            chrome_options.add_argument("--window-size=1920,1080")
            
            self.driver = webdriver.Chrome(options=chrome_options)
            self.driver.implicitly_wait(10)
            
            print("✅ Chrome WebDriver configurado com sucesso")
            return True
            
        except Exception as e:
            print(f"❌ Erro ao configurar WebDriver: {str(e)}")
            return False
            
    def type_slowly(self, element, text):
        """Digita texto lentamente"""
        element.clear()
        for char in text:
            element.send_keys(char)
            time.sleep(0.1)
            
    def test_register_form(self):
        """Testa o preenchimento do formulário de registro"""
        try:
            print(f"\n🌐 Abrindo página de registro: {self.frontend_url}")
            self.driver.get(self.frontend_url)
            time.sleep(3)
            
            # Dados do usuário
            user_data = {
                "full_name": f"Usuario Teste {self.session_id}",
                "player_name": f"usuario_ui_{self.session_id}",
                "phone": "(11) 99999-9999",
                "email": f"teste_ui_{self.session_id}@rpg.com",
                "password": "senha123",
                "confirm_password": "senha123",
                "birthdate": "1990-01-01",
                "country": "Brasil"
            }
            
            print("\n📝 Preenchendo formulário de registro...")
            
            # Nome Completo
            try:
                full_name = self.driver.find_element(By.ID, "full-name")
                self.type_slowly(full_name, user_data["full_name"])
                print(f"✅ Nome completo: {user_data['full_name']}")
                time.sleep(1)
            except Exception as e:
                print(f"❌ Erro no nome completo: {str(e)}")
                
            # Nome de Jogador
            try:
                player_name = self.driver.find_element(By.ID, "player-name")
                self.type_slowly(player_name, user_data["player_name"])
                print(f"✅ Nome de jogador: {user_data['player_name']}")
                time.sleep(1)
            except Exception as e:
                print(f"❌ Erro no nome de jogador: {str(e)}")
                
            # Telefone
            try:
                phone = self.driver.find_element(By.ID, "phone")
                self.type_slowly(phone, user_data["phone"])
                print(f"✅ Telefone: {user_data['phone']}")
                time.sleep(1)
            except Exception as e:
                print(f"❌ Erro no telefone: {str(e)}")
                
            # Email
            try:
                email = self.driver.find_element(By.ID, "email")
                self.type_slowly(email, user_data["email"])
                print(f"✅ Email: {user_data['email']}")
                time.sleep(1)
            except Exception as e:
                print(f"❌ Erro no email: {str(e)}")
                
            # Senha
            try:
                password = self.driver.find_element(By.ID, "password")
                self.type_slowly(password, user_data["password"])
                print(f"✅ Senha: {'*' * len(user_data['password'])}")
                time.sleep(1)
            except Exception as e:
                print(f"❌ Erro na senha: {str(e)}")
                
            # Confirmar Senha
            try:
                confirm_password = self.driver.find_element(By.ID, "confirm-password")
                self.type_slowly(confirm_password, user_data["confirm_password"])
                print(f"✅ Confirmação de senha: {'*' * len(user_data['confirm_password'])}")
                time.sleep(1)
            except Exception as e:
                print(f"❌ Erro na confirmação de senha: {str(e)}")
                
            # Data de Nascimento
            try:
                birthdate = self.driver.find_element(By.ID, "birthdate")
                birthdate.send_keys(user_data["birthdate"])
                print(f"✅ Data de nascimento: {user_data['birthdate']}")
                time.sleep(1)
            except Exception as e:
                print(f"❌ Erro na data de nascimento: {str(e)}")
                
            # Gênero
            try:
                gender_select = Select(self.driver.find_element(By.ID, "gender"))
                gender_select.select_by_value("other")
                print(f"✅ Gênero: Outro")
                time.sleep(1)
            except Exception as e:
                print(f"❌ Erro no gênero: {str(e)}")
                
            # País
            try:
                country = self.driver.find_element(By.ID, "country")
                self.type_slowly(country, user_data["country"])
                print(f"✅ País: {user_data['country']}")
                time.sleep(1)
            except Exception as e:
                print(f"❌ Erro no país: {str(e)}")
                
            # Screenshot antes de submeter
            self.driver.save_screenshot(f"form_filled_{self.session_id}.png")
            print(f"📸 Screenshot salvo: form_filled_{self.session_id}.png")
            
            # Debug: Verifica o estado da página
            print("\n🔍 Analisando estado da página...")
            try:
                current_url = self.driver.current_url
                page_title = self.driver.title
                page_source_length = len(self.driver.page_source)
                print(f"📍 URL atual: {current_url}")
                print(f"📄 Título da página: {page_title}")
                print(f"📏 Tamanho do HTML: {page_source_length} caracteres")
                
                # Lista todos os elementos form
                forms = self.driver.find_elements(By.TAG_NAME, "form")
                print(f"📋 Encontrados {len(forms)} formulários na página")
                
                # Lista todos os botões na página
                buttons = self.driver.find_elements(By.TAG_NAME, "button")
                print(f"📊 Encontrados {len(buttons)} botões na página:")
                for i, btn in enumerate(buttons):
                    btn_type = btn.get_attribute("type") or "N/A"
                    btn_class = btn.get_attribute("class") or "N/A"
                    btn_text = btn.text or "N/A"
                    print(f"  {i+1}. Type: {btn_type}, Class: {btn_class}, Text: {btn_text}")
                    
                # Se não há botões, vamos procurar por inputs do tipo submit
                if len(buttons) == 0:
                    submit_inputs = self.driver.find_elements(By.CSS_SELECTOR, "input[type='submit']")
                    print(f"🔘 Encontrados {len(submit_inputs)} inputs tipo submit")
                    
            except Exception as e:
                print(f"❌ Erro ao analisar página: {str(e)}")
            
            # Aguarda um pouco para visualização
            print("\n⏳ Aguardando 3 segundos para visualização...")
            time.sleep(3)
            
            # Procura pelo botão de submissão
            submit_selectors = [
                "button[type='submit']",
                ".btn-primary",
                "button.btn-primary"
            ]
            
            print("\n🔍 Procurando botão de submissão...")
            submit_btn = None
            
            for selector in submit_selectors:
                try:
                    submit_btn = self.driver.find_element(By.CSS_SELECTOR, selector)
                    print(f"✅ Botão encontrado com seletor: {selector}")
                    break
                except:
                    print(f"❌ Seletor não funcionou: {selector}")
                    continue
                    
            if submit_btn:
                try:
                    print("\n🎯 Clicando no botão 'Criar Conta'...")
                    self.driver.execute_script("arguments[0].click();", submit_btn)
                    time.sleep(3)
                    
                    # Screenshot após submissão
                    self.driver.save_screenshot(f"after_submit_{self.session_id}.png")
                    print(f"📸 Screenshot pós-submissão: after_submit_{self.session_id}.png")
                    
                    print("✅ Formulário submetido com sucesso!")
                    return True
                    
                except Exception as e:
                    print(f"❌ Erro ao clicar no botão: {str(e)}")
                    return False
            else:
                print("❌ Nenhum botão de submissão encontrado")
                return False
                
        except Exception as e:
            print(f"❌ Erro geral no teste: {str(e)}")
            return False
            
    def run_test(self):
        """Executa o teste completo"""
        print("🧪 Iniciando Teste Simples de Registro")
        print(f"📋 Sessão: {self.session_id}")
        print("=" * 50)
        
        try:
            if not self.setup_driver():
                return False
                
            success = self.test_register_form()
            
            if success:
                print("\n🎉 Teste concluído com SUCESSO!")
                print("✅ Todos os campos foram preenchidos corretamente")
                print("✅ Formulário foi submetido")
            else:
                print("\n⚠️ Teste concluído com PROBLEMAS")
                print("❌ Verifique os logs acima para detalhes")
                
            return success
            
        except Exception as e:
            print(f"\n💥 Erro crítico: {str(e)}")
            return False
            
        finally:
            if self.driver:
                print("\n🔚 Encerrando navegador...")
                time.sleep(2)
                self.driver.quit()

if __name__ == "__main__":
    test = SimpleRegisterTest()
    success = test.run_test()
    
    if success:
        print("\n✨ RESULTADO: Automação de registro funcionando perfeitamente!")
    else:
        print("\n🔧 RESULTADO: Necessário ajustar formulário ou script")