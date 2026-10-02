import {
  DEFAULT_STORE_SETTINGS,
  parseReviewContent,
} from "@/lib/storefront-types";

function Stars() {
  return (
    <div className="mt-4 flex gap-1 text-[#e2a100]" aria-label="خمس نجوم">
      {Array.from({ length: 5 }, (_, index) => (
        <svg
          key={index}
          viewBox="0 0 20 20"
          className="size-4 fill-current"
          aria-hidden="true"
        >
          <path d="M10 1.5l2.4 4.9 5.4.8-3.9 3.8.9 5.4L10 14l-4.8 2.4.9-5.4L2.2 7.2l5.4-.8L10 1.5z" />
        </svg>
      ))}
    </div>
  )
}

export function ReviewsSection({
  items = parseReviewContent(DEFAULT_STORE_SETTINGS.reviewContent),
}: {
  items?: { name: string; role: string; quote: string }[];
}) {
  return (
    <section id="reviews" className="px-6 py-20 sm:py-28">
      <div className="mx-auto flex max-w-6xl flex-col items-center text-center">
        <h2 className="font-serif text-4xl text-[#06254a] sm:text-5xl">
          ماذا يقول القرّاء
        </h2>
        <p className="mt-4 max-w-xl text-base text-[#06254a]/70">
          تجارب من طلبوا المصحف ووجدوا فيه قراءة أهدأ.
        </p>

        <div className="mt-12 grid w-full gap-5 text-start md:grid-cols-3">
          {items.map((review) => (
            <article
              key={review.name}
              className="flex flex-col rounded-2xl border border-[#06254a]/10 bg-white p-6"
            >
              <svg
                viewBox="0 0 24 24"
                className="size-10 fill-[#06254a]"
                aria-hidden="true"
              >
                <path d="M9.5 6.5c-2.8 1.2-4.5 3.4-4.5 6.2 0 1.6.8 2.8 2.2 2.8 1.2 0 2.1-.9 2.1-2.1 0-1.1-.8-1.9-1.9-2.1.2-1.4 1.2-2.6 2.8-3.4L9.5 6.5zm8 0c-2.8 1.2-4.5 3.4-4.5 6.2 0 1.6.8 2.8 2.2 2.8 1.2 0 2.1-.9 2.1-2.1 0-1.1-.8-1.9-1.9-2.1.2-1.4 1.2-2.6 2.8-3.4l-.7-1.4z" />
              </svg>
              <Stars />
              <p className="mt-4 flex-1 text-sm leading-relaxed text-[#06254a]/75">
                {review.quote}
              </p>
              <div className="mt-6 flex items-center gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#06254a] text-sm font-bold text-white">
                  {review.name.slice(0, 1)}
                </span>
                <span>
                  <span className="block font-bold text-[#06254a]">
                    {review.name}
                  </span>
                  <span className="block text-sm text-[#06254a]/55">
                    {review.role}
                  </span>
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
