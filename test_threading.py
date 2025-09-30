# -*- coding: utf-8 -*-
"""
Teste com threading para manter o servidor ativo
"""

import threading
import time
import uvicorn
from simple_wrapper import app

def run_server():
    print("Starting server in thread...")
    uvicorn.run(app, host='127.0.0.1', port=8003, log_level="info")

if __name__ == "__main__":
    print("Creating server thread...")
    server_thread = threading.Thread(target=run_server, daemon=False)
    server_thread.start()
    
    print("Server thread started, keeping main thread alive...")
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("Shutting down...")