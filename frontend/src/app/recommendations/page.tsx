import Recommendations from '@/components/Search/RecommendationsList'

export const metadata = {
  title: "Recommendations",
  description: "Find dinosaurs similar to the one you searched for.",
};

export default function Page() {
  return <Recommendations items = {[]}/>
}
