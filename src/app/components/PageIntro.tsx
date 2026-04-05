type PageIntroProps = {
  eyebrow: string;
  title: string;
  description: string;
  aside?: React.ReactNode;
};

export default function PageIntro({ eyebrow, title, description, aside }: PageIntroProps) {
  return (
    <section className="rounded-[32px] border border-black/10 bg-white/85 p-6 shadow-[0_28px_80px_-45px_rgba(15,23,42,0.35)]">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
        <div>
          <h1 className="mt-3 font-heading text-4xl font-semibold leading-tight text-slate-950">
            {title}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">{description}</p>
        </div>

        {aside ? (
          <div className="rounded-[28px] bg-slate-950 p-5 text-sm leading-6 text-slate-200">
            {aside}
          </div>
        ) : null}
      </div>
    </section>
  );
}
