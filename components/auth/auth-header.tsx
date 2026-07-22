import { AuthLogo } from "./auth-logo";

type AuthHeaderProps = {
  description: string;
  eyebrow: string;
  title: string;
};

export function AuthHeader({
  description,
  eyebrow,
  title,
}: AuthHeaderProps) {
  return (
    <>
      <AuthLogo className="mb-10 xl:hidden" />
      <header className="mb-8 space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">
          {eyebrow}
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h1>
        <p className="max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
          {description}
        </p>
      </header>
    </>
  );
}
