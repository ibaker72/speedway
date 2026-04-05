import { PageHero } from "@/components/shared/PageHero";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { BUSINESS } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for Speedway Motors LLC website visitors and customers.",
  alternates: {
    canonical: "https://www.speedwaymotorsllc.com/privacy-policy",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Privacy Policy"
        subtitle="How Speedway Motors LLC collects, uses, and protects your information."
      />
      <SectionWrapper background="charcoal">
        <div className="max-w-3xl mx-auto text-zinc-300 leading-relaxed">
          <div className="space-y-10">
            <section>
              <h2 className="text-xl font-bold text-white mb-3">Information We Collect</h2>
              <p className="mb-3">We may collect personal information that you voluntarily provide when you:</p>
              <ul className="list-disc pl-6 space-y-1.5 text-zinc-400">
                <li>Fill out contact, financing, or trade-in forms on our website</li>
                <li>Call or email our dealership</li>
                <li>Subscribe to our inventory alerts or newsletter</li>
                <li>Visit our dealership in person</li>
              </ul>
              <p className="mt-3 text-zinc-400">This information may include your name, email address, phone number, mailing address, and details about vehicle preferences or financial information provided in financing applications.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">How We Use Your Information</h2>
              <ul className="list-disc pl-6 space-y-1.5 text-zinc-400">
                <li>Respond to your inquiries and requests</li>
                <li>Process financing pre-approval applications</li>
                <li>Provide trade-in valuations and vehicle purchase information</li>
                <li>Send inventory alerts and promotional communications (with your consent)</li>
                <li>Improve our website, services, and customer experience</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">Information Sharing</h2>
              <p className="text-zinc-400">We do not sell, trade, or rent your personal information to third parties. We may share information with trusted service providers who assist in operating our website, conducting business, or servicing you, provided they agree to keep this information confidential. We may also release information when required by law or to protect our rights, property, or safety.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">Cookies &amp; Tracking</h2>
              <p className="text-zinc-400">Our website may use cookies, web beacons, and similar tracking technologies to enhance your browsing experience, analyze site traffic, and understand usage patterns. You can choose to disable cookies through your browser settings, though this may affect certain website features. We use analytics tools such as Google Analytics to understand how visitors interact with our site.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">Data Security</h2>
              <p className="text-zinc-400">We implement reasonable security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of electronic transmission or storage is 100% secure, and we cannot guarantee absolute security.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">Your Rights</h2>
              <p className="text-zinc-400">You have the right to request access to, correction of, or deletion of your personal information. You may also opt out of receiving promotional communications at any time by following the unsubscribe instructions in any email we send or by contacting us directly.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">Contact Information</h2>
              <p className="text-zinc-400">
                If you have questions about this privacy policy or wish to exercise your rights regarding your personal data, please contact us at{" "}
                <a href={`mailto:${BUSINESS.email}`} className="text-accent-light hover:text-white transition-colors">{BUSINESS.email}</a>{" "}
                or call us at{" "}
                <a href={BUSINESS.phoneHref} className="text-accent-light hover:text-white transition-colors">{BUSINESS.phone}</a>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">Updates to This Policy</h2>
              <p className="text-zinc-400">We may update this privacy policy from time to time. Changes will be posted on this page with an updated effective date. We encourage you to review this policy periodically to stay informed about how we are protecting your information.</p>
            </section>
          </div>
        </div>
      </SectionWrapper>
    </>
  );
}
