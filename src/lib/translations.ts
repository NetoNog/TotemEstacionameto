export type Language = 'pt' | 'en' | 'es';

export interface Translations {
  attract: {
    title: string;
    terminalName: string;
    statusOnline: string;
    touchToStart: string;
    touchSubtitle: string;
    vacanciesTitle: string;
    vacanciesAvailable: string;
    floorG1: string;
    floorG2: string;
    barcodeTip: string;
    securityBadge: string;
  };
  header: {
    appName: string;
    terminalNumber: string;
    opticalActive: string;
    stepScan: string;
    stepPayment: string;
    stepRelease: string;
    soundTooltip: string;
    voiceTooltip: string;
    wheelchairTooltip: string;
    contrastTooltip: string;
    fullscreenTooltip: string;
    simulatorTooltip: string;
  };
  scan: {
    instructionTitle: string;
    instructionSub: string;
    opticalSlotLabel: string;
    opticalSlotSub: string;
    testPillsLabel: string;
    manualToggle: string;
    manualPlaceholder: string;
    manualSubmit: string;
    errorPrefix: string;
  };
  payment: {
    cancelAndBack: string;
    activeSession: string;
    stayLabel: string;
    entryLabel: string;
    plateLabel: string;
    noPlate: string;
    toleranceAfter: string;
    totalToPay: string;
    freeTolerance: string;
    rotaryTariff: string;
    auditedCalc: string;
    freeTitle: string;
    freeDesc: string;
    freeButton: string;
    selectMethod: string;
    touchToSelect: string;
    pixTitle: string;
    pixSubtitle: string;
    debitTitle: string;
    debitSubtitle: string;
    creditTitle: string;
    creditSubtitle: string;
    pixHowTo: string;
    pixStep1: string;
    pixStep2: string;
    pixStep3: string;
    pixConfirmBtn: string;
    pixProcessing: string;
    cardInstruction: string;
    cardSimulateBtn: string;
    cardReading: string;
    cardAuthorizing: string;
    cardApproved: string;
    securityEmv: string;
  };
  release: {
    countdownLabel: string;
    gateReleased: string;
    exitRuleText: string;
    ticketBadgePaid: string;
    opticalGateNotice: string;
    receiptPromptTitle: string;
    receiptPromptDesc: string;
    receiptBtnYes: string;
    receiptBtnNo: string;
    receiptPrinting: string;
    receiptPrinted: string;
    receiptReprint: string;
    receiptNoPrint: string;
    receiptChangeMind: string;
    sefazAuth: string;
    finishBtn: string;
    autoResetNotice: string;
  };
  footer: {
    kioskTitle: string;
    pciBadge: string;
    toleranceNotice: string;
    supportLine: string;
  };
  voice: {
    welcome: string;
    freeRelease: string;
    stayDue: (tempo: string, valor: string) => string;
    paymentApproved: string;
  };
}

