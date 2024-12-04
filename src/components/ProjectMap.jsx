import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useProjectStore } from "../stores/projectStore";

export default function ProjectMap({ onMarkerClick, suppliers }) {
    const { projects } = useProjectStore();

    const defaultCenter = [46.2276, 2.2137]; // France's approximate center
    const defaultZoom = 6;

    const validProjects = projects.filter(
        project =>
            project.latitude !== null &&
            project.longitude !== null &&
            !isNaN(parseFloat(project.latitude)) &&
            !isNaN(parseFloat(project.longitude))
    ).map(project => ({
        ...project,
        latitude: parseFloat(project.latitude),
        longitude: parseFloat(project.longitude)
    }));

    if (validProjects.length === 0) {
        return (
            <MapContainer center={defaultCenter} zoom={defaultZoom} style={{ height: '500px', width: '100%' }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <div style={{ padding: '20px' }}>Aucun projet avec coordonnées</div>
            </MapContainer>
        );
    }

    const centerLat = validProjects.reduce((sum, project) => sum + project.latitude, 0) / validProjects.length;
    const centerLon = validProjects.reduce((sum, project) => sum + project.longitude, 0) / validProjects.length;

    return (
        <MapContainer center={[centerLat, centerLon]} zoom={defaultZoom} style={{ height: '500px', width: '100%' }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {validProjects.map(project => (
                <Marker
                    key={project.nom_projet}
                    position={[project.latitude, project.longitude]}
                    eventHandlers={{
                        click: () => onMarkerClick(project),
                    }}
                >
                    <Popup>
                        <h3>{project.nom_projet}</h3>
                        <p>{project.adresse_chantier}</p>
                    </Popup>
                </Marker>
            ))}

            {/* Add CircleMarker for suppliers */}
            {suppliers.map(supplier => (
                <CircleMarker
                    key={supplier.id}
                    center={[supplier.lat, supplier.lon]}
                    radius={6} // radius size
                    color="blue" // color of the circle
                    fillColor="blue" // fill color of the circle
                    fillOpacity={0.6}
                >
                    <Popup>
                        <h4>{supplier.name}</h4>
                        <p>{supplier.address}</p>
                    </Popup>
                </CircleMarker>
            ))}
        </MapContainer>
    );
}
