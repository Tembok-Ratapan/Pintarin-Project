import Badge from "../../../components/ui/Badge";

export default function DashboardShell({
  badge,
  title,
  description,
  actions,
  children,
}) {
  return (
    <section className="mx-auto w-full max-w-[96rem] px-5 pb-10 pt-6 sm:px-8 sm:pb-12 sm:pt-8 lg:px-10 xl:px-12 2xl:px-14">
      <div className="mb-6 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          {badge && <Badge variant="green">{badge}</Badge>}

          <h1 className="font-heading mt-3 max-w-4xl text-2xl font-bold leading-tight text-[#102A43] sm:text-3xl lg:text-[2.1rem]">
            {title}
          </h1>

          {description && (
            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-[#64748B]">
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
