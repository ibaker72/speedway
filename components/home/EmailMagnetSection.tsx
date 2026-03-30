export function EmailMagnetSection() {
  return (
    <section className="bg-[#0A0A0A] px-5 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[80rem]">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-black uppercase tracking-[-0.02em] text-white sm:text-4xl">
            Get First Pick on Fresh Inventory.
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-zinc-300 sm:text-base">
            Sign up for our VIP list to get instant updates on new arrivals and exclusive price drops before they hit the lot.
          </p>

          <form className="mx-auto mt-8 flex w-full max-w-2xl flex-col sm:flex-row" action="#" method="post">
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              name="email"
              type="email"
              required
              placeholder="Enter your email"
              className="h-12 w-full rounded-md border border-white bg-[#1A1A1A] px-4 text-sm text-white placeholder:text-zinc-500 focus:border-[#D31119] focus:outline-none sm:rounded-r-none"
            />
            <button
              type="submit"
              className="h-12 rounded-md bg-[#D31119] px-7 text-sm font-bold tracking-[0.08em] text-white transition-colors hover:bg-[#ea1d25] sm:rounded-l-none"
            >
              SUBSCRIBE
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
