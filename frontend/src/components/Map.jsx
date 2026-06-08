import React, { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function Map({ branches }) {
  const center = branches.length > 0
    ? [parseFloat(branches[0].latitud), parseFloat(branches[0].longitud)]
    : [-17.382, -66.159];

  return (
    <div className="map-container">
      <MapContainer center={center} zoom={12} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {branches.map((b) => (
          <CircleMarker
            key={b.id_sucursal}
            center={[parseFloat(b.latitud), parseFloat(b.longitud)]}
            radius={10}
            pathOptions={{ color: '#D4AF37', fillColor: '#8B0000', fillOpacity: 0.85 }}
          >
            <Popup>
              <strong>{b.nombre}</strong><br />
              {b.direccion}<br />
              {b.telefono}
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
