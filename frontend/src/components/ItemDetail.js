import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Line } from "react-chartjs-2";
import { useUser } from "../contexts/UserContext";
import "./ItemDetail.css";
import "chart.js/auto";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function formatDate(timestamp) {
  const date = new Date(parseInt(timestamp));
  return date.toLocaleDateString("es-ES");
}

function formatPriceForDisplay(price) {
  if (!price) return "0,00 €";
  return price.replace(/(\d),(\d\d)\u00a0\u20ac.*/, "$1,$2 €");
}

function formatPrice(price) {
  const match = price.match(/(\d+,\d+)\u00a0\u20ac/);
  return match ? parseFloat(match[1].replace(",", ".")) : null;
}

function formatPriceForArima(price) {
  if (!price) return 0;
  const formattedPrice = parseFloat(
    price.replace(/[^\d,.-]/g, "").replace(",", ".")
  );
  return isNaN(formattedPrice) ? 0 : formattedPrice;
}

function ItemDetail() {
  const { pname } = useParams();
  const navigate = useNavigate();
  const { state } = useUser();
  const [item, setItem] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [forecastDates, setForecastDates] = useState([]);
  const [showArimaMessage, setShowArimaMessage] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await axios.get(
          `https://alccm18ogi.execute-api.eu-west-1.amazonaws.com/Prod/item/name/${pname}`
        );
        if (response.status === 200) {
          setItem(response.data);
          const priceHistory = response.data.price_history || [];
          if (priceHistory.length >= 20) {
            const prices = priceHistory.map((entry) =>
              formatPriceForArima(entry.total_price)
            );
            const { data } = await axios.post("https://alccm18ogi.execute-api.eu-west-1.amazonaws.com/Prod/predict", {
              prices,
            });

            const lastDate = new Date(
              parseInt(priceHistory[priceHistory.length - 1].timestamp)
            );

            const forecastDates = Array.from(
              { length: data.forecast.length },
              (_, i) => {
                const newDate = new Date(lastDate);
                newDate.setDate(lastDate.getDate() + i + 1);
                return formatDate(newDate.getTime());
              }
            );
            setForecast(data.forecast);
            setForecastDates(forecastDates);
          } else {
            setShowArimaMessage(true);
          }
        } else {
          throw new Error(`Item not found: ${response.status}`);
        }
      } catch (error) {
        console.error("Error fetching item details:", error);
      }
    };

    fetchItem();
  }, [pname]);

  const handleBack = () => {
    navigate("/");
    window.location.reload();
  };

  const handleDelete = async () => {
    try {
      const encodedPname = encodeURIComponent(pname);
      await axios.delete(
        `https://alccm18ogi.execute-api.eu-west-1.amazonaws.com/Prod/item/name/${encodedPname}`
      );
      navigate("/");
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  if (!item) {
    return <div className="container mt-5">Cargando...</div>;
  }

  const today = new Date();
  const formattedToday = today.toLocaleDateString("es-ES");
  const priceHistory = item.price_history || [];
  const dates = [];
  const unitPrices = [];
  const totalPrices = [];

  if (priceHistory.length === 0) {
    const startDate = new Date(parseInt(item.timestamp));
    let currentDate = new Date(startDate);
    while (currentDate <= today) {
      dates.push(formatDate(currentDate.getTime()));
      unitPrices.push(formatPrice(item.price_per_unit));
      totalPrices.push(parseFloat(item.total_price.replace(",", ".")));
      currentDate.setDate(currentDate.getDate() + 1);
    }
  } else {
    priceHistory.forEach((entry) => {
      dates.push(formatDate(entry.timestamp));
      unitPrices.push(parseFloat(entry.price_per_unit.replace(",", ".")));
      totalPrices.push(parseFloat(entry.total_price.replace(",", ".")));
    });

    const lastDate = new Date(
      parseInt(priceHistory[priceHistory.length - 1].timestamp)
    );
    const lastUnitPrice = formatPrice(
      priceHistory[priceHistory.length - 1].price_per_unit
    );
    const lastTotalPrice = parseFloat(
      priceHistory[priceHistory.length - 1].total_price.replace(",", ".")
    );

    let currentDate = new Date(lastDate);
    currentDate.setDate(currentDate.getDate() + 1);

    while (currentDate <= today) {
      dates.push(formatDate(currentDate.getTime()));
      unitPrices.push(lastUnitPrice);
      totalPrices.push(lastTotalPrice);
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  const chartData = {
    labels: dates.concat(forecastDates),
    datasets: [
      {
        label: "Precio por Unidad",
        data: unitPrices.concat(Array(forecastDates.length).fill(null)),
        borderColor: "rgba(75,192,192,1)",
        backgroundColor: "rgba(75,192,192,0.2)",
        fill: false,
      },
      {
        label: "Precio Total",
        data: totalPrices.concat(Array(forecastDates.length).fill(null)),
        borderColor: "rgba(192,75,75,1)",
        backgroundColor: "rgba(192,75,75,0.2)",
        fill: false,
      },
      {
        label: "Predicción (ARIMA)",
        data: Array(dates.length).fill(null).concat(forecast),
        borderColor: "rgba(255,99,132,1)",
        backgroundColor: "rgba(255,99,132,0.2)",
        fill: false,
      },
    ],
  };

  const isAdmin = state.user?.groups.includes("Admin");

  return (
    <div className="container mt-5 d-flex justify-content-center">
      <div className="card p-4" style={{ maxWidth: "800px" }}>
        <h2 className="text-center mb-4">Detalles del Ítem</h2>
        <p>
          <strong>Nombre:</strong> {item.pname}
        </p>
        <p>
          <strong>Precio por unidad:</strong>{" "}
          {formatPriceForDisplay(item.price_per_unit)}
        </p>
        <p>
          <strong>Precio total:</strong>{" "}
          {formatPriceForDisplay(item.total_price)}
        </p>
        <p>
          <strong>Fecha de obtención:</strong> {formatDate(item.timestamp)}
        </p>
        {item.image_url && (
          <img
            src={item.image_url}
            alt={`Imagen de ${item.pname}`}
            className="img-fluid mb-3 item-image"
          />
        )}
        <div className="d-flex justify-content-between mb-3">
          <button onClick={handleBack} className="btn btn-secondary">
            Volver
          </button>
          {isAdmin && (
            <button onClick={handleDelete} className="btn btn-danger">
              Borrar Ítem
            </button>
          )}
        </div>
        <div className="mt-4">
          <h3>Historial de Precios y Predicciones</h3>
          <Line data={chartData} />
          {showArimaMessage && (
            <div className="alert alert-warning mt-3" role="alert">
              Este item no cuenta con los suficientes datos como para realizar una predicción ARIMA.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ItemDetail;
