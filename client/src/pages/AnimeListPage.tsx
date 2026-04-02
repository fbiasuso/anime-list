import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { animeService, Season, AnimeWithProgress } from '@/services/anime';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Play, Check, X, Filter } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const currentYear = new Date().getFullYear();
const seasons: Season[] = ['WINTER', 'SPRING', 'SUMMER', 'FALL'];

export default function AnimeListPage() {
  const [selectedSeason, setSelectedSeason] = useState<Season>('SPRING');
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['animes', selectedSeason, selectedYear],
    queryFn: () => animeService.getSeasonAnimes(selectedSeason, selectedYear),
  });

  const updateMutation = useMutation({
    mutationFn: ({ animeId, status }: { animeId: number; status: string }) =>
      animeService.updateProgress(animeId, { status: status as any, episode: 0 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animes', selectedSeason, selectedYear] });
    },
  });

  const handleStatusChange = (anime: AnimeWithProgress, status: string) => {
    try {
      updateMutation.mutate({ animeId: anime.id, status });
      toast({ title: 'Estado actualizado', description: `${anime.title}` });
    } catch (err: any) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
    }
  };

  const filteredAnimes = data?.animes?.filter((anime) => {
    if (filterStatus === 'all') return true;
    return anime.status === filterStatus;
  }) || [];

  return (
    <div className="pb-20 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Lista de Animes</h2>
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

      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button 
          variant={filterStatus === 'all' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilterStatus('all')}
        >
          <Filter className="w-4 h-4 mr-1" /> Todos
        </Button>
        <Button 
          variant={filterStatus === 'WATCHING' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilterStatus('WATCHING')}
        >
          <Play className="w-4 h-4 mr-1" /> Viendo
        </Button>
        <Button 
          variant={filterStatus === 'COMPLETED' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilterStatus('COMPLETED')}
        >
          <Check className="w-4 h-4 mr-1" /> Completado
        </Button>
        <Button 
          variant={filterStatus === 'DROPPED' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilterStatus('DROPPED')}
        >
          <X className="w-4 h-4 mr-1" /> Abandonado
        </Button>
        <Button 
          variant={filterStatus === 'PLAN_TO_WATCH' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilterStatus('PLAN_TO_WATCH')}
        >
          <Calendar className="w-4 h-4 mr-1" /> Planeado
        </Button>
      </div>

      {isLoading && (
        <div className="text-center py-8 text-muted-foreground">Cargando animes...</div>
      )}

      {error && (
        <div className="text-center py-8 text-destructive">Error al cargar animes</div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filteredAnimes.map((anime) => (
          <Card key={anime.id} className="overflow-hidden">
            <div className="flex">
              {anime.coverImage && (
                <img 
                  src={anime.coverImage} 
                  alt={anime.title}
                  className="w-24 h-36 object-cover"
                />
              )}
              <CardContent className="flex-1 p-3">
                <h3 className="font-semibold text-sm line-clamp-2">{anime.title}</h3>
                {anime.titleEnglish && (
                  <p className="text-xs text-muted-foreground line-clamp-1">{anime.titleEnglish}</p>
                )}
                <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
                  <span>{anime.season} {anime.seasonYear}</span>
                  <span>•</span>
                  <span>{anime.format}</span>
                </div>
                <div className="flex gap-1 mt-2">
                  <Button 
                    variant={anime.status === 'WATCHING' ? 'default' : 'ghost'} 
                    size="sm" 
                    className={`h-6 text-xs px-2 ${anime.status === 'WATCHING' ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                    onClick={() => handleStatusChange(anime, 'WATCHING')}
                  >
                    Viendo
                  </Button>
                  <Button 
                    variant={anime.status === 'COMPLETED' ? 'default' : 'ghost'} 
                    size="sm" 
                    className={`h-6 text-xs px-2 ${anime.status === 'COMPLETED' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                    onClick={() => handleStatusChange(anime, 'COMPLETED')}
                  >
                    ✓
                  </Button>
                  <Button 
                    variant={anime.status === 'DROPPED' ? 'default' : 'ghost'} 
                    size="sm" 
                    className={`h-6 text-xs px-2 ${anime.status === 'DROPPED' ? 'bg-red-600 hover:bg-red-700' : ''}`}
                    onClick={() => handleStatusChange(anime, 'DROPPED')}
                  >
                    ✗
                  </Button>
                </div>
              </CardContent>
            </div>
          </Card>
        ))}
      </div>

      {filteredAnimes.length === 0 && !isLoading && (
        <div className="text-center py-8 text-muted-foreground">
          No hay animes para mostrar
        </div>
      )}
    </div>
  );
}
