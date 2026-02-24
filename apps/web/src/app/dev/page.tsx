import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Toggle } from '@/components/ui/toggle';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <div className="flex flex-wrap items-start gap-3">{children}</div>
    </section>
  );
}

function ColorSwatch({ name, className }: { name: string; className: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`h-12 w-12 rounded-md border ${className}`} />
      <span className="text-xs text-muted-foreground">{name}</span>
    </div>
  );
}

export default function DevPage() {
  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Design System Preview
        </h1>
        <p className="mt-1 text-muted-foreground">
          All components rendered for visual validation.
        </p>
      </div>

      {/* Color Palette */}
      <Section title="Color Palette">
        <ColorSwatch name="primary" className="bg-primary" />
        <ColorSwatch name="secondary" className="bg-secondary" />
        <ColorSwatch name="muted" className="bg-muted" />
        <ColorSwatch name="accent" className="bg-accent" />
        <ColorSwatch name="destructive" className="bg-destructive" />
        <ColorSwatch name="pass" className="bg-pass" />
        <ColorSwatch name="fail" className="bg-fail" />
        <ColorSwatch name="beginner" className="bg-difficulty-beginner" />
        <ColorSwatch
          name="intermediate"
          className="bg-difficulty-intermediate"
        />
        <ColorSwatch name="advanced" className="bg-difficulty-advanced" />
        <ColorSwatch name="background" className="bg-background" />
        <ColorSwatch name="foreground" className="bg-foreground" />
      </Section>

      {/* Buttons */}
      <Section title="Buttons">
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
        <Button size="sm">Small</Button>
        <Button size="lg">Large</Button>
        <Button disabled>Disabled</Button>
      </Section>

      {/* Badges */}
      <Section title="Badges">
        <Badge>Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="destructive">Destructive</Badge>
        <Badge variant="outline">Outline</Badge>
        <Badge variant="beginner">Beginner</Badge>
        <Badge variant="intermediate">Intermediate</Badge>
        <Badge variant="advanced">Advanced</Badge>
        <Badge variant="pass">Pass</Badge>
        <Badge variant="fail">Fail</Badge>
        <Badge variant="not-attempted">Not Attempted</Badge>
      </Section>

      {/* Cards */}
      <Section title="Cards">
        <Card className="w-80">
          <CardHeader>
            <CardTitle>Challenge Card</CardTitle>
            <CardDescription>
              Example card with standard header/content.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Badge variant="beginner">Beginner</Badge>
              <Badge variant="outline">TypeScript</Badge>
            </div>
          </CardContent>
        </Card>
        <Card className="w-80">
          <CardHeader>
            <CardTitle>Results Card</CardTitle>
            <CardDescription>Verification feedback example.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Badge variant="pass">3 passed</Badge>
              <Badge variant="fail">1 failed</Badge>
            </div>
          </CardContent>
        </Card>
      </Section>

      {/* Form Elements */}
      <Section title="Form Elements">
        <Input placeholder="Search challenges..." className="w-64" />
        <Select>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <Checkbox id="show-hints" />
          <label
            htmlFor="show-hints"
            className="text-sm font-medium leading-none"
          >
            Show hints
          </label>
        </div>
        <Toggle>Vim Mode</Toggle>
      </Section>

      {/* Tabs */}
      <Section title="Tabs">
        <Tabs defaultValue="code" className="w-full max-w-md">
          <TabsList>
            <TabsTrigger value="code">Code</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="tests">Tests</TabsTrigger>
          </TabsList>
          <TabsContent value="code">
            <Card>
              <CardContent className="pt-6">
                <pre className="rounded-md bg-muted p-4 font-mono text-sm">
                  {'function greet(name: string) {\n  return `Hello, ${name}!`;\n}'}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="preview">
            <Card>
              <CardContent className="pt-6 text-sm text-muted-foreground">
                Preview panel placeholder.
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="tests">
            <Card>
              <CardContent className="pt-6 text-sm text-muted-foreground">
                Test results panel placeholder.
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </Section>

      {/* Typography */}
      <Section title="Typography">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Sans: The quick brown fox jumps over the lazy dog
          </p>
          <p className="font-mono text-sm text-muted-foreground">
            Mono: const x = 42; // JetBrains Mono
          </p>
        </div>
      </Section>

      {/* Transition */}
      <Section title="Factory Transition">
        <div className="rounded-lg border bg-card p-6 transition-colors duration-300 ease-factory hover:bg-accent">
          ease-factory hover
        </div>
      </Section>
    </div>
  );
}
