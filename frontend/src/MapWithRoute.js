import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

const MapWithRoute = ({ start, waypoint, end }) => {
    useEffect(() => {
        console.log("Rendering map with:", start, waypoint, end);
        if (start && waypoint && end) {
            const map = L.map('map').setView(start, 13);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

            const routingControl = L.Routing.control({
                waypoints: [
                    L.latLng(start.lat, start.lng),
                    L.latLng(waypoint.lat, waypoint.lng),
                    L.latLng(end.lat, end.lng)
                ],
                routeWhileDragging: true
            }).addTo(map);

            return () => map.remove();
        }
    }, [start, waypoint, end]);

    return <div id="map" style={{ height: '300px', width: '100%' }}></div>;
};

export default MapWithRoute;
