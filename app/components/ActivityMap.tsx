'use client';

import { MapContainer, TileLayer, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import * as polyline from '@mapbox/polyline'; // Đổi dòng này
import L from 'leaflet';
import { useEffect } from 'react';

const fixLeafletIcon = () => {
  if (typeof window !== 'undefined') {
    delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });
  }
};

export default function ActivityMap({ encodedPolyline }: { encodedPolyline: string }) {
  useEffect(() => {
    fixLeafletIcon();
  }, []);

  if (!encodedPolyline) return null;

  const positions = polyline.decode(encodedPolyline);
  const center = positions[Math.floor(positions.length / 2)];

  return (
    <div className="h-96 w-full rounded-xl overflow-hidden border-2 border-green-500">
      <MapContainer 
        center={(center as [number, number]) || [11.9416, 108.4383]} 
        zoom={14} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Polyline positions={positions as [number, number][]} color="#FC4C02" weight={5} />
      </MapContainer>
    </div>
  );
}