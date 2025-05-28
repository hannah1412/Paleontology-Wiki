import TreePage from '@/components/Tree/TreePage';
// import dynamic from 'next/dynamic'
// const TreePage = dynamic(() => import('@/components/Tree/TreePage'), { ssr: false })

export const metadata = {
  title: "Cladogram",
  description: "Map out the evolutionary relationships between dinosaurs.",
};


export default function Page() {
  return <TreePage/>;
}
