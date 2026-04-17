import { PackEditor } from '@/components/author/pack-editor';

interface PackEditorRouteProps {
  params: Promise<{ slug: string }>;
}

export default async function PackEditorRoute({ params }: PackEditorRouteProps) {
  const { slug } = await params;
  return <PackEditor slug={slug} />;
}
