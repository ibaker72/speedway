import { PageHero } from "@/components/shared/PageHero";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { BUSINESS } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of service for Speedway Motors LLC website usage.",
  alternates: {
    canonical: "https://www.speedwaymotorsllc.com/terms-of-service",
  },
};

export default function TermsOfServicePage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Terms of Service"
        subtitle="Terms governing use of the Speedway Motors LLC website and online services."
      />
      <SectionWrapper background="charcoal">
        <div className="max-w-3xl mx-auto text-zinc-300 leading-relaxed">
          <div className="space-y-10">
            <section>
              <h2 className="text-xl font-bold text-white mb-3">Acceptance of Terms</h2>
              <p className="text-zinc-400">By accessing and using the {BUSINESS.name} website, you accept and agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree with any part of these terms, please do not use our website.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">Use of Website</h2>
              <p className="text-zinc-400">This website is provided for informational purposes to help you explore our vehicle inventory, financing options, and dealership services. Content on this site may change without notice. You agree to use this website only for lawful purposes and in a way that does not infringe upon the rights of others.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">Vehicle Information &amp; Pricing</h2>
              <p className="text-zinc-400">While we strive to ensure accuracy, vehicle pricing, availability, specifications, and photos displayed on this website are subject to verification at the dealership. Prices may exclude taxes, title, registration fees, and dealer documentation fees unless otherwise stated. We are not responsible for typographical errors or inaccuracies in vehicle listings.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">Financing Disclaimers</h2>
              <p className="text-zinc-400">Estimated monthly payments, interest rates, and financing terms displayed on our website (including the payment calculator) are for informational purposes only and do not constitute a financing offer. Actual financing terms are subject to credit approval and may vary based on your credit profile, down payment, and lender terms.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">Form Submissions</h2>
              <p className="text-zinc-400">By submitting forms on this website, you confirm that the information you provide is accurate and that you are authorized to submit it. Form submissions (including contact requests, financing applications, and trade-in valuations) do not create a binding contract and are subject to review and verification by our team.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">Intellectual Property</h2>
              <p className="text-zinc-400">All content on this website, including text, graphics, logos, images, and software, is the property of {BUSINESS.name} or its content suppliers and is protected by copyright and other intellectual property laws. You may not reproduce, distribute, or create derivative works from any content without our express written permission.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">Limitation of Liability</h2>
              <p className="text-zinc-400">{BUSINESS.name} shall not be liable for any direct, indirect, incidental, consequential, or punitive damages arising from your use of or inability to use this website. We make no warranties, expressed or implied, regarding the accuracy, reliability, or availability of the website or its content.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">Third-Party Links</h2>
              <p className="text-zinc-400">Our website may contain links to third-party websites (including Carfax, CarGurus, and financing partners). These links are provided for your convenience, and we do not endorse or assume responsibility for the content or practices of any third-party sites.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">Governing Law</h2>
              <p className="text-zinc-400">These terms are governed by and construed in accordance with the laws of the State of New Jersey and applicable federal regulations. Any disputes arising from these terms or your use of our website shall be resolved in the courts located in Passaic County, New Jersey.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">Changes to Terms</h2>
              <p className="text-zinc-400">We reserve the right to modify these Terms of Service at any time. Changes will be posted on this page and take effect immediately. Your continued use of the website after changes constitutes acceptance of the revised terms.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">Contact</h2>
              <p className="text-zinc-400">
                If you have questions about these terms, please contact us at{" "}
                <a href={`mailto:${BUSINESS.email}`} className="text-accent-light hover:text-white transition-colors">{BUSINESS.email}</a>{" "}
                or call{" "}
                <a href={BUSINESS.phoneHref} className="text-accent-light hover:text-white transition-colors">{BUSINESS.phone}</a>.
              </p>
            </section>
          </div>
        </div>
      </SectionWrapper>
    </>
  );
}
