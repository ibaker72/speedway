import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const cardBase =
  "group relative block overflow-hidden rounded-[2px] min-h-[280px] md:min-h-[350px]";

export function TradeSellCards() {
  return (
    <section className="bg-[#0a0a0a]">
      <div className="mx-auto max-w-[80rem] px-5 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/trade" className={cardBase}>
            <Image
              src="https://placehold.co/1920x1080"
              alt="Trading in vehicle"
              fill
              unoptimized
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/55 group-hover:bg-black/45 transition-colors" />
            <div className="absolute top-0 left-0 right-0 h-px bg-[#cc0000]" />
            <div className="relative z-10 h-full flex flex-col justify-end p-8 md:p-10">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-300">Trading In?</p>
              <h3 className="mt-3 text-3xl md:text-4xl font-bold leading-tight">Upgrade Your Drive</h3>
              <p className="mt-4 text-zinc-300 max-w-md">Get a competitive offer and apply it instantly toward your next vehicle.</p>
              <span className="mt-7 inline-flex w-fit items-center gap-2 border border-[#cc0000] bg-[#cc0000] px-6 py-3 text-sm uppercase tracking-[0.08em] font-bold rounded-[2px]">
                Value My Trade <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </Link>

          <Link href="/finance" className={cardBase}>
            <Image
              src="https://placehold.co/1920x1080"
              alt="Save an hour"
              fill
              unoptimized
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/55 group-hover:bg-black/45 transition-colors" />
            <div className="absolute top-0 left-0 right-0 h-px bg-[#cc0000]" />
            <div className="relative z-10 h-full flex flex-col justify-end p-8 md:p-10">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-300">Save an Hour</p>
              <h3 className="mt-3 text-3xl md:text-4xl font-bold leading-tight">Start Financing Online</h3>
              <p className="mt-4 text-zinc-300 max-w-md">Complete your secure pre-approval before visiting and speed up delivery.</p>
              <span className="mt-7 inline-flex w-fit items-center gap-2 border border-white/60 px-6 py-3 text-sm uppercase tracking-[0.08em] font-bold rounded-[2px]">
                Get Approved <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
