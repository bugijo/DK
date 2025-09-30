# Script PowerShell para resolver problema FastAPI
# Executa múltiplas soluções em sequência

Write-Host "🔧 SOLUCIONANDO PROBLEMA FASTAPI" -ForegroundColor Green
Write-Host "=" * 50

# Função para testar servidor
function Test-Server {
    param(
        [string]$Url = "http://127.0.0.1:8001/ping",
        [int]$Timeout = 5
    )
    
    try {
        $response = Invoke-RestMethod -Uri $Url -TimeoutSec $Timeout
        Write-Host "✅ Servidor respondeu: $($response | ConvertTo-Json)" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "❌ Falha na requisição: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Função para verificar se processo está rodando
function Test-ProcessRunning {
    param([string]$ProcessName)
    
    $processes = Get-Process -Name $ProcessName -ErrorAction SilentlyContinue
    return $processes.Count -gt 0
}

# SOLUÇÃO 1: Teste com Gunicorn
Write-Host "\n1️⃣ TESTANDO GUNICORN" -ForegroundColor Yellow
Write-Host "-" * 30

try {
    # Para qualquer servidor rodando na porta 8001
    $existingProcess = Get-NetTCPConnection -LocalPort 8001 -ErrorAction SilentlyContinue
    if ($existingProcess) {
        Write-Host "⚠️ Porta 8001 em uso. Tentando parar processos..." -ForegroundColor Yellow
        Stop-Process -Name "python", "uvicorn", "gunicorn" -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
    }
    
    # Instala Gunicorn se necessário
    Write-Host "📦 Instalando Gunicorn..."
    pip install gunicorn 2>$null
    
    # Inicia servidor Gunicorn
    Write-Host "🚀 Iniciando Gunicorn..."
    $gunicornJob = Start-Job -ScriptBlock {
        Set-Location $using:PWD
        gunicorn minimal:app -w 1 -k uvicorn.workers.UvicornWorker --bind 127.0.0.1:8001
    }
    
    Start-Sleep -Seconds 5
    
    # Testa primeira requisição
    Write-Host "📡 Testando primeira requisição..."
    $test1 = Test-Server
    
    if ($test1) {
        Start-Sleep -Seconds 2
        
        # Testa segunda requisição
        Write-Host "📡 Testando segunda requisição..."
        $test2 = Test-Server
        
        if ($test2) {
            Write-Host "🎉 GUNICORN FUNCIONOU! Problema resolvido." -ForegroundColor Green
            Stop-Job $gunicornJob -PassThru | Remove-Job
            exit 0
        }
    }
    
    Stop-Job $gunicornJob -PassThru | Remove-Job
    Write-Host "❌ Gunicorn não resolveu o problema" -ForegroundColor Red
}
catch {
    Write-Host "❌ Erro com Gunicorn: $($_.Exception.Message)" -ForegroundColor Red
}

# SOLUÇÃO 2: Novo ambiente virtual
Write-Host "\n2️⃣ CRIANDO NOVO AMBIENTE VIRTUAL" -ForegroundColor Yellow
Write-Host "-" * 30

try {
    # Remove ambiente antigo se existir
    if (Test-Path "venv_limpo") {
        Write-Host "🗑️ Removendo ambiente antigo..."
        Remove-Item -Recurse -Force "venv_limpo"
    }
    
    # Cria novo ambiente
    Write-Host "📦 Criando novo ambiente virtual..."
    python -m venv venv_limpo
    
    if (Test-Path "venv_limpo\Scripts\activate.ps1") {
        Write-Host "✅ Ambiente criado com sucesso"
        
        # Ativa ambiente e instala dependências
        Write-Host "📦 Instalando dependências..."
        & ".\venv_limpo\Scripts\pip.exe" install fastapi uvicorn[standard]
        
        # Testa servidor no novo ambiente
        Write-Host "🚀 Testando servidor no novo ambiente..."
        $newEnvJob = Start-Job -ScriptBlock {
            Set-Location $using:PWD
            & ".\venv_limpo\Scripts\uvicorn.exe" minimal:app --host 127.0.0.1 --port 8002
        }
        
        Start-Sleep -Seconds 5
        
        # Testa requisições na porta 8002
        Write-Host "📡 Testando primeira requisição (porta 8002)..."
        $test1 = Test-Server -Url "http://127.0.0.1:8002/ping"
        
        if ($test1) {
            Start-Sleep -Seconds 2
            Write-Host "📡 Testando segunda requisição..."
            $test2 = Test-Server -Url "http://127.0.0.1:8002/ping"
            
            if ($test2) {
                Write-Host "🎉 NOVO AMBIENTE FUNCIONOU! Problema resolvido." -ForegroundColor Green
                Stop-Job $newEnvJob -PassThru | Remove-Job
                Write-Host "\n💡 SOLUÇÃO: Use o novo ambiente 'venv_limpo'" -ForegroundColor Cyan
                exit 0
            }
        }
        
        Stop-Job $newEnvJob -PassThru | Remove-Job
        Write-Host "❌ Novo ambiente não resolveu o problema" -ForegroundColor Red
    }
    else {
        Write-Host "❌ Falha ao criar ambiente virtual" -ForegroundColor Red
    }
}
catch {
    Write-Host "❌ Erro ao criar novo ambiente: $($_.Exception.Message)" -ForegroundColor Red
}

# SOLUÇÃO 3: Diagnóstico final
Write-Host "\n3️⃣ DIAGNÓSTICO FINAL" -ForegroundColor Yellow
Write-Host "-" * 30

Write-Host "\n📋 RESUMO DOS TESTES:" -ForegroundColor Cyan
Write-Host "❌ Uvicorn: Para após cada requisição"
Write-Host "❌ Gunicorn: Não funcionou"
Write-Host "❌ Novo ambiente: Não funcionou"

Write-Host "\n🔍 CAUSA PROVÁVEL:" -ForegroundColor Cyan
Write-Host "- Problema no ambiente Python/Windows"
Write-Host "- Mensagem 'Could not find platform independent libraries'"
Write-Host "- Possível corrupção na instalação do Python"

Write-Host "\n💡 PRÓXIMAS SOLUÇÕES:" -ForegroundColor Cyan
Write-Host "1. Reinstalar Python completamente"
Write-Host "2. Usar Docker (se disponível)"
Write-Host "3. Usar WSL2 com Linux"
Write-Host "4. Testar em outro computador"

Write-Host "\n📁 ARQUIVOS CRIADOS:" -ForegroundColor Cyan
Write-Host "- minimal.py (servidor mínimo)"
Write-Host "- SOLUCOES_FASTAPI.md (guia completo)"
Write-Host "- Dockerfile e docker-compose.yml (para Docker)"
Write-Host "- venv_limpo/ (novo ambiente virtual)"

Write-Host "\n🎯 RECOMENDAÇÃO FINAL:" -ForegroundColor Green
Write-Host "Reinstale Python 3.11+ do python.org e recrie o projeto."

Pause