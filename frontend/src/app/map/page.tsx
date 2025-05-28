import dynamic from 'next/dynamic'
const MapPage = dynamic(() => import('@/components/Map/MapPage'), { ssr: false })

export const metadata = {
  title: "Fossil Map",
  description: "Explore where dinosaurs have ended up.",
};

// Do not use Server Side Rendering as Open Street Map needs to run on client only!
// (it uses window!!)
// https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading#skipping-ssr
export default function Page() {
  return <MapPage/>
}
