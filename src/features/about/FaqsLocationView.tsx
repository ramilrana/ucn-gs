import { PendingNotice } from '../../components/content/PendingNotice';
import { Prose } from '../../components/content/Prose';
import { PageShell } from '../../components/layout/PageShell';
import { MapEmbed } from '../../components/media/MapEmbed';
import { Disclosure } from '../../components/ui/Disclosure';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { showPending, slotValue, visible } from '../../lib/published';
import type { Faq, SiteContent } from '../../types/content';

const TITLE = 'FAQs and Location';

interface FaqsLocationViewProps {
  faqs: readonly Faq[];
  site: SiteContent;
}

/** Frequently asked questions as native disclosures, then the campus address and map. */
export function FaqsLocationView({ faqs, site }: FaqsLocationViewProps) {
  const shownFaqs = visible(faqs);
  const address = slotValue(site.contact)?.address.trim() || undefined;
  const hasMap = Boolean(slotValue(site.mapQuery)?.trim());

  const showFaqs = shownFaqs.length > 0 || showPending();
  const showLocation = address !== undefined || hasMap || showPending();

  return (
    <PageShell title={TITLE} hasContent={showFaqs || showLocation}>
      <div className="space-y-16">
        {showFaqs && (
          <section aria-labelledby="faqs-title" className="space-y-6">
            <SectionHeading level={2} id="faqs-title">
              Frequently Asked Questions
            </SectionHeading>
            {shownFaqs.length > 0 ? (
              <div className="max-w-3xl border-t border-line">
                {shownFaqs.map((item) => (
                  <Disclosure key={item.id} summary={item.question}>
                    <Prose paragraphs={item.answer} />
                  </Disclosure>
                ))}
              </div>
            ) : (
              <PendingNotice label="Frequently asked questions" />
            )}
          </section>
        )}
        {showLocation && (
          <section aria-labelledby="location-title" className="space-y-6">
            <SectionHeading level={2} id="location-title">
              Location
            </SectionHeading>
            {address ? <p className="max-w-[70ch] leading-relaxed text-ink">{address}</p> : <PendingNotice label={site.contact.label} />}
            <MapEmbed query={site.mapQuery} address={address} />
          </section>
        )}
      </div>
    </PageShell>
  );
}
