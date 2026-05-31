import Badge from "../../../components/ui/Badge";

export default function DashboardShell({
  badge,
  title,
  description,
  actions,
  children,
}) {
  return (
    <section className="mx-auto w-full max-w-[96rem] px-4 pb-10 pt-7 sm:px-6 sm:pb-12 sm:pt-9 lg:px-8 xl:px-10">
      <div className="mb-7 flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
        <div>
          {badge && <Badge variant="green">{badge}</Badge>}

          <h1 className="font-heading mt-4 max-w-4xl text-3xl font-extrabold leading-[1.08] tracking-[-0.045em] text-[#102A43] sm:text-4xl lg:text-[2.75rem]">
            {title}
          </h1>

          {description && (
            <p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-[#64748B] sm:text-base">
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex shrink-0 flex-wrap gap-3 xl:justify-end">
            {actions}
          </div>
        )}
      </div>

      <div className="space-y-5 sm:space-y-6">{children}</div>
    </section>
  );
}
