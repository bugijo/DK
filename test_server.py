#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.main import app
import uvicorn

if __name__ == "__main__":
    print("Iniciando servidor FastAPI...")
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)