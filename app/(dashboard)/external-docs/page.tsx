import DocsHero from "@/components/docs/DocsHero";
import WhySynapse from "@/components/docs/WhySynapse";
import IntegrationSection from "@/components/docs/IntegrationSection";
import ArchitectureSection from "@/components/docs/ArchitectureSection";
import RoadmapSection from "@/components/docs/RoadmapSection";
import DocsFooter from "@/components/docs/DocsFooter";

export default function ExternalDocsPage() {
  return (
    <div className="h-full overflow-y-auto bg-[linear-gradient(rgba(255,255,255,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.03)_1px,transparent_1px)] bg-[size:64px_64px]">
      <div className="max-w-5xl mx-auto py-16 px-6">
        <DocsHero />
        <WhySynapse />
        <IntegrationSection />
        <ArchitectureSection />
        <RoadmapSection />
        <DocsFooter />
      </div>
    </div>
  );
}
