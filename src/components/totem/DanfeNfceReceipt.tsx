'use client';

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Ticket } from '@/types/parking';
import { formatarMoeda } from '@/lib/tariffCalculator';

interface DanfeNfceReceiptProps {
  ticket: Ticket;
}

export const DanfeNfceReceipt: React.FC<DanfeNfceReceiptProps> = ({ ticket }) => {
  const [sefazQrCodeUrl, setSefazQrCodeUrl] = useState<string>('');

  const valor = Number(ticket.valorTotal || 0);
  const ultimoPagamento = ticket.pagamentos && ticket.pagamentos.length > 0
    ? ticket.pagamentos[ticket.pagamentos.length - 1]
    : null;

  // Chave de acesso simulada padrão SEFAZ de 44 dígitos
  const chaveAcesso = `352609123456780001906500100008421910${(ticket.codigoTicket || '1024').padStart(8, '0')}`;
  const chaveFormatada = chaveAcesso.match(/.{1,4}/g)?.join(' ') || chaveAcesso;
  // Protocolo gerado de forma determinística e idempotente a partir do ticket
  const seed = (ticket.id || ticket.codigoTicket || '1024')
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 10000000);
  const protocoloAutorizacao = `1352600${String(seed * 7919).slice(0, 8).padEnd(8, '0')}`;

  // Gera o QR Code oficial de consulta da NFC-e SEFAZ
  useEffect(() => {
    const sefazPayload = `https://www.nfce.fazenda.sp.gov.br/qrcode?p=${chaveAcesso}|2|1|1|${valor.toFixed(2)}`;
    QRCode.toDataURL(sefazPayload, {
      width: 140,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    })
      .then((url) => setSefazQrCodeUrl(url))
      .catch((err) => console.error('Erro ao gerar QR Code SEFAZ:', err));
  }, [chaveAcesso, valor]);

  const dataHoraEmissao = new Date().toLocaleString('pt-BR');
  const valorTributos = (valor * 0.1845).toFixed(2); // ~18.45% Lei 12.741/2012

  return (
    <div id="danfe-nfce-print-area" className="text-black bg-white font-mono text-[11px] leading-tight">
      {/* 1. DADOS DO EMISSOR */}
      <div className="text-center font-bold text-xs uppercase">
        SMARTPARK ESTACIONAMENTOS LTDA
      </div>
      <div className="text-center text-[10px]">
        CNPJ: 12.345.678/0001-90 &nbsp; IE: 110.234.567.890
      </div>
      <div className="text-center text-[10px]">
        AV. PAULISTA, 1000 - BELA VISTA - SÃO PAULO - SP
      </div>

      <div className="my-1.5 border-b border-dashed border-black" />

      {/* 2. TÍTULO DO DOCUMENTO FISCAL */}
      <div className="text-center font-bold text-[11px]">
        DANFE NFC-e - Documento Auxiliar da
      </div>
      <div className="text-center font-bold text-[11px]">
        Nota Fiscal de Consumidor Eletrônica
      </div>
      <div className="text-center text-[9px] uppercase mt-0.5">
        Não permite aproveitamento de crédito de ICMS
      </div>

      <div className="my-1.5 border-b border-dashed border-black" />

      {/* 3. DETALHAMENTO DOS ITENS / SERVIÇO */}
      <div className="text-[10px]">
        <div className="flex justify-between font-bold pb-1 border-b border-black">
          <span># CÓD DESCRIÇÃO</span>
          <span>QTD UN VL.TOT</span>
        </div>
        <div className="pt-1">
          <div className="flex justify-between">
            <span className="font-bold">001 01 SERV. ESTACIONAMENTO ROTATIVO</span>
          </div>
          <div className="flex justify-between pl-2">
            <span>1 UN X {formatarMoeda(valor)}</span>
            <span className="font-bold">{formatarMoeda(valor)}</span>
          </div>
        </div>
      </div>

      <div className="my-1.5 border-b border-dashed border-black" />

      {/* 4. TOTALIZAÇÃO E FORMA DE PAGAMENTO */}
      <div className="space-y-1 text-[10px]">
        <div className="flex justify-between font-bold">
          <span>QTD. TOTAL DE ITENS</span>
          <span>1</span>
        </div>
        <div className="flex justify-between font-extrabold text-xs">
          <span>VALOR TOTAL R$</span>
          <span>{formatarMoeda(valor)}</span>
        </div>
        <div className="flex justify-between">
          <span>FORMA DE PAGAMENTO:</span>
          <span>VALOR PAGO R$</span>
        </div>
        <div className="flex justify-between pl-2 font-bold">
          <span>{ultimoPagamento?.metodo?.replace('_', ' ') || 'PIX'}</span>
          <span>{formatarMoeda(valor)}</span>
        </div>
      </div>

      <div className="my-1.5 border-b border-dashed border-black" />

      {/* 5. INFORMAÇÃO DOS TRIBUTOS TOTAIS INCIDENTES (LEI 12.741/2012) */}
      <div className="text-[9px] text-center">
        Informação dos Tributos Totais Incidentes (Lei Federal 12.741/2012):
        <br />
        R$ {valorTributos} (13,45% Federal, 5,00% Municipal)
      </div>

      <div className="my-1.5 border-b border-dashed border-black" />

      {/* 6. NÚMERO, SÉRIE E PROTOCOLO */}
      <div className="text-[10px] space-y-0.5">
        <div className="flex justify-between">
          <span>Nº: 000.084.219</span>
          <span>Série: 001</span>
        </div>
        <div>Emissão: {dataHoraEmissao}</div>
        <div>Protocolo de Autorização: {protocoloAutorizacao}</div>
      </div>

      <div className="my-1.5 border-b border-dashed border-black" />

      {/* 7. CHAVE DE ACESSO */}
      <div className="text-center">
        <div className="text-[9px] font-bold">CHAVE DE ACESSO DA NFC-e:</div>
        <div className="text-[9px] tracking-tight font-bold my-0.5">
          {chaveFormatada}
        </div>
      </div>

      <div className="my-1.5 border-b border-dashed border-black" />

      {/* 8. CONSUMIDOR */}
      <div className="text-[10px]">
        <div>CONSUMIDOR: NÃO IDENTIFICADO</div>
        {ticket.placa && <div>VEÍCULO PLACA: {ticket.placa}</div>}
      </div>

      <div className="my-1.5 border-b border-dashed border-black" />

      {/* 9. QR CODE OFICIAL SEFAZ PARA CONSULTA */}
      <div className="flex flex-col items-center justify-center my-2">
        <div className="text-[9px] text-center mb-1">
          Consulta via leitor de QR Code
        </div>
        {sefazQrCodeUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={sefazQrCodeUrl}
            alt="QR Code Consulta SEFAZ"
            className="w-28 h-28 border border-black p-1"
          />
        )}
        <div className="text-[8px] text-center mt-1">
          Consulte pela chave de acesso em:
          <br />
          www.nfce.fazenda.sp.gov.br/consulta
        </div>
      </div>

      <div className="my-1.5 border-b border-dashed border-black" />

      {/* 10. MENSAGEM DE INTERESSE DO CONTRIBUINTE (TOLERÂNCIA DE 20 MIN) */}
      <div className="text-[9px] text-center">
        <div>TICKET REFERÊNCIA: #{ticket.codigoTicket || ticket.id}</div>
        <div className="font-bold mt-0.5">
          TOLERÂNCIA DE 20 MINUTOS PARA PASSAGEM NA CANCELA DE SAÍDA.
        </div>
        <div className="text-[8px] text-zinc-700 mt-1">
          Obrigado pela preferência!
        </div>
      </div>
    </div>
  );
};
