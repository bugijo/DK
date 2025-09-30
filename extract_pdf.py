import PyPDF2
import sys

try:
    with open(r'c:\Users\WINDOWS 10\Desktop\Projetos\DK\dnd5e_reference\a-mina-perdida-de-phandelver-v1-7.pdf', 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        print(text)
except ImportError:
    print("PyPDF2 not installed. Installing...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "PyPDF2"])
    import PyPDF2
    with open(r'c:\Users\WINDOWS 10\Desktop\Projetos\DK\dnd5e_reference\a-mina-perdida-de-phandelver-v1-7.pdf', 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        print(text)
except Exception as e:
    print(f"Error: {e}")