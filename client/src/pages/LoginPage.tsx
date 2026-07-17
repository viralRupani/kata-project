import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { loginSchema, type LoginValues } from '../lib/schemas.js';
import { useAuth } from '../context/AuthContext.js';
import { errorMessage } from '../lib/format.js';
import { AuthLayout, fieldClass } from './AuthLayout.js';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const submit = handleSubmit(async (values) => {
    try {
      await login(values.email, values.password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(errorMessage(err, 'Login failed'));
    }
  });

  return (
    <AuthLayout title="Sign in to AutoHub" subtitle="Browse and purchase from the inventory">
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
            Email
          </label>
          <input id="email" type="email" className={fieldClass} {...register('email')} />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
            Password
          </label>
          <input id="password" type="password" className={fieldClass} {...register('password')} />
          {errors.password && (
            <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-brand-600 px-4 py-2.5 font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        No account?{' '}
        <Link to="/register" className="font-semibold text-brand-600 hover:underline">
          Create one
        </Link>
      </p>
    </AuthLayout>
  );
}
