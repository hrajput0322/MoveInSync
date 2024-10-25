import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

const MapComponent = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(null);
  const [lat, setLat] = useState(null);
  const [destination, setDestination] = useState('');
  const [route, setRoute] = useState(null);
  const [showShareButton, setShowShareButton] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [estimatedTime, setEstimatedTime] = useState(null);
  const [estimatedCost, setEstimatedCost] = useState(null);
  const [rideActive, setRideActive] = useState(false);

  const costPerKm = 20;

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLng(position.coords.longitude);
          setLat(position.coords.latitude);
        },
        () => {
          alert('Unable to retrieve your location');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser');
    }
  }, []);

  useEffect(() => {
    if (lng !== null && lat !== null && !map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [lng, lat],
        zoom: 13,
      });

      new mapboxgl.Marker({ color: 'blue' })
        .setLngLat([lng, lat])
        .addTo(map.current);
    }
  }, [lng, lat]);

  useEffect(() => {
    if (map.current && route) {
      if (map.current.getSource('route')) {
        map.current.getSource('route').setData(route);
      } else {
        map.current.addLayer({
          id: 'route',
          type: 'line',
          source: {
            type: 'geojson',
            data: route,
          },
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#3887be',
            'line-width': 5,
            'line-opacity': 0.75,
          },
        });
      }
    }
  }, [route]);

  const isValidPhoneNumber = (number) => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(number);
  };

  const getRoute = () => {
    if (!destination) {
      alert('Please enter a destination');
      return;
    }

    fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        destination
      )}.json?access_token=${mapboxgl.accessToken}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.features && data.features.length > 0) {
          const destCoords = data.features[0].geometry.coordinates;

          fetch(
            `https://api.mapbox.com/directions/v5/mapbox/driving/${lng},${lat};${destCoords[0]},${destCoords[1]}?geometries=geojson&access_token=${mapboxgl.accessToken}`
          )
            .then((res) => res.json())
            .then((data) => {
              if (data.routes && data.routes.length > 0) {
                const routeData = {
                  type: 'Feature',
                  properties: {},
                  geometry: data.routes[0].geometry,
                };
                setRoute(routeData);

                const distanceInKm = data.routes[0].distance / 1000;
                const durationInMinutes = Math.round(data.routes[0].duration / 60);
                const cost = (distanceInKm * costPerKm).toFixed(2);

                setEstimatedTime(durationInMinutes);
                setEstimatedCost(cost);

                if (map.current.getLayer('destination')) {
                  map.current.removeLayer('destination');
                  map.current.removeSource('destination');
                }

                map.current.addLayer({
                  id: 'destination',
                  type: 'circle',
                  source: {
                    type: 'geojson',
                    data: {
                      type: 'Feature',
                      properties: {},
                      geometry: {
                        type: 'Point',
                        coordinates: destCoords,
                      },
                    },
                  },
                  paint: {
                    'circle-radius': 8,
                    'circle-color': '#f30',
                  },
                });

                const bounds = new mapboxgl.LngLatBounds();
                routeData.geometry.coordinates.forEach((coord) => bounds.extend(coord));
                map.current.fitBounds(bounds, { padding: 50 });

                setShowShareButton(true);
              } else {
                alert('No route found');
              }
            })
            .catch((err) => {
              console.error('Error fetching directions:', err);
              alert('Error fetching directions');
            });
        } else {
          alert('Destination not found');
        }
      })
      .catch((err) => {
        console.error('Error geocoding destination:', err);
        alert('Error finding destination');
      });
  };

  const handleShareRideDetails = () => {
    if (!phoneNumber) {
      alert('Please enter a phone number');
      return;
    }

    if (!isValidPhoneNumber(phoneNumber)) {
      alert('Please enter a valid phone number in E.164 format (e.g., +919876543210)');
      return;
    }

    const dataToSend = {
      phoneNumber,
      estimatedTime,
      estimatedCost,
    };

    axios
      .post('http://localhost:5000/sendSMS', dataToSend, { withCredentials: true })
      .then((res) => {
        if (res.data.success) {
          alert('Ride details sent successfully!');
          setRideActive(true);
        } else {
          alert('Failed to send ride details.');
        }
      })
      .catch((err) => {
        console.error('Error sending SMS:', err);
        alert('Error sending ride details.');
      });
  };

  const handleEndRide = () => {
    if (!phoneNumber) {
      alert('Phone number is missing. Please share ride details first.');
      return;
    }

    const dataToSend = {
      phoneNumber,
    };

    axios
      .post('http://localhost:5000/endRideSMS', dataToSend, { withCredentials: true })
      .then((res) => {
        if (res.data.success) {
          alert('Ride ended and notification sent successfully!');
          setRideActive(false);
        } else {
          alert('Failed to send ride end notification.');
        }
      })
      .catch((err) => {
        console.error('Error sending End Ride SMS:', err);
        alert('Error sending ride end notification.');
      });

    const driverName = 'John Doe';
    const cabNumber = 'ABC-1234';

    const data = {
      destination,
      driverName,
      cabNumber,
      estimatedTime,
      estimatedCost,
    };

    axios
      .post('http://localhost:5000/saveJourney', data)
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        alert(err);
      });
    handleLogout();
  };

  const handleLogout = () => {
    window.open('http://localhost:5000/logout', '_self');
  };

  return (
    <div>
      <div ref={mapContainer} style={{ height: '100vh', width: '100%' }} />
      <div
        className="position-absolute top-0 start-0 mt-4 ms-4 bg-white p-4 rounded shadow"
        style={{ maxWidth: '350px', zIndex: 1 }}
      >
        <input
          type="text"
          placeholder="Enter destination"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          className="form-control mb-3"
        />
        <button onClick={getRoute} className="btn btn-primary w-100 mb-3">
          Book Ride
        </button>
        <button onClick={handleLogout} className="btn btn-secondary w-100 mb-3">
          Logout
        </button>

        {estimatedTime !== null && estimatedCost !== null && (
          <div className="alert alert-info mt-3">
            <p>
              <strong>Estimated Travel Time:</strong> {estimatedTime} minutes
            </p>
            <p>
              <strong>Estimated Cost:</strong> ₹{estimatedCost}
            </p>
          </div>
        )}

        {showShareButton && (
          <div className="mt-3">
            <input
              type="text"
              placeholder="Enter phone number (e.g., +919876543210)"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="form-control mb-3"
            />
            <button onClick={handleShareRideDetails} className="btn btn-success w-100 mb-3">
              Share Ride Details
            </button>

            {rideActive && (
              <button
                onClick={handleEndRide}
                className="btn btn-danger w-100"
              >
                End Ride
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MapComponent;
