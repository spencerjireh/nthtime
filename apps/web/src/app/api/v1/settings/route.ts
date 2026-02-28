import { NextResponse, type NextRequest } from 'next/server';
import { settingsRepository } from '@/lib/data-access/repositories';
import { requireAuth } from '@/lib/api-helpers';

export async function GET() {
  const [userId, authErr] = await requireAuth();
  if (authErr) return authErr;

  const settings = await settingsRepository.getSettings(userId);
  return NextResponse.json(settings);
}

export async function PATCH(req: NextRequest) {
  const [userId, authErr] = await requireAuth();
  if (authErr) return authErr;

  const body = await req.json();
  const { feedback, keybindings, darkMode, formatter } = body;
  const updated = await settingsRepository.updateSettings(userId, {
    feedback,
    keybindings,
    darkMode,
    formatter,
  });
  return NextResponse.json(updated);
}
