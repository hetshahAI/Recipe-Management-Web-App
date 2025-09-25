import { Card, CardContent } from '@/components/ui/card';

export const TestPage = () => {
  return (
    <div className="min-h-screen bg-background p-8">
      <Card>
        <CardContent className="p-6">
          <h1 className="text-2xl font-bold">Test Page</h1>
          <p>This is a test to see if basic components render.</p>
        </CardContent>
      </Card>
    </div>
  );
};