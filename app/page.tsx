"use client"
import React, { useRef, useEffect, useState } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import Overlay from 'ol/Overlay';
import { fromLonLat } from 'ol/proj';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector } from 'ol/source';
import { Style, Circle, Fill, Stroke } from 'ol/style';
import { Draw, Modify } from 'ol/interaction';
import { Point, Polygon, LineString } from 'ol/geom';
import { Coordinate } from 'ol/coordinate';

const MapComponent: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [drawType, setDrawType] = useState<string | null>(null); // State to store the type of drawing: 'Point', 'LineString', 'Polygon'

  useEffect(() => {
    if (!mapContainer.current) return;

    const baseLayer = new TileLayer({
      source: new OSM()
    });

    const map = new Map({
      target: mapContainer.current,
      layers: [baseLayer],
      view: new View({
        center: fromLonLat([0, 0]),
        zoom: 2
      })
    });

    // Add a pinpoint marker
    const marker = new Overlay({
      positioning: 'center-center',
      element: document.createElement('div'),
      stopEvent: false
    });
    map.addOverlay(marker);

    // Add drawing interaction
    const source = new Vector({
      wrapX: false
    });
    const vector = new VectorLayer({
      source: source,
      style: new Style({
        fill: new Fill({
          color: 'rgba(255, 255, 255, 0.2)'
        }),
        stroke: new Stroke({
          color: '#ffcc33',
          width: 2
        }),
        image: new Circle({
          radius: 7,
          fill: new Fill({
            color: '#ffcc33'
          })
        })
      })
    });
    map.addLayer(vector);

    let draw: Draw | null = null;
    if (drawType) {
      draw = new Draw({
        source: source,
        type: drawType // Set draw type dynamically
      });
      map.addInteraction(draw);
    }

    const modify = new Modify({ source: source });
    map.addInteraction(modify);

    if (draw) {
      draw.on('drawend', (event) => {
        const feature = event.feature;
        const geometry = feature.getGeometry();
        let coordinates: Coordinate[] | null = null;

        if (geometry instanceof Point) {
          coordinates = [geometry.getCoordinates()];
        } else if (geometry instanceof LineString || geometry instanceof Polygon) {
          coordinates = geometry.getCoordinates();
        }

        if (coordinates) {
          console.log('Coordinates:', coordinates);
          // Calculate measurements here if needed
        }
      });
    }

    // Update marker position on click
    map.on('click', (event) => {
      const coordinate = event.coordinate;
      marker.setPosition(coordinate);
    });

    return () => {
      map.setTarget(undefined);
    };
  }, [drawType]); // Re-render the map when drawType changes

  const handleDrawTypeChange = (type: string) => {
    setDrawType(type);
  };

  return (
    <div className='p-3 mt-4'>
      <div ref={mapContainer} className="map-container border border-black my-1" style={{ width: '100%', height: '400px' }}></div>
      <div className='bg-black text-white flex gap-2 p-2'>
        <button onClick={() => handleDrawTypeChange('Point')}>Draw Point</button>
        <button onClick={() => handleDrawTypeChange('LineString')}>Draw Line</button>
        <button onClick={() => handleDrawTypeChange('Polygon')}>Draw Polygon</button>
      </div>
    </div>
  );
};

export default MapComponent;