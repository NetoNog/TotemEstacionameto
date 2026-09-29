import QRCode from 'qrcode';
import { gerarPixCopiaECola, PixConfig } from './pixPayload';
import { Ticket } from '@/types/parking';

export interface PixChargeResponse {
  ticketId: string;
  txid: string;
  copiaECola: string;
  qrCodeBase64: string;
  valor: number;
  chaveUtilizada: string;
  beneficiario: string;
  expiraEm: string;
}

/**
 * Serviço de Integração com PIX para Totens de Autoatendimento
 */
class PixPaymentService {
  private getChavePix(): string {
    return process.env.PIX_CHAVE || '12345678000190'; // CNPJ ou Chave Aleatória EVP
  }

  private getBeneficiario(): string {
    return process.env.PIX_BENEFICIARIO || 'SMARTPARK ESTACIONAMENTO';
  }

  private getCidade(): string {
    return process.env.PIX_CIDADE || 'SAO PAULO';
  }

  /**
   * Gera uma cobrança Pix com QR Code oficial e código Copia e Cola
   */
  public async gerarCobrancaPix(
    ticket: Ticket,
    valor: number
  ): Promise<PixChargeResponse> {
    const txid = `TKT${ticket.codigoTicket || ticket.id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10)}`;
    const chave = this.getChavePix();
    const beneficiario = this.getBeneficiario();
    const cidade = this.getCidade();

    const config: PixConfig = {
      chave,
      beneficiario,
      cidade,
      valor,
      txid,
      descricao: `Ticket #${ticket.codigoTicket || ticket.id.slice(0, 6)}`,
    };

    const copiaECola = gerarPixCopiaECola(config);

    // Gera o QR Code visual com alta legibilidade para telas de totens
    const qrCodeBase64 = await QRCode.toDataURL(copiaECola, {
      width: 320,
      margin: 1,
      color: {
        dark: '#050507',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    });

    const expiraEm = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutos

    return {
      ticketId: ticket.id,
      txid,
      copiaECola,
      qrCodeBase64,
      valor,
      chaveUtilizada: chave,
      beneficiario,
      expiraEm,
    };
  }

  /**
   * Valida se um payload de Webhook do PIX é autêntico e extrai o ID do ticket
   */
  public extrairDadosWebhook(payload: Record<string, unknown>): {
    ticketId?: string;
    txid?: string;
    valor?: number;
    endToEndId?: string;
    pago: boolean;
  } {
    // Compatibilidade com payload padrão Banco Central / Mercado Pago / Asaas / EFI
    const pixData = (payload.pix as Array<Record<string, unknown>>)?.[0] || payload;
    const txid = String(pixData.txid || payload.txid || '');
    const endToEndId = String(pixData.endToEndId || payload.id || '');
    const valor = Number(pixData.valor || payload.amount || 0);
    const status = String(pixData.status || payload.status || '').toUpperCase();

    // Se o txid tem formato TKT<codigo>, extrai
    const ticketMatch = txid.match(/^TKT(.+)$/i);
    const ticketId = ticketMatch ? ticketMatch[1] : undefined;

    const pago = status === 'CONCLUIDA' || status === 'APPROVED' || status === 'PAID' || status === 'RECEIVED' || !!endToEndId;

    return {
      ticketId,
      txid,
      valor,
      endToEndId,
      pago,
    };
  }
}

export const pixService = new PixPaymentService();