export const translations: Record<Language, Translations> = {
  pt: {
    attract: {
      title: 'SMARTPARK',
      terminalName: 'TOTEM AUTOATENDIMENTO',
      statusOnline: 'SISTEMA ONLINE • PRONTO PARA ATENDIMENTO',
      touchToStart: 'TOQUE NA TELA PARA INICIAR',
      touchSubtitle: 'Ou aproxime seu ticket diretamente no leitor ótico',
      vacanciesTitle: 'Vagas em Tempo Real',
      vacanciesAvailable: '142 VAGAS LIVRES',
      floorG1: 'PISO G1: 48',
      floorG2: 'PISO G2: 94',
      barcodeTip: 'Leitor ótico ativo com laser de alta precisão',
      securityBadge: 'Ambiente Seguro • Monitoramento 24h',
    },
    header: {
      appName: 'SMARTPARK',
      terminalNumber: 'TERMINAL 01',
      opticalActive: 'ONLINE • LEITOR ÓTICO ATIVO',
      stepScan: '1. LEITURA',
      stepPayment: '2. PAGAMENTO',
      stepRelease: '3. SAÍDA (20 MIN)',
      soundTooltip: 'Efeitos sonoros',
      voiceTooltip: 'Guia por voz sintetizada',
      wheelchairTooltip: 'Modo Acessível (Cadeirante)',
      contrastTooltip: 'Alto Contraste',
      fullscreenTooltip: 'Tela Cheia (Kiosk)',
      simulatorTooltip: 'Simulador de Entrada',
    },
    scan: {
      instructionTitle: 'Aproxime o Ticket de Estacionamento',
      instructionSub: 'Posicione o código de barras ou QR code em frente ao feixe laser vermelho',
      opticalSlotLabel: 'SENSOR ÓTICO DE LEITURA',
      opticalSlotSub: 'Mantenha o código a cerca de 10cm do vidro',
      testPillsLabel: 'TICKETS PARA TESTE RÁPIDO:',
      manualToggle: 'DIGITAÇÃO MANUAL',
      manualPlaceholder: 'DIGITE O CÓDIGO DO TICKET OU PLACA',
      manualSubmit: 'CONSULTAR',
      errorPrefix: 'Erro de leitura',
    },
    payment: {
      cancelAndBack: 'Cancelar e Ler Outro',
      activeSession: 'Ticket Ativo:',
      stayLabel: 'Permanência',
      entryLabel: 'ENTRADA:',
      plateLabel: 'Placa:',
      noPlate: 'Sem placa',
      toleranceAfter: 'Tolerância pós-pgto: 20 min',
      totalToPay: 'Total a Pagar',
      freeTolerance: 'Isento',
      rotaryTariff: 'Tarifa Rotativa',
      auditedCalc: 'Cálculo auditado automaticamente',
      freeTitle: 'Permanência Isenta de Cobrança',
      freeDesc: 'Você está dentro da tolerância de entrada gratuita. Clique no botão abaixo para validar seu ticket e liberar a cancela de saída.',
      freeButton: 'LIBERAR SAÍDA GRATUITA',
      selectMethod: 'Forma de Pagamento:',
      touchToSelect: 'Toque para selecionar',
      pixTitle: 'PIX',
      pixSubtitle: 'Instantâneo',
      debitTitle: 'Débito',
      debitSubtitle: 'Aproximação / Chip',
      creditTitle: 'Crédito',
      creditSubtitle: 'À vista',
      pixHowTo: 'COMO PAGAR COM PIX:',
      pixStep1: 'Abra o app do seu banco ou carteira digital.',
      pixStep2: 'Escolha pagar com QR Code PIX.',
      pixStep3: 'Aponte a câmera para a imagem ao lado.',
      pixConfirmBtn: 'Confirmar Pagamento PIX',
      pixProcessing: 'Confirmando pagamento no Banco Central...',
      cardInstruction: 'Aproxime seu cartão (Contactless / NFC) ou insira com o chip na leitora frontal do terminal.',
      cardSimulateBtn: 'Aproximar ou Inserir Cartão',
      cardReading: 'Lendo dados do cartão...',
      cardAuthorizing: 'Conectando com a adquirente...',
      cardApproved: 'Pagamento Autorizado!',
      securityEmv: 'Criptografia EMV / PCI-DSS',
    },
    release: {
      countdownLabel: 'Tolerância',
      gateReleased: 'CANCELA DE SAÍDA LIBERADA',
      exitRuleText: 'Apresente o ticket validado no sensor ótico da cancela em até 20 minutos para liberação imediata.',
      ticketBadgePaid: 'PAGO',
      opticalGateNotice: 'Aproxime no leitor ótico da cancela',
      receiptPromptTitle: 'Nota Fiscal (NFC-e)',
      receiptPromptDesc: 'Deseja imprimir a sua Nota Fiscal de Consumidor Eletrônica no compartimento do totem?',
      receiptBtnYes: 'Sim, Imprimir Nota Fiscal',
      receiptBtnNo: 'Não Imprimir (Ecológico)',
      receiptPrinting: 'Imprimindo no compartimento inferior...',
      receiptPrinted: 'Nota Fiscal Emitida!',
      receiptReprint: 'Reimprimir comprovante',
      receiptNoPrint: 'Opção sem papel registrada',
      receiptChangeMind: 'Mudei de ideia, imprimir',
      sefazAuth: 'DANFE NFC-e SEFAZ Autenticado',
      finishBtn: 'Concluir e Liberar Token',
      autoResetNotice: 'Retornando à tela de descanso em',
    },
    footer: {
      kioskTitle: 'TERMINAL DE AUTOATENDIMENTO • CERTIFICADO PCI',
      pciBadge: 'TOTEM INDUSTRIAL',
      toleranceNotice: 'TOLERÂNCIA DE SAÍDA: 20 MIN',
      supportLine: 'CENTRAL: 0800 123 4567',
    },
    voice: {
      welcome: 'Bem-vindo ao SmartPark. Por favor, aproxime o seu ticket do leitor ótico.',
      freeRelease: 'Permanência isenta de cobrança. Pressione o botão para liberar a cancela.',
      stayDue: (tempo: string, valor: string) =>
        `Permanência registrada de ${tempo}. Total a pagar: ${valor}. Selecione a forma de pagamento.`,
      paymentApproved:
        'Pagamento aprovado. Você tem vinte minutos para apresentar seu ticket na cancela de saída.',
    },
  },
  en: {
    attract: {
      title: 'SMARTPARK',
      terminalName: 'SELF-SERVICE KIOSK',
      statusOnline: 'SYSTEM ONLINE • READY TO SERVE',
      touchToStart: 'TOUCH THE SCREEN TO START',
      touchSubtitle: 'Or scan your parking ticket directly on the optical reader',
      vacanciesTitle: 'Real-Time Spaces',
      vacanciesAvailable: '142 AVAILABLE SPACES',
      floorG1: 'LEVEL 1: 48',
      floorG2: 'LEVEL 2: 94',
      barcodeTip: 'High-precision laser optical scanner active',
      securityBadge: 'Secure Environment • 24h Monitoring',
    },
    header: {
      appName: 'SMARTPARK',
      terminalNumber: 'TERMINAL 01',
      opticalActive: 'ONLINE • OPTICAL SCANNER ACTIVE',
      stepScan: '1. SCAN',
      stepPayment: '2. PAYMENT',
      stepRelease: '3. EXIT (20 MIN)',
      soundTooltip: 'Sound effects',
      voiceTooltip: 'Synthesized voice guide',
      wheelchairTooltip: 'Accessibility Mode (Wheelchair)',
      contrastTooltip: 'High Contrast',
      fullscreenTooltip: 'Fullscreen (Kiosk)',
      simulatorTooltip: 'Entry Simulator',
    },
    scan: {
      instructionTitle: 'Scan Your Parking Ticket',
      instructionSub: 'Place the barcode or QR code in front of the red laser beam',
      opticalSlotLabel: 'OPTICAL SCANNER SLOT',
      opticalSlotSub: 'Hold ticket about 10cm from glass',
      testPillsLabel: 'QUICK TEST TICKETS:',
      manualToggle: 'MANUAL ENTRY',
      manualPlaceholder: 'ENTER TICKET NUMBER OR LICENSE PLATE',
      manualSubmit: 'SEARCH',
      errorPrefix: 'Scan error',
    },
    payment: {
      cancelAndBack: 'Cancel & Scan Another',
      activeSession: 'Active Ticket:',
      stayLabel: 'Duration',
      entryLabel: 'ENTRY:',
      plateLabel: 'Plate:',
      noPlate: 'No plate',
      toleranceAfter: 'Exit window: 20 mins',
      totalToPay: 'Total Due',
      freeTolerance: 'Free',
      rotaryTariff: 'Hourly Tariff',
      auditedCalc: 'Audited tariff calculation',
      freeTitle: 'Grace Period Exemption',
      freeDesc: 'You are within the free entrance tolerance. Press below to validate your ticket and release the exit barrier.',
      freeButton: 'RELEASE FREE EXIT',
      selectMethod: 'Payment Method:',
      touchToSelect: 'Tap to choose',
      pixTitle: 'PIX',
      pixSubtitle: 'Instant QR',
      debitTitle: 'Debit',
      debitSubtitle: 'Contactless / Chip',
      creditTitle: 'Credit',
      creditSubtitle: 'Single payment',
      pixHowTo: 'HOW TO PAY WITH PIX:',
      pixStep1: 'Open your banking app or digital wallet.',
      pixStep2: 'Select Pay with QR Code.',
      pixStep3: 'Point your camera at the QR Code.',
      pixConfirmBtn: 'Confirm PIX Payment',
      pixProcessing: 'Confirming with Central Bank...',
      cardInstruction: 'Tap your card (NFC Contactless) or insert chip into the front reader.',
      cardSimulateBtn: 'Tap or Insert Card',
      cardReading: 'Reading chip data...',
      cardAuthorizing: 'Connecting to bank...',
      cardApproved: 'Payment Approved!',
      securityEmv: 'EMV / PCI-DSS Encryption',
    },
    release: {
      countdownLabel: 'Exit Time',
      gateReleased: 'EXIT GATE RELEASED',
      exitRuleText: 'Scan your validated ticket at the gate barrier within 20 minutes for immediate release.',
      ticketBadgePaid: 'PAID',
      opticalGateNotice: 'Scan at the exit barrier reader',
      receiptPromptTitle: 'Fiscal Receipt (NFC-e)',
      receiptPromptDesc: 'Would you like to print your official receipt from the dispenser?',
      receiptBtnYes: 'Yes, Print Receipt',
      receiptBtnNo: 'Do Not Print (Paperless)',
      receiptPrinting: 'Printing in lower compartment...',
      receiptPrinted: 'Receipt Issued!',
      receiptReprint: 'Reprint receipt',
      receiptNoPrint: 'Paperless option saved',
      receiptChangeMind: 'Changed my mind, print',
      sefazAuth: 'Authorized Tax Invoice',
      finishBtn: 'Finish and Release Token',
      autoResetNotice: 'Returning to idle screen in',
    },
    footer: {
      kioskTitle: 'SELF-SERVICE TERMINAL • PCI CERTIFIED',
      pciBadge: 'INDUSTRIAL KIOSK',
      toleranceNotice: 'EXIT TOLERANCE: 20 MINS',
      supportLine: 'HOTLINE: 0800 123 4567',
    },
    voice: {
      welcome: 'Welcome to SmartPark. Please place your ticket in front of the optical reader.',
      freeRelease: 'Stay is free of charge. Press the button to release the exit barrier.',
      stayDue: (tempo: string, valor: string) =>
        `Recorded stay of ${tempo}. Total due: ${valor}. Please choose your payment method.`,
      paymentApproved:
        'Payment approved. You have twenty minutes to scan your ticket at the exit barrier.',
    },
  },
  es: {
    attract: {
      title: 'SMARTPARK',
      terminalName: 'TOTEM DE AUTOATENCIÓN',
      statusOnline: 'SISTEMA ONLINE • LISTO PARA ATENDER',
      touchToStart: 'TOQUE LA PANTALLA PARA INICIAR',
      touchSubtitle: 'O acerque su boleto directamente al lector óptico',
      vacanciesTitle: 'Plazas en Tiempo Real',
      vacanciesAvailable: '142 PLAZAS LIBRES',
      floorG1: 'NIVEL G1: 48',
      floorG2: 'NIVEL G2: 94',
      barcodeTip: 'Lector óptico activo con láser de alta precisión',
      securityBadge: 'Ambiente Seguro • Monitoreo 24h',
    },
    header: {
      appName: 'SMARTPARK',
      terminalNumber: 'TERMINAL 01',
      opticalActive: 'ONLINE • LECTOR ÓPTICO ACTIVO',
      stepScan: '1. LECTURA',
      stepPayment: '2. PAGO',
      stepRelease: '3. SALIDA (20 MIN)',
      soundTooltip: 'Efectos sonoros',
      voiceTooltip: 'Guía por voz sintetizada',
      wheelchairTooltip: 'Modo Accesible (Silla de ruedas)',
      contrastTooltip: 'Alto Contraste',
      fullscreenTooltip: 'Pantalla Completa (Kiosco)',
      simulatorTooltip: 'Simulador de Entrada',
    },
    scan: {
      instructionTitle: 'Acerque el Boleto de Estacionamiento',
      instructionSub: 'Ubique el código de barras o QR frente al haz de láser rojo',
      opticalSlotLabel: 'SENSOR ÓPTICO DE LECTURA',
      opticalSlotSub: 'Mantenga el código a 10cm del cristal',
      testPillsLabel: 'BOLETOS PARA PRUEBA RÁPIDA:',
      manualToggle: 'DIGITACIÓN MANUAL',
      manualPlaceholder: 'DIGITE EL CÓDIGO O MATRÍCULA',
      manualSubmit: 'CONSULTAR',
      errorPrefix: 'Error de lectura',
    },
    payment: {
      cancelAndBack: 'Cancelar y Leer Otro',
      activeSession: 'Boleto Activo:',
      stayLabel: 'Permanencia',
      entryLabel: 'ENTRADA:',
      plateLabel: 'Matrícula:',
      noPlate: 'Sin matrícula',
      toleranceAfter: 'Tolerancia post-pago: 20 min',
      totalToPay: 'Total a Pagar',
      freeTolerance: 'Exento',
      rotaryTariff: 'Tarifa Rotativa',
      auditedCalc: 'Cálculo auditado automáticamente',
      freeTitle: 'Permanencia Exenta de Pago',
      freeDesc: 'Está dentro del período de cortesía. Presione abajo para validar su boleto y liberar la barrera.',
      freeButton: 'LIBERAR SALIDA GRATIS',
      selectMethod: 'Forma de Pago:',
      touchToSelect: 'Toque para seleccionar',
      pixTitle: 'PIX',
      pixSubtitle: 'Instantáneo',
      debitTitle: 'Débito',
      debitSubtitle: 'Contactless / Chip',
      creditTitle: 'Crédito',
      creditSubtitle: 'Al contado',
      pixHowTo: 'CÓMO PAGAR CON PIX:',
      pixStep1: 'Abra su app bancaria o billetera digital.',
      pixStep2: 'Seleccione pagar con Código QR.',
      pixStep3: 'Apunte la cámara a la imagen al lado.',
      pixConfirmBtn: 'Confirmar Pago PIX',
      pixProcessing: 'Confirmando con Banco Central...',
      cardInstruction: 'Acerque su tarjeta (Contactless / NFC) o inserte el chip en la ranura frontal.',
      cardSimulateBtn: 'Acercar o Insertar Tarjeta',
      cardReading: 'Leyendo chip...',
      cardAuthorizing: 'Conectando con adquirente...',
      cardApproved: '¡Pago Aprobado!',
      securityEmv: 'Criptografía EMV / PCI-DSS',
    },
    release: {
      countdownLabel: 'Tolerancia',
      gateReleased: 'BARRERA DE SALIDA LIBERADA',
      exitRuleText: 'Presente el boleto validado en el lector de la barrera en hasta 20 minutos.',
      ticketBadgePaid: 'PAGADO',
      opticalGateNotice: 'Acerque al sensor óptico de la barrera',
      receiptPromptTitle: 'Factura Fiscal (NFC-e)',
      receiptPromptDesc: '¿Desea imprimir su comprobante fiscal en el compartimento del tótem?',
      receiptBtnYes: 'Sí, Imprimir Comprobante',
      receiptBtnNo: 'No Imprimir (Ecológico)',
      receiptPrinting: 'Imprimiendo en el compartimento...',
      receiptPrinted: '¡Comprobante Emitido!',
      receiptReprint: 'Reimprimir comprobante',
      receiptNoPrint: 'Opción ecológica registrada',
      receiptChangeMind: 'Cambié de opinión, imprimir',
      sefazAuth: 'Comprobante Fiscal Autorizado',
      finishBtn: 'Finalizar y Liberar Token',
      autoResetNotice: 'Volviendo a la pantalla de descanso en',
    },
    footer: {
      kioskTitle: 'TERMINAL DE AUTOATENCIÓN • CERTIFICADO PCI',
      pciBadge: 'TÓTEM INDUSTRIAL',
      toleranceNotice: 'TOLERANCIA DE SALIDA: 20 MIN',
      supportLine: 'CENTRAL: 0800 123 4567',
    },
    voice: {
      welcome: 'Bienvenido a SmartPark. Por favor acerque su boleto al lector óptico.',
      freeRelease: 'Permanencia exenta de cobro. Presione el botón para liberar la barrera.',
      stayDue: (tempo: string, valor: string) =>
        `Permanencia registrada de ${tempo}. Total a pagar: ${valor}. Seleccione la forma de pago.`,
      paymentApproved:
        'Pago aprobado. Tiene veinte minutos para presentar su boleto en la barrera de salida.',
    },
  },
};
