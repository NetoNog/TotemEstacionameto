/**
 * Gerador de Payload PIX Oficial Padrão Banco Central do Brasil (EMVco / BR Code)
 * Implementa cálculo oficial de CRC16-CCITT (Polinômio 0x1021)
 * Compatível com todos os aplicativos bancários (Nubank, Itaú, Bradesco, BB, Caixa, Santander, Inter, etc.)
 */

export interface PixConfig {
  chave: string; // Chave PIX (EVP, CNPJ, CPF, Telefone ou E-mail)
  beneficiario: string; // Nome do recebedor (até 25 caracteres, sem acentos)
  cidade: string; // Cidade do recebedor (até 15 caracteres, sem acentos)
  valor?: number; // Valor em reais (opcional para cobrança estática)
  txid?: string; // Identificador da transação (até 25 caracteres)
  descricao?: string; // Descrição opcional (até 25 caracteres)
}

/**
 * Remove acentuação e caracteres especiais para compatibilidade com o padrão EMVco
 */
function sanitizarTexto(texto: string, maxLen: number): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .replace(/[^a-zA-Z0-9 ]/g, '') // apenas alfanuméricos e espaços
    .trim()
    .toUpperCase()
    .slice(0, maxLen);
}

/**
 * Formata um campo no formato TLV (Tag-Length-Value)
 */
function formatarTLV(id: string, valor: string): string {
  const tamanho = valor.length.toString().padStart(2, '0');
  return `${id}${tamanho}${valor}`;
}

/**
 * Cálculo oficial do CRC16-CCITT (0xFFFF, 0x1021)
 */
export function calcularCRC16(payload: string): string {
  let crc = 0xffff;
  const polinomio = 0x1021;

  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ polinomio;
      } else {
        crc <<= 1;
      }
      crc &= 0xffff;
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Gera a string oficial do Pix Copia e Cola / QR Code com CRC16 válido
 */
export function gerarPixCopiaECola(config: PixConfig): string {
  const beneficiario = sanitizarTexto(config.beneficiario || 'SMARTPARK TOTEM', 25);
  const cidade = sanitizarTexto(config.cidade || 'SAO PAULO', 15);
  const chave = config.chave.trim();
  const txid = config.txid ? sanitizarTexto(config.txid, 25) : '***';

  // ID 00: Payload Format Indicator
  let payload = formatarTLV('00', '01');

  // ID 01: Point of Initiation Method (12 = dinâmico, 11 = estático)
  payload += formatarTLV('01', '12');

  // ID 26: Merchant Account Information
  let merchantInfo = formatarTLV('00', 'br.gov.bcb.pix');
  merchantInfo += formatarTLV('01', chave);
  if (config.descricao) {
    merchantInfo += formatarTLV('02', sanitizarTexto(config.descricao, 25));
  }
  payload += formatarTLV('26', merchantInfo);

  // ID 52: Merchant Category Code (0000 = Padrão)
  payload += formatarTLV('52', '0000');

  // ID 53: Transaction Currency (986 = Real Brasileiro - BRL)
  payload += formatarTLV('53', '986');

  // ID 54: Transaction Amount
  if (config.valor && config.valor > 0) {
    payload += formatarTLV('54', config.valor.toFixed(2));
  }

  // ID 58: Country Code (BR)
  payload += formatarTLV('58', 'BR');

  // ID 59: Merchant Name
  payload += formatarTLV('59', beneficiario);

  // ID 60: Merchant City
  payload += formatarTLV('60', cidade);

  // ID 62: Additional Data Field Template (TxID)
  const additionalData = formatarTLV('05', txid);
  payload += formatarTLV('62', additionalData);

  // ID 63: CRC16 com 4 caracteres
  payload += '6304';
  const crc = calcularCRC16(payload);

  return `${payload}${crc}`;
}
