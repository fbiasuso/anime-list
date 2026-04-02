import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { animeService, Season, AnimeWithProgress } from '@/services/anime';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const currentYear = new Date().getFullYear();
const seasons: Season[] = ['WINTER', 'SPRING', 'SUMMER', 'FALL'];

const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const dayLabels: Record<string, string> = {
  MONDAY: 'Lunes',
  TUESDAY: 'Martes',
  WEDNESDAY: 'Miércoles',
  THURSDAY: 'Jueves',
  FRIDAY: 'Viernes',
  SATURDAY: 'Sábado',
  SUNDAY: 'Domingo',
};

export default function CalendarPage() {
  const [selectedSeason, setSelectedSeason] = useState<Season>('SPRING');
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const { data, isLoading, error } = useQuery({
    queryKey: ['animes-calendar', selectedSeason, selectedYear],
    queryFn: () => animeService.getSeasonAnimes(selectedSeason, selectedYear),
  });

  // Group animes by airing day
  const animesByDay = days.reduce((acc, day) => {
    acc[day] = data?.animes?.filter((a) => a.airingDay === day) || [];
    return acc;
  }, {} as Record<string, AnimeWithProgress[]>);

  return (
    <div className="pb-20">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Calendario</h2>
        <div className="flex gap-2">
          <Select value={selectedSeason} onValueChange={(v) => setSelectedSeason(v as Season)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {seasons.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[currentYear, currentYear - 1, currentYear - 2].map((y) => (
                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading && (
        <div className="text-center py-8 text-muted-foreground">Cargando calendario...</div>
      )}

      {error && (
        <div className="text-center py-8 text-destructive">Error al cargar calendario</div>
      )}

      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => (
          <div key={day} className="min-h-[200px]">
            <div className="text-center font-medium text-sm py-2 bg-muted rounded-t-md">
              {dayLabels[day]}
            </div>
            <div className="space-y-2 p-1">
              {animesByDay[day]?.map((anime) => (
                <Card key={anime.id} className="p-2 text-xs">
                  {anime.coverImage && (
                    <img 
                      src={anime.coverImage} 
                      alt={anime.title}
                      className="w-full h-16 object-cover rounded mb-1"
                    />
                  )}
                  <p className="line-clamp-2 font-medium">{anime.title}</p>
                  {anime.episodes && (
                    <p className="text-muted-foreground">{anime.episodes} eps</p>
                  )}
                </Card>
              ))}
              {(!animesByDay[day] || animesByDay[day].length === 0) && (
                <div className="text-center text-muted-foreground text-xs py-4">
                  —
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
