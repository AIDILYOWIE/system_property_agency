import React, { useState, useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with bundlers
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconRetinaUrl: iconRetina,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Constants
const DEFAULT_CENTER: [number, number] = [-8.409518, 115.188916]; // Bali Center fallback
const OSM_URL = "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}";
const MAP_ATTRIBUTION = '&copy; <a href="https://maps.google.com">Google Maps</a>';

export const parseLocationArea = (val?: string): { lat: number; lng: number; zoom?: number } | null => {
    if (!val) return null;
    try {
        const parsed = JSON.parse(val);
        if (parsed && typeof parsed.lat === 'number' && typeof parsed.lng === 'number') {
            return parsed;
        }
    } catch (e) {
        // Fallback for non-JSON strings
    }
    return null;
};

// ─── MapPicker Component ──────────────────────────────────────────────────────────

interface MapPickerProps {
    value?: string;
    onChange: (value: string) => void;
}

export function MapPicker({ value, onChange }: MapPickerProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const leafletMap = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);

    const initialLocation = parseLocationArea(value);
    const center = initialLocation ? [initialLocation.lat, initialLocation.lng] as [number, number] : DEFAULT_CENTER;
    const zoom = initialLocation?.zoom || 10;

    useEffect(() => {
        if (!mapRef.current) return;

        // Initialize Map
        if (!leafletMap.current) {
            leafletMap.current = L.map(mapRef.current).setView(center, zoom);

            L.tileLayer(OSM_URL, {
                attribution: MAP_ATTRIBUTION,
                className: 'map-tiles-filter',
            }).addTo(leafletMap.current);

            if (initialLocation) {
                markerRef.current = L.marker(center).addTo(leafletMap.current);
            }

            // Click listener
            leafletMap.current.on('click', (e: L.LeafletMouseEvent) => {
                const { lat, lng } = e.latlng;

                if (markerRef.current) {
                    markerRef.current.setLatLng(e.latlng);
                } else if (leafletMap.current) {
                    markerRef.current = L.marker(e.latlng).addTo(leafletMap.current);
                }

                onChange(JSON.stringify({ lat, lng, zoom: 15 }));
            });
        }

        return () => {
            if (leafletMap.current) {
                leafletMap.current.remove();
                leafletMap.current = null;
                markerRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Sync external value changes (e.g., clear form)
    useEffect(() => {
        const loc = parseLocationArea(value);
        if (!loc && markerRef.current && leafletMap.current) {
            leafletMap.current.removeLayer(markerRef.current);
            markerRef.current = null;
        }
    }, [value]);

    return (
        <div className="w-full h-80 rounded-xl overflow-hidden border border-border-base relative z-0 [&_.map-tiles-filter]:grayscale [&_.map-tiles-filter]:contrast-75 [&_.map-tiles-filter]:brightness-110">
            <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-[400] bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-border-base text-xs font-medium text-text-primary pointer-events-none">
                Klik peta untuk menentukan lokasi pin
            </div>
        </div>
    );
}

// ─── MapView Component ──────────────────────────────────────────────────────────

interface MapViewProps {
    value?: string;
    className?: string; // Optional className for container overriding
}

export function MapView({ value, className = "w-full h-80" }: MapViewProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const leafletMap = useRef<L.Map | null>(null);
    const location = parseLocationArea(value);

    useEffect(() => {
        if (!mapRef.current || !location) return;

        if (!leafletMap.current) {
            leafletMap.current = L.map(mapRef.current).setView([location.lat, location.lng], location.zoom || 15);

            L.tileLayer(OSM_URL, {
                attribution: MAP_ATTRIBUTION,
                className: 'map-tiles-filter',
            }).addTo(leafletMap.current);

            L.marker([location.lat, location.lng]).addTo(leafletMap.current);
        }

        return () => {
            if (leafletMap.current) {
                leafletMap.current.remove();
                leafletMap.current = null;
            }
        };
    }, [location]);

    // Backward compatibility for iframe
    if (!location) {
        if (value && value.includes('<iframe')) {
            return (
                <div
                    dangerouslySetInnerHTML={{ __html: value.replace(/width="[^"]*"/, 'width="100%"').replace(/height="[^"]*"/, 'height="100%"') }}
                    className={`${className} [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:border-0 grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500`}
                />
            );
        } else if (value && (value.includes('google.com/maps') || value.includes('maps.app.goo.gl'))) {
            return (
                <iframe
                    src={value.includes('/embed') ? value : `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1!2d0!3d0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2s!5e0!3m2!1sen!2sid!4v1!5m2!1sen!2sid&q=${encodeURIComponent(value)}`}
                    className={`${className} border-0 grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500`}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Property Location"
                ></iframe>
            );
        }

        return (
            <div className={`${className} bg-gray-50 flex flex-col items-center justify-center text-text-muted`}>
                <span className="text-sm font-medium">Map location is unavailable</span>
            </div>
        );
    }

    return (
        <div className={`${className} z-0 overflow-hidden [&_.map-tiles-filter]:grayscale [&_.map-tiles-filter]:contrast-75 [&_.map-tiles-filter]:brightness-110 transition-all duration-500`}>
            <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
        </div>
    );
}
