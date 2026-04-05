import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PackCardProps {
  slug: string;
  name: string;
  description: string;
  language: string;
  framework?: string;
  tags: readonly string[];
  prerequisites?: readonly string[];
  allPacks?: readonly { slug: string; name: string }[];
  challengeCount: number;
  passedCount: number;
}

export function PackCard({
  slug,
  name,
  description,
  language,
  framework,
  tags,
  prerequisites,
  allPacks,
  challengeCount,
  passedCount,
}: PackCardProps) {
  const progress = challengeCount > 0 ? (passedCount / challengeCount) * 100 : 0;

  return (
    <Link href={`/pack/${slug}`} className="group block">
      <Card className="h-full transition-colors hover:border-primary/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{language}</Badge>
            {framework && <Badge variant="outline">{framework}</Badge>}
          </div>
          <CardTitle className="mt-2 text-lg">{name}</CardTitle>
          <CardDescription className="line-clamp-2">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1">
            {tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
        {prerequisites && prerequisites.length > 0 && (
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">
              Recommended after:{' '}
              {prerequisites
                .map((prereqSlug) => {
                  const pack = allPacks?.find((p) => p.slug === prereqSlug);
                  return pack?.name ?? prereqSlug;
                })
                .join(', ')}
            </p>
          </CardContent>
        )}
        <CardFooter className="flex-col items-start gap-2">
          <div className="text-sm text-muted-foreground">
            {passedCount}/{challengeCount} challenges
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
