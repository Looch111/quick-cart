import { SignupForm } from '@/components/auth/signup-form';
import { AppLogo } from '@/components/icons/logo';
import Image from 'next/image';

export default function SignupPage() {
  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
       <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6 animate-in fade-in-up-4 duration-500">
          <div className="grid gap-2 text-center">
             <div className="mx-auto mb-4">
               <AppLogo className="h-12 w-12" />
            </div>
            <h1 className="text-3xl font-bold font-headline">Sign Up</h1>
            <p className="text-balance text-muted-foreground">
              Create an account to start your crypto journey.
            </p>
          </div>
          <SignupForm />
        </div>
      </div>
       <div className="hidden bg-muted lg:block">
        <Image
          src="https://placehold.co/1920x1080.png"
          alt="Image"
          width="1920"
          height="1080"
          data-ai-hint="crypto trading abstract"
          className="h-full w-full object-cover dark:brightness-[0.3]"
        />
      </div>
    </div>
  );
}
