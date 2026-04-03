import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { animeService, Season, AnimeWithProgress } from '@/services/anime';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Play, Check, X, Filter, ArrowDownAZ, CalendarDays } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const currentYear = new Date().getFullYear();
const seasons: Season[] = ['WINTER', 'SPRING', 'SUMMER', 'FALL'];

export default function AnimeListPage() {
  const [selectedSeason, setSelectedSeason] = useState<Season>('SPRING');
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'alphabetical' | 'release'>('alphabetical');
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

  const removeMutation = useMutation({
    mutationFn: (animeId: number) => animeService.removeProgress(animeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animes', selectedSeason, selectedYear] });
    },
  });

  const handleStatusChange = (anime: AnimeWithProgress, newStatus: string) => {
    try {
      // If clicking the same status that's already active, remove it entirely
      if (anime.status === newStatus) {
        removeMutation.mutate(anime.id);
        toast({ title: 'Estado eliminado', description: `${anime.title}` });
        return;
      }
      
      // Otherwise, set the new status (overwrites previous)
      updateMutation.mutate({ animeId: anime.id, status: newStatus });
      toast({ title: 'Estado actualizado', description: `${anime.title}` });
    } catch (err: any) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
    }
  };

  const filteredAnimes = useMemo(() => {
    const filtered = (data?.animes || []).filter((anime) => {
      if (filterStatus === 'all') return true;
      return anime.status === filterStatus;
    });
    
    // Sort based on selected option
    if (sortBy === 'alphabetical') {
      return filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      // Sort by release date (newest first) - using seasonYear and season
      const seasonOrder = { WINTER: 0, SPRING: 1, SUMMER: 2, FALL: 3 };
      return filtered.sort((a, b) => {
        if (a.seasonYear !== b.seasonYear) {
          return b.seasonYear - a.seasonYear;
        }
        return (seasonOrder[b.season as keyof typeof seasonOrder] || 0) - 
               (seasonOrder[a.season as keyof typeof seasonOrder] || 0);
      });
    }
  }, [data, filterStatus, sortBy]);

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
        
        <div className="flex gap-1">
          <Button
            variant={sortBy === 'alphabetical' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('alphabetical')}
            title="Orden alfabético"
          >
            <ArrowDownAZ className="w-4 h-4" />
          </Button>
          <Button
            variant={sortBy === 'release' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('release')}
            title="Fecha de estreno (más reciente)"
          >
            <CalendarDays className="w-4 h-4" />
          </Button>
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
                    variant="outline"
                    size="sm" 
                    className={`h-6 text-xs px-2 ${anime.status === 'WATCHING' ? '!bg-blue-600 !text-white hover:!bg-blue-700' : ''}`}
                    onClick={() => handleStatusChange(anime, 'WATCHING')}
                  >
                    Viendo
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm" 
                    className={`h-6 text-xs px-2 ${anime.status === 'PLAN_TO_WATCH' ? '!bg-gray-600 !text-white hover:!bg-gray-700' : ''}`}
                    onClick={() => handleStatusChange(anime, 'PLAN_TO_WATCH')}
                  >
                    <Calendar className="w-3 h-3" />
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm" 
                    className={`h-6 text-xs px-2 ${anime.status === 'COMPLETED' ? '!bg-green-600 !text-white hover:!bg-green-700' : ''}`}
                    onClick={() => handleStatusChange(anime, 'COMPLETED')}
                  >
                    ✓
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm" 
                    className={`h-6 text-xs px-2 ${anime.status === 'DROPPED' ? '!bg-red-600 !text-white hover:!bg-red-700' : ''}`}
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
