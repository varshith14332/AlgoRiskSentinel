import { MapContainer, TileLayer, Polyline, CircleMarker, Popup, useMap } from 'react-leaflet';
import type { Shipment, Alert } from '../types';
import { useEffect, Fragment } from 'react';

interface ShipmentMapProps {
    shipments: Shipment[];
    alerts: Alert[];
    selectedShipment?: Shipment | null;
}

function riskColor(score: number): string {
    if (score >= 70) return '#ef4444';
    if (score >= 40) return '#f59e0b';
    return '#22c55e';
}

function FitBounds({ shipments }: { shipments: Shipment[] }) {
    const map = useMap();
    useEffect(() => {
        if (shipments.length === 0) return;
        const allCoords = shipments.flatMap(s => [s.originCoords, s.destinationCoords]);
        if (allCoords.length > 0) {
            const bounds = allCoords.map(c => [c.lat, c.lng] as [number, number]);
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [shipments, map]);
    return null;
}

export default function ShipmentMap({ shipments, alerts, selectedShipment }: ShipmentMapProps) {
    const alertMap = new Map<string, Alert>();
    alerts.forEach(a => alertMap.set(a.shipmentID, a));

    return (
        <MapContainer
            center={[20.5937, 78.9629]}
            zoom={5}
            className="h-full w-full rounded-xl"
            style={{ background: '#0a0e1a' }}
        >
            <TileLayer
                attribution="&copy; CartoDB"
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            <FitBounds shipments={shipments} />

            {shipments.map((shipment) => {
                const alert = alertMap.get(shipment.shipmentID);
                const score = alert?.riskScore || 0;
                const color = riskColor(score);

                return (
                    <Fragment key={shipment.shipmentID}>
                        {/* Planned route */}
                        {shipment.routeCoordinates && shipment.routeCoordinates.length > 0 && (
                            <Polyline
                                positions={shipment.routeCoordinates.map(c => [c.lat, c.lng])}
                                pathOptions={{ color: '#00d4ff', weight: 2, dashArray: '8 4', opacity: 0.7 }}
                            />
                        )}

                        {/* Actual route (deviation) */}
                        {shipment.actualRouteCoordinates && shipment.actualRouteCoordinates.length > 0 && (
                            <Polyline
                                positions={shipment.actualRouteCoordinates.map(c => [c.lat, c.lng])}
                                pathOptions={{ color: '#ef4444', weight: 3, opacity: 0.9 }}
                            />
                        )}

                        {/* Route line origin → destination */}
                        <Polyline
                            positions={[
                                [shipment.originCoords.lat, shipment.originCoords.lng],
                                [shipment.destinationCoords.lat, shipment.destinationCoords.lng],
                            ]}
                            pathOptions={{
                                color,
                                weight: selectedShipment?.shipmentID === shipment.shipmentID ? 4 : 2,
                                opacity: 0.6,
                            }}
                        />

                        {/* Origin marker */}
                        <CircleMarker
                            center={[shipment.originCoords.lat, shipment.originCoords.lng]}
                            radius={6}
                            pathOptions={{ color, fillColor: color, fillOpacity: 0.8 }}
                        >
                            <Popup>
                                <div className="text-xs">
                                    <strong>{shipment.shipmentID}</strong><br />
                                    From: {shipment.origin}<br />
                                    To: {shipment.destination}<br />
                                    {alert && <>Risk: {alert.riskScore} ({alert.severity})</>}
                                </div>
                            </Popup>
                        </CircleMarker>

                        {/* Destination marker */}
                        <CircleMarker
                            center={[shipment.destinationCoords.lat, shipment.destinationCoords.lng]}
                            radius={5}
                            pathOptions={{ color, fillColor: color, fillOpacity: 0.5 }}
                        >
                            <Popup>
                                <div className="text-xs">
                                    <strong>Destination</strong><br />
                                    {shipment.destination}
                                </div>
                            </Popup>
                        </CircleMarker>
                    </Fragment>
                );
            })}
        </MapContainer>
    );
}
