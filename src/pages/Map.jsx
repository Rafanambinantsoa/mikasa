import '../styles/map/map.css'
import ProjectMap from '../components/ProjectMap';
import { useProjectStore } from '../stores/projectStore';
import { useEffect, useState } from 'react';
import { Card, Text } from '@mantine/core';

export default function Map() {
    const { getProjects } = useProjectStore();
    const [selectedProject, setSelectedProject] = useState(null);
    const [weatherData, setWeatherData] = useState(null);
    const [suppliers, setSuppliers] = useState([]);

    useEffect(() => {
        getProjects();
    }, []);

    const fetchWeatherData = async (latitude, longitude) => {
        try {
            const response = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode,windspeed_10m_max&timezone=auto&forecast_days=7`
            );
            const data = await response.json();
            setWeatherData({
                current: data.current_weather,
                daily: data.daily
            });
        } catch (error) {
            console.error('Error fetching weather data:', error);
        }
    };

    const getWeatherDescription = (code) => {
        const weatherCodes = {
            0: 'Ciel dégagé',
            1: 'Principalement dégagé',
            2: 'Partiellement nuageux',
            3: 'Couvert',
            45: 'Brouillard',
            48: 'Brouillard givrant',
            51: 'Bruine légère',
            53: 'Bruine modérée',
            55: 'Bruine dense',
            61: 'Pluie légère',
            63: 'Pluie modérée',
            65: 'Pluie forte',
            71: 'Neige légère',
            73: 'Neige modérée',
            75: 'Neige forte',
            95: 'Orage'
        };
        return weatherCodes[code] || 'Inconnu';
    };

    const formatDate = (dateString) => {
        const options = { weekday: 'long', day: 'numeric', month: 'long' };
        return new Date(dateString).toLocaleDateString('fr-FR', options);
    };

    const fetchSuppliers = async (latitude, longitude) => {
        try {
            const query = `
                [out:json];
                (
                    node["shop"="hardware"](around:5000,${latitude},${longitude});
                    node["building"="construction"](around:5000,${latitude},${longitude});
                );
                out body;
            `;
            const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
            const data = await response.json();

            const results = data.elements.map((element) => ({
                id: element.id,
                name: element.tags.name || "Fournisseur anonyme",
                address: element.tags["addr:street"] || "Adresse inconnue",
                lat: element.lat,
                lon: element.lon,
            }));

            setSuppliers(results);
        } catch (error) {
            console.error('Error fetching suppliers:', error);
        }
    };

    const handleMarkerClick = (project) => {
        setSelectedProject(project);
        fetchWeatherData(project.latitude, project.longitude);
        fetchSuppliers(project.latitude, project.longitude);
    };

    return (
        <div className="map-container">
            <ProjectMap onMarkerClick={handleMarkerClick} suppliers={suppliers} />
            <div className="map-details">
                <Card padding="xl" radius="xl" withBorder>
                    {weatherData ? (
                        <div className="map-card-content">
                            <div className="map-card-header">
                                <h3 className='bold-title'>{selectedProject.nom_projet}</h3>
                                <p>Address: {selectedProject.adresse_chantier}</p>
                            </div>
                            <div className='map-card-div'>
                                <h3 className='bold-title'>Météo Actuelle</h3>
                                <p>Température: {weatherData.current.temperature}°C</p>
                                <p>Conditions: {getWeatherDescription(weatherData.current.weathercode)}</p>
                                <p>Vitesse du vent: {weatherData.current.windspeed} km/h</p>
                            </div>
                            <div className='map-card-div'>
                                <h3 className='bold-title'>Prévisions sur 7 jours</h3>
                                <div className='forecast-grid'>
                                    {weatherData.daily.time.map((date, index) => (
                                        <div key={date} className='forecast-day'>
                                            <strong>{formatDate(date)}</strong>
                                            <p>Min: {weatherData.daily.temperature_2m_min[index]}°C</p>
                                            <p>Max: {weatherData.daily.temperature_2m_max[index]}°C</p>
                                            <p>{getWeatherDescription(weatherData.daily.weathercode[index])}</p>
                                            <p>Vent: {weatherData.daily.windspeed_10m_max[index]} km/h</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p>Sélectionner un projet pour voir les détails météo</p>
                    )}
                </Card>
                <Card padding="xl" radius="xl" withBorder>
                    {suppliers.length > 0 ? (
                        <div className="map-card-content">
                            <div className="map-card-header">
                                <h3 className='bold-title'>Fournisseurs de Matériaux</h3>
                                <Text c='dimmed'>Une liste de fournisseurs près de votre chantier</Text>
                            </div>
                            <div className='map-card-div'>
                                <div className='supplier-grid'>
                                    {suppliers.map((supplier) => (
                                        <div key={supplier.id} className='supplier-card'>
                                            <strong>{supplier.name}</strong>
                                            <p>{supplier.address}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p>Sélectionnez un projet pour voir les fournisseurs proches</p>
                    )}
                </Card>
            </div>
        </div>
    );
}