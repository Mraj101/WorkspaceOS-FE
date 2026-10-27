import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { applyServerErrors } from '@/shared/lib/forms';
import { Alert, Button, TextField } from '@/shared/ui';
import { useLoginMutation } from '../api/authApi';
import { loginSchema, type LoginInput } from '../types/auth';

interface LoginFormProps {
  onSuccess: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [login] = useLoginMutation();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await login(values).unwrap();
      onSuccess();
    } catch (error) {
      applyServerErrors(error, setError, ['email', 'password']);
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      {errors.root?.server && <Alert>{errors.root.server.message}</Alert>}
      <TextField
        label="Email"
        type="email"
        autoComplete="email"
        required
        error={errors.email?.message}
        {...register('email')}
      />
      <TextField
        label="Password"
        type="password"
        autoComplete="current-password"
        required
        error={errors.password?.message}
        {...register('password')}
      />
      {/* isSubmitting disables the button for the whole request, preventing double submits. */}
      <Button type="submit" isLoading={isSubmitting}>
        Sign in
      </Button>
    </form>
  );
}
