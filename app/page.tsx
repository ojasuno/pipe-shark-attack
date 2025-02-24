"use client"; // Ensure client-side rendering for Leaflet

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic'; // Import dynamic
import 'leaflet/dist/leaflet.css';
import Papa from 'papaparse';

// Dynamic import for Leaflet to avoid SSR issues
const L = dynamic(() => import('leaflet'), {
    ssr: false, // Disable server-side rendering
});

const MapComponent = () => {
    const [map, setMap] = useState(null);
    const mapRef = useRef(null); // Ref to the map container

    useEffect(() => {
        if (!map) {
            const newMap = L.map(mapRef.current).setView([0, 0], 2);

            L.tileLayer('https://tileserver.memomaps.de/tilegen/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(newMap);

            setMap(newMap);
        }

    }, [map]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/data/ip_data.csv');
                const text = await response.text();
                const results = Papa.parse(text, { header: true, skipEmptyLines: true });
                const data = results.data;

                if (map) {
                    const countryCounts = {};

                    // Count occurrences of each country
                    data.forEach(row => {
                        const country = row.Country;
                        countryCounts[country] = (countryCounts[country] || 0) + 1;
                    });

                    // Fetch GeoJSON data for countries
                    const geoJsonUrl = 'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson';
                    const geoJsonRes = await fetch(geoJsonUrl);
                    const geoJsonData = await geoJsonRes.json();

                    // Add GeoJSON layer to the map with dynamic styling and popup
                    L.geoJSON(geoJsonData, {
                        style: (feature) => {
                            const countryName = feature.properties.ADMIN;
                            const count = countryCounts[countryName] || 0;
                            return {
                                fillColor: getColor(count),
                                weight: 1,
                                opacity: 1,
                                color: 'white',
                                fillOpacity: 0.7,
                            };
                        },
                        onEachFeature: (feature, layer) => {
                            const countryName = feature.properties.ADMIN;
                            const count = countryCounts[countryName] || 0;
                            layer.bindPopup(`${countryName}: ${count} IP(s)`);
                        },
                    }).addTo(map);
                }

            } catch (error) {
                console.error('Error fetching or processing CSV data:', error);
            }
        };

        fetchData();

    }, [map]); // Run when map is initialized

    // Color Palette function
    function getColor(count: number): string {
        return count > 5 ? '#800026' :
            count > 4 ? '#BD0026' :
                count > 3 ? '#E31A1C' :
                    count > 2 ? '#FC4E2A' :
                        count > 1 ? '#FD8D3C' :
                            count > 0 ? '#FEB24C' :
                                '#FFEDA0';
    }

    return (
        <div id="map" ref={mapRef} style={{ height: '600px' }}></div>
    );
};

export default MapComponent;

