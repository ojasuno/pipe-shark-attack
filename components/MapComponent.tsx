"use client";

import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Papa from 'papaparse';

const MapComponent: React.FC = () => {
    const [map, setMap] = useState<L.Map | null>(null);
    const mapRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!map && mapRef.current) {
            const newMap = L.map(mapRef.current).setView([0, 0], 2);

            L.tileLayer('https://tileserver.memomaps.de/tilegen/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(newMap);

            setMap(newMap);
        }
    }, [map]);

    useEffect(() => {
        const fetchData = async () => {
            if (!map) return;

            try {
                const response = await fetch('/data/ip_data.csv');
                const text = await response.text();
                const results = Papa.parse(text, { header: true, skipEmptyLines: true });
                const data = results.data as Array<{ Country: string }>;

                const countryCounts: { [key: string]: number } = {};

                data.forEach(row => {
                    const country = row.Country;
                    countryCounts[country] = (countryCounts[country] || 0) + 1;
                });

                const geoJsonUrl = 'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson';
                const geoJsonRes = await fetch(geoJsonUrl);
                const geoJsonData = await geoJsonRes.json();

                L.geoJSON(geoJsonData, {
                    style: (feature) => {
                        const countryName = feature?.properties?.ADMIN;
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
                        const countryName = feature?.properties?.ADMIN;
                        const count = countryCounts[countryName] || 0;
                        layer.bindPopup(`${countryName}: ${count} IP(s)`);
                    },
                }).addTo(map);

            } catch (error) {
                console.error('Error fetching or processing CSV data:', error);
            }
        };

        fetchData();
    }, [map]);

    function getColor(count: number): string {
        return count > 5 ? '#800026' :
               count > 4 ? '#BD0026' :
               count > 3 ? '#E31A1C' :
               count > 2 ? '#FC4E2A' :
               count > 1 ? '#FD8D3C' :
               count > 0 ? '#FEB24C' :
                           '#FFEDA0';
    }

    return <div ref={mapRef} style={{ height: '600px' }}></div>;
};

export default MapComponent;
