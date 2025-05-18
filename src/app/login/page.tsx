
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSession } from '@/context/session-context';
import { useRouter } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import LogoIcon from '@/components/icons/logo-icon';

const loginSchema = z.object({
  email: z.string().email({ message: 'Por favor, introduce un correo válido.' }),
  password: z.string().min(1, { message: 'La contraseña es obligatoria.' }),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login, isAuthenticated, isLoading: isSessionLoading } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (!isSessionLoading && isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router, isSessionLoading]);

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    setIsSubmitting(true);
    const success = await login(data.email, data.password);
    if (success) {
      toast({
        title: 'Inicio de Sesión Exitoso',
        description: 'Redirigiendo...',
      });
      router.push('/');
    } else {
      toast({
        title: 'Error de Inicio de Sesión',
        description: 'Correo o contraseña incorrectos.',
        variant: 'destructive',
      });
    }
    setIsSubmitting(false);
  };
  
  if (isSessionLoading || (!isSessionLoading && isAuthenticated)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm shadow-xl">
        <CardHeader className="items-center text-center">
          <LogoIcon className="h-12 w-12 text-primary mb-2" />
          <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
          <CardDescription>Accede a la gestión de clientes.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@correo.com"
                {...register('email')}
                aria-invalid={errors.email ? "true" : "false"}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register('password')}
                aria-invalid={errors.password ? "true" : "false"}
              />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Ingresar
            </Button>
          </form>
        </CardContent>
         <CardFooter className="text-center text-xs text-muted-foreground">
          <p>Usa tus credenciales proporcionadas.</p>
        </CardFooter>
      </Card>
    </div>
  );
}
