import dynamic from 'next/dynamic';

// Dynamically import the MapComponent
const DynamicMap = dynamic(() => import('../components/MapComponent'), {
  ssr: false,
  loading: () => <p>Loading map...</p>
});

export default function Page() {
  return (
    <div>
      <h1>IP Address Map</h1>
      <DynamicMap />
    </div>
  );
}
