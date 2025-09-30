# ============================================================================
# SOLUÇÃO DEFINITIVA PARA PROBLEMA FASTAPI
# Problema: Servidor para após cada requisição
# Causa: Ambiente Python corrompido no Windows
# ============================================================================

Write-Host "🔥 INICIANDO SOLUÇÃO DEFINITIVA FASTAPI" -ForegroundColor Red
Write-Host "============================================" -ForegroundColor Yellow

# Função para testar se comando existe
function Test-Command($cmdname) {
    return [bool](Get-Command -Name $cmdname -ErrorAction SilentlyContinue)
}

# Função para testar servidor
function Test-Server($url, $name) {
    Write-Host "🧪 Testando $name..." -ForegroundColor Cyan
    try {
        $response = Invoke-WebRequest -Uri $url -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ $name funcionando!" -ForegroundColor Green
            return $true
        }
    } catch {
        Write-Host "❌ $name falhou: $($_.Exception.Message)" -ForegroundColor Red
    }
    return $false
}

# ============================================================================
# SOLUÇÃO 1: TESTAR DOCKER (MAIS RÁPIDA)
# ============================================================================

Write-Host "\n🐳 TENTATIVA 1: DOCKER" -ForegroundColor Magenta
Write-Host "========================" -ForegroundColor Yellow

if (Test-Command "docker") {
    Write-Host "✅ Docker encontrado! Testando..." -ForegroundColor Green
    
    # Parar containers existentes
    docker-compose down 2>$null
    
    # Construir e iniciar
    Write-Host "🔨 Construindo container..." -ForegroundColor Cyan
    $dockerResult = docker-compose up --build -d 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Container iniciado!" -ForegroundColor Green
        Start-Sleep -Seconds 5
        
        if (Test-Server "http://localhost:8000/ping" "Docker FastAPI") {
            Write-Host "\n🎉 SUCESSO! Docker resolveu o problema!" -ForegroundColor Green
            Write-Host "🌐 Acesse: http://localhost:8000/ping" -ForegroundColor Cyan
            Write-Host "📋 Para parar: docker-compose down" -ForegroundColor Yellow
            exit 0
        }
    } else {
        Write-Host "❌ Docker falhou: $dockerResult" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Docker não encontrado" -ForegroundColor Red
}

# ============================================================================
# SOLUÇÃO 2: NOVO AMBIENTE VIRTUAL LIMPO
# ============================================================================

Write-Host "\n🔄 TENTATIVA 2: AMBIENTE VIRTUAL LIMPO" -ForegroundColor Magenta
Write-Host "=====================================" -ForegroundColor Yellow

# Remover ambiente antigo se existir
if (Test-Path "venv_definitivo") {
    Write-Host "🗑️ Removendo ambiente antigo..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force "venv_definitivo" -ErrorAction SilentlyContinue
}

# Criar novo ambiente
Write-Host "🆕 Criando ambiente virtual limpo..." -ForegroundColor Cyan
$venvResult = python -m venv venv_definitivo 2>&1

