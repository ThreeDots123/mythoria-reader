import Hero from "./hero";
import ContinueReading from "./continue-reading";
import Featured from "./featured";
import CommunityStats from "./community-stats";
import NewSeries from "./new-series";
import RisingStars from "./rising-stars";
import LatestNovels from "./latest";
import UpcomingReleases from "./upcoming-releases";
import MostPopular from "./most-popular";
import LazySection from "@/components/utility/lazy-section";

export default function HomeComponent() {
  return (
    <>
      <Hero />
      <ContinueReading />
      <Featured />
      <LazySection minHeight={120}>
        <CommunityStats />
      </LazySection>
      <LazySection minHeight={380}>
        <NewSeries />
      </LazySection>
      <LazySection minHeight={380}>
        <RisingStars />
      </LazySection>
      <LazySection minHeight={380}>
        <MostPopular />
      </LazySection>
      <LazySection minHeight={400}>
        <LatestNovels />
      </LazySection>
      <LazySection minHeight={380}>
        <UpcomingReleases />
      </LazySection>
    </>
  );
}
