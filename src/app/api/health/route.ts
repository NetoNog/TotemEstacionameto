import { testarConexaoBanco } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  const dbStatus = await testarConexaoBanco();
  const responseTimeMs = Date.now() - startTime;

  const memory = process.memoryUsage();

  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    responseTimeMs,
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: dbStatus.conectado ? 'connected' : 'fallback_memory_active',
      driver: dbStatus.driver,
      erro: dbStatus.erro || null,
    },
    system: {
      heapUsedMB: Math.round(memory.heapUsed / 1024 / 1024),
      rssMB: Math.round(memory.rss / 1024 / 1024),
    },
    version: '1.0.0',
  };

  return NextResponse.json(healthData, { status: 200 });
}