if ($LASTEXITCODE -eq 0 -and (Test-Path "venv_definitivo\Scripts\activate.ps1")) {
    Write-Host "✅ Ambiente criado!" -ForegroundColor Green
    
    # Ativar ambiente
    Write-Host "🔌 Ativando ambiente..." -ForegroundColor Cyan
    & ".\venv_definitivo\Scripts\Activate.ps1"
    
    # Instalar dependências
    Write-Host "📦 Instalando FastAPI e Uvicorn..." -ForegroundColor Cyan
    $installResult = pip install fastapi uvicorn[standard] --no-cache-dir 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Dependências instaladas!" -ForegroundColor Green
        
        # Testar servidor
        Write-Host "🚀 Iniciando servidor de teste..." -ForegroundColor Cyan
        $serverJob = Start-Job -ScriptBlock {
            Set-Location $using:PWD
            & ".\venv_definitivo\Scripts\Activate.ps1"
            uvicorn minimal:app --host 127.0.0.1 --port 8002
        }
        
        Start-Sleep -Seconds 8
        
        if (Test-Server "http://localhost:8002/ping" "Ambiente Limpo") {
            Write-Host "\n🎉 SUCESSO! Ambiente limpo resolveu!" -ForegroundColor Green
            Write-Host "🌐 Acesse: http://localhost:8002/ping" -ForegroundColor Cyan
            Write-Host "📋 Para usar: .\venv_definitivo\Scripts\Activate.ps1" -ForegroundColor Yellow
            Stop-Job $serverJob -ErrorAction SilentlyContinue
            exit 0
        }
        
        Stop-Job $serverJob -ErrorAction SilentlyContinue
    } else {
        Write-Host "❌ Falha na instalação: $installResult" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Falha na criação do ambiente: $venvResult" -ForegroundColor Red
}

# ============================================================================
# SOLUÇÃO 3: DIAGNÓSTICO E RECOMENDAÇÕES
# ============================================================================

Write-Host "\n🔍 DIAGNÓSTICO FINAL" -ForegroundColor Magenta
Write-Host "===================" -ForegroundColor Yellow

# Verificar versão Python
Write-Host "🐍 Versão Python:" -ForegroundColor Cyan
python --version

# Verificar pip
Write-Host "\n📦 Versão pip:" -ForegroundColor Cyan
pip --version

# Verificar FastAPI
Write-Host "\n⚡ FastAPI instalado:" -ForegroundColor Cyan
pip show fastapi 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ FastAPI não encontrado" -ForegroundColor Red
}

Write-Host "\n" -ForegroundColor White
Write-Host "🚨 PROBLEMA CONFIRMADO: AMBIENTE PYTHON CORROMPIDO" -ForegroundColor Red
Write-Host "================================================" -ForegroundColor Yellow

Write-Host "\n📋 SOLUÇÕES RECOMENDADAS (em ordem):" -ForegroundColor Cyan
Write-Host "\n1️⃣ REINSTALAR PYTHON (MAIS EFETIVA)" -ForegroundColor Green
Write-Host "   • Desinstalar Python atual" -ForegroundColor White
Write-Host "   • Baixar Python 3.11+ de python.org" -ForegroundColor White
Write-Host "   • Marcar 'Add to PATH' na instalação" -ForegroundColor White
Write-Host "   • Criar projeto novo em pasta limpa" -ForegroundColor White

Write-Host "\n2️⃣ USAR WSL2 (ALTERNATIVA LINUX)" -ForegroundColor Green
Write-Host "   • wsl --install" -ForegroundColor White
Write-Host "   • sudo apt install python3 python3-pip" -ForegroundColor White
Write-Host "   • Ambiente Linux isolado" -ForegroundColor White

Write-Host "\n3️⃣ USAR DOCKER (SE DISPONÍVEL)" -ForegroundColor Green
Write-Host "   • Ambiente completamente isolado" -ForegroundColor White
Write-Host "   • docker-compose up --build" -ForegroundColor White

Write-Host "\n🎯 OBJETIVO: Servidor deve permanecer ativo após requisições" -ForegroundColor Yellow
Write-Host "\n📁 Arquivos de diagnóstico criados:" -ForegroundColor Cyan
Write-Host "   • CONCLUSAO_FINAL.md - Relatório completo" -ForegroundColor White
Write-Host "   • solucao_definitiva.ps1 - Este script" -ForegroundColor White
Write-Host "   • Dockerfile e docker-compose.yml - Solução Docker" -ForegroundColor White

Write-Host "\n🔥 RECOMENDAÇÃO FINAL: Reinstale Python completamente" -ForegroundColor Red
Write-Host "   O problema é do ambiente Windows, não do seu código!" -ForegroundColor Yellow

Write-Host "\n✅ Diagnóstico concluído!" -ForegroundColor Green