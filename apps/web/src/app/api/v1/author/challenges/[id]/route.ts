import { proxyToSpringBoot } from '@/lib/spring-boot-proxy';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return proxyToSpringBoot(req, `/api/author/challenges/${encodeURIComponent(id)}`);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return proxyToSpringBoot(req, `/api/author/challenges/${encodeURIComponent(id)}`);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return proxyToSpringBoot(req, `/api/author/challenges/${encodeURIComponent(id)}`);
}
