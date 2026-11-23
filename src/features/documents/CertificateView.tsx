import { PendingNotice } from '../../components/content/PendingNotice';
import { PageShell } from '../../components/layout/PageShell';
import { DocumentViewer } from '../../components/media/DocumentViewer';
import { ActionLink } from '../../components/ui/ActionLink';
import { isSlotVisible, isVisible, showPending, slotValue } from '../../lib/published';
import type { CertificateContent } from '../../types/content';

interface CertificateViewProps {
  certificate: CertificateContent;
}

const TITLE = 'Certificate of Authenticity';

/** The certificate as an image (when supplied) above the embedded PDF. */
export function CertificateView({ certificate }: CertificateViewProps) {
  const image = slotValue(certificate.image);
  const showImagePending = image === undefined && isSlotVisible(certificate.image);
  const showPdf = isVisible(certificate.pdf) && (certificate.pdf.source !== undefined || showPending());

  return (
    <PageShell title={TITLE} hasContent={image !== undefined || showImagePending || showPdf}>
      <div className="space-y-10">
        {image && (
          <figure className="space-y-4">
            {/* A maroon frame with a thin gold line inside (the user's pick of four previewed borders, 2026-11-23). */}
            <div className="mx-auto w-fit max-w-full border-[10px] border-maroon-800 bg-white p-1 shadow-md">
              <div className="border-2 border-gold-500 p-2 sm:p-3">
                <img
                  src={image.src}
                  srcSet={image.srcSet}
                  width={image.width}
                  height={image.height}
                  alt={image.alt}
                  className="mx-auto block h-auto max-h-[80vh] w-auto max-w-full object-contain"
                />
              </div>
            </div>
            <figcaption className="text-center">
              <ActionLink href={image.src} newTab>
                Open full-size image
              </ActionLink>
            </figcaption>
          </figure>
        )}
        {showImagePending && <PendingNotice label={certificate.image.label} />}
        {showPdf && <DocumentViewer resource={certificate.pdf} mode="embedded" />}
      </div>
    </PageShell>
  );
}
