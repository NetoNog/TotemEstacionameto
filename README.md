# 🅿️ SmartPark Totem • Sistema Industrial de Autoatendimento

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7.10-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?style=for-the-badge&logo=docker)](https://www.docker.com/)

Sistema corporativo de autoatendimento para estacionamentos rotativos projetado especificamente para execução em **Totens Touchscreen**, com interface industrial escura, síntese de áudio nativa, acessibilidade (ABNT/Cadeirante e Alto Contraste), leitor ótico com suporte a scanners laser físicos, teclados virtuais táteis e pontes completas para pagamentos via **PIX (Padrão Banco Central / EMVco)** e **TEF (Cartões de Débito e Crédito via PinPad)**.

---

## 📌 Sumário

1. [Visão Geral e Diferenciais](#-visão-geral-e-diferenciais)
2. [Arquitetura do Sistema](#-arquitetura-do-sistema)
3. [Tecnologias Utilizadas](#-tecnologias-utilizadas)
4. [Fluxo de Autoatendimento](#-fluxo-de-autoatendimento)
5. [Pontes de Pagamento Integradas](#-pontes-de-pagamento-integradas)
   - [Ponte PIX Oficial Banco Central](#1-ponte-pix-oficial-banco-central-emvco--br-code)
   - [Ponte TEF / PinPad (Cartão Débito e Crédito)](#2-ponte-tef--pinpad-cartão-físico-emv--contactless)
6. [Regras de Negócio e Cálculo Tarifário](#-regras-de-negócio-e-cálculo-tarifário)
7. [Instalação e Execução no Totem Físico](#-instalação-e-execução-no-totem-físico)
   - [Opção 1: Via Docker Compose (Produção)](#opção-1-via-docker-compose-recomendado-para-produção)
   - [Opção 2: Execução Direta no Sistema Operacional](#opção-2-execução-direta-no-sistema-operacional-windows--linux)
   - [Configuração do Modo Quiosque (Kiosk Mode)](#configuração-do-modo-quiosque-kiosk-mode-no-totem)
8. [Variáveis de Ambiente (.env)](#-variáveis-de-ambiente-env)
9. [Endpoints de API](#-endpoints-de-api)
10. [Testes Automatizados](#-testes-automatizados)

---

## 🌟 Visão Geral e Diferenciais

O projeto foi construído pensando nas restrições reais de operação de hardware de terminais de autoatendimento:
* **Interface Industrial Touch-Optimized:** Painel visual escuro com alto contraste nativo, botões com alvos táteis mínimos de `48x48px` (padrão WCAG), feedback sonoro via Web Audio API e ausência de componentes que causam arrastos acidentais.
* **Leitura Ótica Dupla:** Suporte simultâneo a leitores de código de barras USB/Bluetooth de alta velocidade (laser HID com buffer de digitação automática) e digitação assistida por **Teclado Virtual Touchscreen QWERTY** embutido na tela.
* **Detecção de Placas Brasileiras & Mercosul:** Componente [`PlateBadge`](src/components/ui/PlateBadge.tsx) com renderização fiel de placas tradicionais (Cinza) e Mercosul (com faixa azul e bandeira).
* **Emissão Fiscal DANFE NFC-e:** Impressão gráfica e visual com chave de acesso de 44 dígitos, QR Code oficial SEFAZ e slot animado simulando a saída de papel da impressora térmica.
* **Locução de Voz Multilíngue:** Guia por voz sintetizada nativa (`SpeechSynthesis`) em Português, Inglês e Espanhol para conduzir o motorista em cada etapa do atendimento.
* **Blindagem de Segurança para Uso Público:**
  - Bloqueio de menus de contexto de clique direito e toque longo (`contextmenu`).
  - Bloqueio de seleções acidentais de texto (`select-none`).
  - Detector de abandono do totem com **auto-reset para a tela de descanso após 45 segundos de inatividade**.

---

## 🏗️ Arquitetura do Sistema

O sistema é construído sobre uma arquitetura em camadas moderna, desacoplada e resiliente:

```mermaid
graph TD
    subgraph Kiosk_Peripherals [Periféricos do Totem Físico]
        TouchScreen[Display Touchscreen Kiosk]
        LaserScanner[Leitor Ótico Laser USB/Serial]
        PinPad[Terminal PinPad TEF]
        Printer[Impressora Térmica 80mm ESC/POS]
    end

    subgraph Frontend_Layer [Camada do Totem - Next.js 16 Client]
        AttractScreen[Tela de Descanso / Attract]
        ScannerScreen[Scanner + Teclado Virtual Touch]
        PaymentHUD[HUD Financeiro + QR PIX + PinPad]
        ReleaseScreen[Liberação Cancela 20 Min + DANFE NFC-e]
        AudioEngine[Audio & Speech Native Synthesizer]
    end

    subgraph Backend_Layer [Serviços & APIs Next.js Server]
        TicketAPI[/api/tickets/consultar]
        PaymentAPI[/api/tickets/pagar]
        PixAPI[/api/tickets/pix]
        StatusAPI[/api/tickets/status]
        WebhookPix[/api/webhooks/pix]
        TariffEngine[Tariff Calculation Engine]
    end

    subgraph Data_Gateways [Infraestrutura & Provedores Externos]
        PostgreSQL[(PostgreSQL 16 Database)]
        PrismaORM[Prisma ORM 7.10]
        BacenPIX[Banco Central / PSP Gateways]
        TEFDaemon[Agente TEF Local :8080]
    end

    TouchScreen --> Frontend_Layer
    LaserScanner --> Frontend_Layer
    Frontend_Layer --> Backend_Layer
    PinPad <--> TEFDaemon
    Backend_Layer <--> PrismaORM
    PrismaORM <--> PostgreSQL
    Backend_Layer <--> BacenPIX
    Backend_Layer <--> TEFDaemon
    Frontend_Layer --> Printer
```

---

## 💻 Tecnologias Utilizadas

| Componente | Tecnologia | Versão | Descrição |
| :--- | :--- | :--- | :--- |
| **Framework Web** | Next.js (App Router + Turbopack) | 16.3.5 | Renderização híbrida SSR/Client de alta performance |
| **Biblioteca UI** | React | 19.2.8 | Gerenciamento reativo de componentes de interface |
| **Linguagem** | TypeScript | 5.x | Tipagem estática rigorosa ponta a ponta |
| **Estilização** | Tailwind CSS | v4.x | Design system atômico com variáveis nativas |
| **Banco de Dados** | PostgreSQL | 16-alpine | Banco relacional robusto com integridade transacional |
| **ORM** | Prisma | 7.10.0 | Gerenciamento de schema, migrações e queries tipadas |
| **Ícones** | Lucide React | 1.47.0 | Conjunto padronizado de ícones vetoriais industriais |
| **QR Code** | qrcode | 1.5.4 | Renderização vetorial e Base64 para SEFAZ e PIX |
| **Áudio / Som** | Web Audio API (Nativa) | Nativo | Síntese de ondas senoidais/triangulares sem arquivos externos |
| **Locução** | Web SpeechSynthesis API | Nativo | Leitura falada automática de instruções em PT, EN e ES |
| **Containers** | Docker & Docker Compose | 3.8+ | Conteinerização multi-stage otimizada (`standalone`) |

---

## 🔄 Fluxo de Autoatendimento

1. **Passo 0: Modo de Descanso (`ATTRACT`)**
   - Tela com animação suave (*ambient glow*), relógio em tempo real, lotação de vagas do estacionamento e botão gigante de toque para iniciar o atendimento.
   - O motorista pode simplesmente bipar o ticket no leitor ótico a qualquer momento para acordar o terminal instantaneamente.
2. **Passo 1: Leitura de Ticket (`SCAN`)**
   - Mira ótica animada de precisão com feixe laser contínuo.
   - Captura automática de scanners laser físicos USB (mesmo sem foco no input).
   - Botões de simulação de 1 toque com casos reais (1ª Hora, Fração, Isento, Teto Diário).
   - Botão para abrir o **Teclado Virtual Touchscreen** para digitação manual de placas ou tickets.
3. **Passo 2: HUD Financeiro e Pagamento (`PAYMENT`)**
   - Visualização clara do tempo de permanência, horário de entrada, valor total auditado e placa do veículo com badge oficial Mercosul.
   - Opção de pagamento instantâneo via **PIX (QR Code dinâmico Bacen)** com polling de confirmação em segundo plano.
   - Opção de pagamento via **Cartão de Débito ou Crédito no PinPad TEF** com guia de aproximação (NFC) e chip.
   - Se o veículo estiver dentro da tolerância gratuita (15 minutos), o botão de **Liberação Gratuita** é exibido diretamente.
4. **Passo 3: Liberação da Cancela e Comprovante (`RELEASE`)**
   - Cronômetro circular regressivo destacando a **Tolerância de 20 minutos** para o motorista chegar à cancela de saída.
   - QR Code de saída legível pelo sensor ótico da catraca.
   - Opção de emissão do cupom fiscal **DANFE NFC-e SEFAZ** com animação mecânica de ejeção da impressora térmica.
   - Retorno automático ao modo de descanso após a conclusão ou abandono.

---

## 💳 Pontes de Pagamento Integradas

### 1. Ponte PIX Oficial Banco Central (EMVco / BR Code)
* **Localização:** [`src/lib/payments/pix/`](src/lib/payments/pix/)
* **Cálculo de CRC16:** O gerador calcula o polinômio oficial `0x1021` com valor inicial `0xFFFF`, assegurando que o código gerado seja lido perfeitamente por **100% dos bancos brasileiros** sem erros de validação.
* **Polling Silencioso:** Enquanto o cliente aponta o smartphone para o QR Code, o frontend consulta [`/api/tickets/status`](src/app/api/tickets/status/route.ts) a cada 2 segundos. Assim que o pagamento é liquidado pelo banco, o totem avança sozinho para a tela de liberação.
* **Webhook Oficial:** A rota [`/api/webhooks/pix`](src/app/api/webhooks/pix/route.ts) recebe a notificação assíncrona do PSP ou Banco Central e atualiza atomicamente o status no PostgreSQL.

### 2. Ponte TEF / PinPad (Cartão Físico EMV / Contactless)
* **Localização:** [`src/lib/payments/tef/tefBridge.ts`](src/lib/payments/tef/tefBridge.ts)
* **Comunicação com PinPad:** Conecta-se a serviços TEF locais (CliSiTef, PayGo, Stone, PagBank) na porta local `http://127.0.0.1:8080/tef`.
* **Máquina de Estados:**
  ```
  AGUARDANDO_CARTAO ➔ CARTAO_LIDO ➔ SOLICITANDO_SENHA ➔ AUTORIZANDO ➔ APROVADO
  ```
* **Comprovante TEF:** Gera os dados de auditoria com NSU (*Número Sequencial Único*), Código de Autorização e Bandeira (*Visa, Mastercard, Elo*).

---

## ⚖️ Regras de Negócio e Cálculo Tarifário

As regras são calculadas pelo motor determinístico auditado em [`src/lib/tariffCalculator.ts`](src/lib/tariffCalculator.ts):

* **Tolerância Inicial (Carência Gratuita):** Até `15 minutos` de permanência não geram cobrança (`valor = R$ 0,00`).
* **Primeira Hora:** Permanência entre `16 e 60 minutos` = `R$ 12,00`.
* **Frações Adicionais:** A cada `30 minutos` excedentes à 1ª hora = `+ R$ 4,00`.
* **Teto Diário:** O valor cobrado em um período de 24h não ultrapassa `R$ 45,00`.
* **Tolerância de Saída:** Após a confirmação do pagamento, o motorista dispõe de `20 minutos` para passar o ticket na cancela de saída.

---

## 🚀 Instalação e Execução no Totem Físico

### Pré-requisitos
* **Hardware:** Totem touchscreen (resolução Full HD 1080x1920 vertical ou 1920x1080 horizontal), Leitor de código de barras USB/Serial e Impressora Térmica 80mm.
* **Sistema Operacional:** Windows 10/11 IoT Enterprise ou Linux (Ubuntu 22.04 LTS / Debian).
* **Software:** Node.js 20+ ou Docker & Docker Compose.

---

### Opção 1: Via Docker Compose (Recomendado para Produção)

Esta opção inicializa o banco PostgreSQL persistente e a aplicação compilada em modo `standalone` com reinício automático:

```powershell
# 1. Clone o repositório
git clone https://github.com/NetoNog/TotemEstacionameto.git
cd TotemEstacionameto

# 2. Crie o arquivo .env a partir do template
cp .env.example .env

# 3. Suba o banco de dados e o totem em segundo plano
docker compose up -d

# 4. Verifique o status dos serviços
docker compose ps
```

O totem estará imediatamente acessível no endereço: **`http://localhost:3000/totem`**.

---

### Opção 2: Execução Direta no Sistema Operacional (Windows / Linux)

```powershell
# 1. Instalar as dependências do projeto
npm ci

# 2. Configurar o banco de dados no Prisma e aplicar o schema
npm run db:push

# 3. Executar a carga inicial de tarifas e tickets de teste
npm run db:seed

# 4. Gerar o build otimizado de produção
npm run build

# 5. Iniciar o servidor do Totem em modo produção
npm run start
```

---

### Configuração do Modo Quiosque (Kiosk Mode) no Totem

Para travar o totem em modo de autoatendimento público (tela cheia sem barra de endereços e sem acesso à área de trabalho):

#### No Windows (Criar arquivo `iniciar-totem.bat` na inicialização do Windows):
```bat
@echo off
title Iniciando SmartTotem...
cd /d "C:\TotemEstacionamento"

:: Inicia o backend em segundo plano caso nao utilize Docker
start /min npm run start

:: Aguarda 3 segundos para subida do servico
timeout /t 3 /nobreak >nul

:: Inicia o Chrome ou Edge travado em Tela Cheia Modo Quiosque
start chrome.exe --kiosk --incognito --disable-pinch --overscroll-history-navigation=0 "http://localhost:3000/totem"
```

#### No Linux (Ubuntu com X11/Wayland):
```bash
google-chrome --kiosk --incognito --noerrdialogs --disable-infobars "http://localhost:3000/totem"
```

---

## 🔐 Variáveis de Ambiente (.env)

| Variável | Padrão | Descrição |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/totem_estacionamento?schema=public` | String de conexão com o PostgreSQL |
| `NEXT_PUBLIC_APP_NAME` | `SmartTotem Estacionamento` | Nome corporativo do totem exibido no display |
| `NEXT_PUBLIC_TERMINAL_ID` | `TERM-01` | Identificador único deste totem físico |
| `ADMIN_API_KEY` | `totem-admin-secret-2026` | Chave de segurança para rotas administrativas (`/api/tarifas`) |
| `PIX_CHAVE` | `12345678000190` | Chave Pix do estacionamento (CNPJ, CPF, Celular, E-mail ou EVP) |
| `PIX_BENEFICIARIO` | `SMARTPARK TOTEM 01` | Razão social ou nome fantasia para o comprovante Pix |
| `PIX_CIDADE` | `SAO PAULO` | Cidade do recebedor (sem acentos, até 15 caracteres) |
| `TEF_ENDPOINT` | `http://127.0.0.1:8080/tef` | URL local do agente de comunicação com o PinPad |
| `TEF_TERMINAL_ID` | `TERM01` | Identificador do terminal no servidor TEF |

---

## 📡 Endpoints de API

### Totem & Tickets
* `GET /api/tickets`: Lista todos os tickets ativos com cálculo tarifário em tempo real.
* `POST /api/tickets`: Registra a entrada de um novo veículo (usado na cancela de entrada / simulador).
* `GET /api/tickets/consultar?codigo=1024`: Consulta o ticket pela placa ou código de barras e retorna o cálculo de permanência.
* `POST /api/tickets/pagar`: Processa o pagamento de forma atômica no banco de dados e libera a saída.
* `GET /api/tickets/status?ticketId=...`: Endpoint leve para polling em tempo real da tela do totem.
* `POST /api/tickets/pix`: Gera o payload oficial do Pix e o QR Code em alta definição.

### Webhooks & Integrações
* `POST /api/webhooks/pix`: Webhook para confirmação bancária instantânea de pagamentos via Pix.
* `GET /api/tarifas` / `POST /api/tarifas`: Consulta e atualização dinâmica de regras tarifárias (protegido por `x-admin-key`).
* `GET /api/health`: Healthcheck do totem com diagnóstico de conexão com o banco e métricas de memória.

---

## 🧪 Testes Automatizados

Para validar as regras tarifárias de negócio, tolerâncias e tetos diários:

```powershell
npx tsx src/lib/testRunner.ts
```

Output esperado:
```text
--- Iniciando Testes de Regras de Negócio de Tarifas ---
✅ [PASS] Deve identificar dentro da tolerância
✅ [PASS] Deve conceder isenção
✅ [PASS] Valor calculado deve ser R$ 0,00
✅ [PASS] Não deve ser isento
✅ [PASS] Valor da 1ª hora deve ser R$ 12,00
✅ [PASS] 80 minutos deve cobrar 1ª hora (12) + 1 fração (4) = R$ 16,00
✅ [PASS] 135 min deve cobrar 12 + (3 * 4) = R$ 24,00
✅ [PASS] Deve indicar que atingiu o teto diário
✅ [PASS] Valor deve ser limitado ao teto de R$ 45,00
✅ [PASS] Deve identificar como já pago
✅ [PASS] Deve estar com saída liberada
✅ [PASS] Valor a pagar deve ser zero para saída liberada

Resultado dos Testes: 12 passaram, 0 falharam.
```

Para verificar conformidade de tipos e estilo de código:
```powershell
npx tsc --noEmit
npm run lint
```

---

## 📄 Licença

Este software é de propriedade da **SmartPark Estacionamentos**. Todos os direitos reservados.
Projetado para operação contínua e industrial em terminais de autoatendimento.
