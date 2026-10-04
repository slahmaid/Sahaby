import Link from 'next/link'
import { BookOpenText, Ruler, Truck, ArrowLeft } from 'lucide-react'

export function ParallaxScrollFeatureSection({
  deliveryDetails,
}: {
  deliveryDetails: string;
}) {
  const features = [
    {
      icon: BookOpenText,
      number: '01',
      title: 'قراءة أوضح',
      description: 'خط واضح ومريح لتمنح قراءتك اليومية مساحة أهدأ.',
      tone: 'bg-[#06254a]/[0.05] text-[#06254a]',
    },
    {
      icon: Ruler,
      number: '02',
      title: 'مقاسان للاختيار',
      description: 'متوسط للحمل والتنقل، وكبير لجلسة القراءة في البيت.',
      tone: 'bg-[#a71c32]/[0.07] text-[#a71c32]',
    },
    {
      icon: Truck,
      number: '03',
      title: 'توصيل واضح',
      description: deliveryDetails,
      tone: 'bg-emerald-50 text-emerald-800',
    },
  ]

  return (
    <section id="about" className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold text-[#a71c32]">تجربة صحابي</p>
          <h2 className="mt-2 font-serif text-3xl font-bold text-[#06254a] sm:text-4xl">
            كل ما تحتاجه لتبدأ القراءة
          </h2>
          <p className="mt-3 text-sm leading-7 text-[#06254a]/65 sm:text-base">
            اختر المقاس، راجع التفاصيل، ثم أرسل طلبك بخطوات بسيطة.
          </p>
        </div>

        <div className="mt-9 grid gap-4 md:grid-cols-3">
          {features.map(({ icon: Icon, number, title, description, tone }) => (
            <article
              className="group relative overflow-hidden rounded-2xl border border-[#06254a]/[0.08] bg-white p-5 shadow-[0_8px_24px_rgba(6,37,74,0.04)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(6,37,74,0.09)] sm:p-6"
              key={number}
            >
              <div className="flex items-start justify-between">
                <span className={`flex size-12 items-center justify-center rounded-2xl ${tone}`}>
                  <Icon aria-hidden="true" className="size-6" />
                </span>
                <span className="font-mono text-xs font-bold tracking-widest text-[#06254a]/25">
                  {number}
                </span>
              </div>
              <h3 className="mt-5 text-lg font-black text-[#06254a]">{title}</h3>
              <p className="mt-2 min-h-14 text-sm leading-7 text-[#06254a]/65">
                {description}
              </p>
              {number === '02' ? (
                <Link
                  className="mt-4 inline-flex min-h-10 items-center gap-2 text-sm font-bold text-[#a71c32]"
                  href="#order"
                >
                  اختر مقاسك
                  <ArrowLeft aria-hidden="true" className="size-4" />
                </Link>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
