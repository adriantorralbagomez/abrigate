//Dependencias
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import cities from './provincias.json'; // Importa el archivo JSON con las ciudades de España
import { WiRain, WiThermometer, WiThermometerExterior } from "react-icons/wi";
import ClipLoader from 'react-spinners/ClipLoader';

//APP
const Weather = () => {
  const [weatherInfo, setWeatherInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // Radio de la Tierra en kilómetros
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  };

  //Formateo del nombre de la ciudad
  const formatCityName = (name) => {
    const city = cities.find((city) => name.toLowerCase().includes(city.label.toLowerCase()));
    console.log(city, name, cities);
    return city ? city.label : name;
  };

  useEffect(() => {
    //Obtener ubicación actual
    const fetchLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLatitude(position.coords.latitude);
            setLongitude(position.coords.longitude);
          },
          (error) => {
            console.error('Error getting location:', error);
            setError(error);
          }
        );
      } else {
        console.error('Geolocation is not supported by this browser.');
        setError(new Error('Geolocation is not supported by this browser.'));
      }
    };

    fetchLocation();
  }, []);

  useEffect(() => {
    const fetchWeatherData = async () => {
      if (latitude && longitude) {
        try {
          //Obtener apiKey (de la aemet) del fichero ./.env
          const apiKey = process.env.REACT_APP_AEMET_API_KEY;
          if (!apiKey) {
            throw new Error('API key is missing');
          }

          //Obtener todos los datos meteorológicos
          const url = `https://opendata.aemet.es/opendata/api/observacion/convencional/todas?api_key=${apiKey}`;
          console.log(`API URL: ${url}`);

          const response = await axios.get(url);
          console.log('API Response:', response.data);

          const dataResponse = await axios.get(response.data.datos);
          console.log('Weather data:', dataResponse.data);

          const weatherData = dataResponse.data;

          // Filtrar los datos para la ciudad o población más cercana
          const closestStation = weatherData.reduce((closest, item) => {
            const distance = haversineDistance(latitude, longitude, parseFloat(item.lat), parseFloat(item.lon));
            if (!closest || distance < closest.distance) {
              return { distance, station: item };
            }
            return closest;
          }, null);

          console.log('Closest station:', closestStation);
          setWeatherInfo(closestStation.station);
          setLoading(false);
        } catch (err) {
          console.error('API Error:', err);
          setError(err);
          setLoading(false);
        }
      }
    };

    fetchWeatherData();
  }, [latitude, longitude]);

  //Carga inicial de los datos
  if (loading) return (<div className="loader-container">
    <p>Cargando datos meteorológicos... <ClipLoader color={'#123abc'} loading={loading} size={50} /></p>
  </div>
  );
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Datos Meteorológicos</h1>
      {weatherInfo ? (
        <div>
          <p>Ciudad: {formatCityName(weatherInfo.ubi)}</p>
          <p><WiThermometerExterior /> Temperatura Mínima: {weatherInfo.tamin} °C</p>
          <p><WiThermometer /> Temperatura Máxima: {weatherInfo.tamax} °C</p>
          <p><WiRain /> {weatherInfo.prec} mm </p>

        </div>
      ) : (
        <div>No se encontraron datos meteorológicos para esta ubicación.</div>
      )}
    </div>
  );
};

export default Weather;
