import AuthForm from '@/components/auth/AuthForm';

export default function AuthPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
      <AuthForm />
    </div>
  );
}
