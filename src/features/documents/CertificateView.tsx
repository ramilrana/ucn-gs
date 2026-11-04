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
          <figure className="space-y-3">
            <img
              src={image.src}
              srcSet={image.srcSet}
              width={image.width}
              height={image.height}
              alt={image.alt}
              className="mx-auto h-auto max-h-[80vh] w-auto max-w-full object-contain"
            />
            <figcaption>
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
