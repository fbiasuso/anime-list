import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth.store';
import { animeService } from '@/services/anime';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

export default function ProfilePage() {
  const { user, isAuthenticated, login, register, logout, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const { toast } = useToast();

  const { data: userAnimes } = useQuery({
    queryKey: ['userAnimes'],
    queryFn: () => animeService.getUserAnimes(),
    enabled: isAuthenticated,
  });

  // Calculate counts
  const counts = useMemo(() => {
    const animes = userAnimes?.animes || [];
    return {
      watching: animes.filter((a) => a.status === 'WATCHING').length,
      completed: animes.filter((a) => a.status === 'COMPLETED').length,
      dropped: animes.filter((a) => a.status === 'DROPPED').length,
      planToWatch: animes.filter((a) => a.status === 'PLAN_TO_WATCH').length,
    };
  }, [userAnimes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isRegisterMode) {
        await register(username, email, password);
        toast({ title: 'Registro exitoso', description: 'Bienvenido a Anime List!' });
      } else {
        await login(email, password);
        toast({ title: 'Login exitoso', description: `Bienvenido de vuelta, ${user?.username}!` });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Credenciales inválidas',
        variant: 'destructive',
      });
    }
  };

  if (isAuthenticated && user) {
    return (
      <div className="pb-20 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Perfil</h2>
          <Button variant="outline" onClick={logout}>
            Cerrar Sesión
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{user.username}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Miembro desde: {new Date().toLocaleDateString()}
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-600">Viendo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{counts.watching}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600">Completados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{counts.completed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-600">Abandonados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{counts.dropped}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Planeados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{counts.planToWatch}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20 flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isRegisterMode ? 'Crear Cuenta' : 'Iniciar Sesión'}</CardTitle>
          <CardDescription>
            {isRegisterMode
              ? 'Crea una cuenta para guardar tu progreso'
              : 'Ingresa a tu cuenta para continuar'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegisterMode && (
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium">
                  Nombre de usuario
                </label>
                <Input
                  id="username"
                  type="text"
                  placeholder="tu_usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Contraseña
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Cargando...' : isRegisterMode ? 'Registrarse' : 'Iniciar Sesión'}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            {isRegisterMode ? (
              <>
                ¿Ya tienes cuenta?{' '}
                <button
                  onClick={() => setIsRegisterMode(false)}
                  className="text-primary hover:underline"
                >
                  Iniciar Sesión
                </button>
              </>
            ) : (
              <>
                ¿No tienes cuenta?{' '}
                <button
                  onClick={() => setIsRegisterMode(true)}
                  className="text-primary hover:underline"
                >
                  Registrarse
                </button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
