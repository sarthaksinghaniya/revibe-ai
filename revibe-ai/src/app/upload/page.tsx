import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { UploadBox } from "@/components/upload/UploadBox";

export default function UploadPage() {
  return (
    <PageShell>
      <PageHeader
        title="Upload e-waste"
        description="Add a photo to get reuse ideas and project guidance. This is a mock UI step—analysis is static for now."
      />
      <div className="mt-8">
        <UploadBox />
      </div>
    </PageShell>
  );
}
