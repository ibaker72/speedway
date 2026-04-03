import { Button } from "@/components/ui/button";
import { SectionWrapper } from "@/components/shared/SectionWrapper";

export function LocationCtaStrip() {
  return (
    <SectionWrapper background="dark">
      <div className="max-w-5xl mx-auto rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
        <h2 className="text-2xl font-bold text-white text-center">Ready for your next vehicle?</h2>
        <p className="text-zinc-400 text-center mt-2">Browse inventory, apply for financing, value your trade-in, or schedule a test drive in minutes.</p>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Button href="/inventory" variant="primary" className="justify-center">Browse Inventory</Button>
          <Button href="/finance" variant="outline" className="justify-center">Apply for Financing</Button>
          <Button href="/trade" variant="outline" className="justify-center">Value Your Trade</Button>
          <Button href="/contact" variant="outline" className="justify-center">Book a Test Drive</Button>
        </div>
      </div>
    </SectionWrapper>
  );
}
