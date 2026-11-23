import CourseCatalog from "../components/course-catalog";
import { getCategories, getCourses, getPlans } from "../lib/api";

const button =
  "inline-flex min-h-14 items-center justify-center rounded-full px-9 text-sm font-bold transition hover:opacity-85";

export const instant = false;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const [categories, courses, plans] = await Promise.all([
    getCategories().catch(() => []),
    getCourses().catch(() => []),
    getPlans().catch(() => []),
  ]);
  return (
    <>
      <main>
        <section className="bg-gradient-to-b from-[#e9fff0] to-white px-4 pb-20 pt-14 text-center sm:px-5 sm:pb-24 sm:pt-20 md:pb-32 md:pt-28">
          <div className="mx-auto max-w-3xl">
            <p className="mb-5 font-semibold text-[#00ae79]">
              مستقبلك يبدأ بمهارة
            </p>
            <h1 className="text-3xl font-bold leading-[1.5] sm:text-4xl md:text-6xl md:leading-[1.5]">
              تعلم صنعة اليوم،
              <br />
              <span className="text-[#06c78a]">وافتح أبواب بكرة</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-[#777d8b] md:text-lg">
              تعلّم المهارات المهنية بخطوات عملية، من خبراء يعرفون تفاصيل المهنة.
              دورات وجلسات مباشرة تجمعها منصة واحدة.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <a
                href="#courses"
                className={`${button} bg-[#06cc8f] text-white`}
              >
                استكشف الدورات
              </a>
              <a href="#about" className={`${button} bg-[#21213f] text-white`}>
                اكتشف كفاءات
              </a>
            </div>
          </div>
        </section>
        <section
          id="about"
          aria-label="مميزات الأكاديمية"
          className="mx-auto grid max-w-6xl grid-cols-2 gap-x-4 gap-y-8 px-4 pb-20 text-center sm:gap-8 sm:px-5 md:grid-cols-4 md:pb-24"
        >
          {[
            ["تعلّم عملي", "خطوات واضحة وتطبيقية"],
            ["خبراء المهنة", "تعلم من أهل الخبرة"],
            ["في أي وقت", "شاهد بالوقت المناسب لك"],
            ["اشتراك واحد", "وصول إلى محتوى المنصة"],
          ].map(([title, desc]) => (
            <div
              key={title}
              className="md:border-l md:border-gray-200 md:last:border-0"
            >
              <div className="text-xl font-bold md:text-2xl">{title}</div>
              <p className="mt-2 text-sm text-[#9295a3]">{desc}</p>
            </div>
          ))}
        </section>
        <CourseCatalog
          query={query}
          categories={categories}
          courses={courses}
        />
        <section id="plans" className="mx-auto max-w-5xl px-5 pb-24 pt-6">
          <div className="mb-10 text-center">
            <p className="text-sm font-bold text-[#06ad7a]">باقات الاشتراك</p>
            <h2 className="mt-3 text-3xl font-bold text-[#21213f]">
              اختر الباقة المناسبة لك
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#838894]">
              وصول مرن إلى محتوى المنصة بسعر شهري واضح.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {plans.map((plan) => (
              <article
                key={plan.id}
                className={`rounded-[24px] border bg-white p-7 ${plan.slug === "premium" ? "border-[#06cc8f] shadow-[0_18px_55px_rgba(6,204,143,0.12)]" : "border-[#e2e9e4]"}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    {plan.slug === "premium" && (
                      <span className="mb-3 inline-flex rounded-full bg-[#e7faf1] px-3 py-1 text-xs font-bold text-[#00a875]">
                        الأكثر شمولًا
                      </span>
                    )}
                    <h3 className="text-2xl font-bold">{plan.name}</h3>
                    <p className="mt-3 text-sm leading-7 text-[#7b8581]">
                      {plan.description}
                    </p>
                  </div>
                  <div className="shrink-0 text-left">
                    <p className="text-3xl font-bold text-[#06ad7a]">
                      {Number(plan.price).toLocaleString("ar-KW")}
                    </p>
                    <p className="mt-1 text-xs text-[#9295a3]">
                      دينار كويتي / شهريًا
                    </p>
                  </div>
                </div>
                <p className="mt-5 rounded-xl bg-[#f7faf8] px-4 py-3 text-sm font-semibold">
                  يتجدد الاشتراك شهريًا
                </p>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature.id} className="flex gap-3 text-sm">
                      <span className="font-bold text-[#06ad7a]">✓</span>
                      {feature.label}
                    </li>
                  ))}
                </ul>
                <a
                  href={`/subscribe?plan=${encodeURIComponent(plan.slug)}`}
                  className={`mt-7 flex min-h-13 items-center justify-center rounded-full text-sm font-bold ${plan.slug === "premium" ? "bg-[#06cc8f] text-white" : "bg-[#21213f] text-white"}`}
                >
                  اختر هذه الباقة
                </a>
              </article>
            ))}
          </div>
        </section>
        <section
          className="mx-auto max-w-6xl px-5 pb-20"
          aria-labelledby="start-heading"
        >
          <div className="rounded-[20px] bg-[#21213f] px-6 py-10 text-center text-white sm:py-12">
            <h2 id="start-heading" className="text-2xl font-bold">
              جاهز تبدأ رحلتك؟ سجّل دلوقتي
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/80">
              كل اللي تحتاجه لتطوير مهاراتك المهنية في مكان واحد.
            </p>
            <a
              href="/register"
              className="mt-5 inline-flex min-h-14 items-center justify-center rounded-xl bg-[#06cc8f] px-8 text-sm font-bold text-white transition hover:bg-[#00b980]"
            >
              إنشاء حساب مجاني
            </a>
          </div>
        </section>
      </main>
    </>
  );
}
