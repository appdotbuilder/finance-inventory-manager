import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatsCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: string;
  gradient: string;
  textColor: string;
}

export function StatsCard({ title, value, description, icon, gradient, textColor }: StatsCardProps) {
  return (
    <Card className={`${gradient} border-0 shadow-lg card-hover`}>
      <CardHeader className="pb-3">
        <CardTitle className={`text-sm font-medium ${textColor} flex items-center gap-2`}>
          <span>{icon}</span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${textColor.replace('600', '900')}`}>
          {typeof value === 'number' && title.toLowerCase().includes('amount') 
            ? `$${value.toFixed(2)}`
            : value
          }
        </div>
        <p className={`text-xs ${textColor} mt-1 opacity-80`}>{description}</p>
      </CardContent>
    </Card>
  );
}