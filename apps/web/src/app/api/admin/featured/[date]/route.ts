import { proxyToSpringBoot } from '@/lib/spring-boot-proxy';

export async function DELETE(req: Request, { params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  return proxyToSpringBoot(req, `/api/admin/featured/${encodeURIComponent(date)}`);
}
