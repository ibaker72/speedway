import Link from "next/link";

export function ConfidenceBanner() {
  return (
    <div className="bg-red-700 text-white py-2.5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center text-sm">
        <span className="font-bold">Buy with Confidence!</span>{" "}
        <span className="font-normal">
          Quality inspected vehicles + Flexible financing for all credit levels!
        </span>{" "}
        <Link
          href="/finance"
          className="underline underline-offset-2 font-medium hover:text-red-100 transition-colors"
        >
          Learn More
        </Link>
      </div>
    </div>
  );
}
