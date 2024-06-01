import React from "react";
import { Link } from "react-router-dom";
import styled from 'styled-components';
import 'bootstrap/dist/css/bootstrap.min.css';
import SkeletonItem from './SkeletonItem';
import { useUser } from "../contexts/UserContext"; // Asegúrate de importar el contexto de usuario

const Card = styled.div`
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }
`;

const CardImageWrapper = styled.div`
  width: 100%;
  height: 200px;
  overflow: hidden;
`;

const CardImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

const CardBody = styled.div`
  padding: 20px;
`;

const CardTitle = styled.h5`
  font-size: 1.25rem;
  margin-bottom: 10px;
`;

const CardText = styled.p`
  font-size: 1rem;
  margin-bottom: 10px;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 15px;
`;

function formatDate(timestamp) {
  const date = new Date(parseInt(timestamp));
  return date.toLocaleDateString("es-ES");
}

function formatPrice(price) {
  return price.replace(/(\d),(\d\d)\u00a0\u20ac.*/, "$1,$2 €)");
}

function ItemList({ items = [], deleteItem, loading }) {
  const { state } = useUser();
  const isAdmin = state.user?.groups.includes('Admin');

  return (
    <div className="row row-cols-1 row-cols-md-4 g-4">
      {loading ? (
        Array(8).fill().map((_, index) => (
          <div key={index} className="col d-flex align-items-stretch">
            <SkeletonItem />
          </div>
        ))
      ) : (
        items.map((item, index) => {
          const lastPriceHistory = item.price_history && item.price_history.length > 0
            ? item.price_history[item.price_history.length - 1]
            : null;
            console.log("ITEM NAME ", item.pname)
            console.log("ITEM NAME ", item)
            console.log("PRICE HSITORY",item.pname, item.priceHistory)
            console.log("PRICE HSITORY 2",item.pname, item.price_history)

          return (
            <div
              key={item._id ? item._id.$oid : index}
              className="col d-flex align-items-stretch"
            >
              <Card className="card h-100 d-flex flex-column">
                <CardImageWrapper>
                  <CardImage
                    src={item.image_url}
                    alt={`Imagen de ${item.pname}`}
                  />
                </CardImageWrapper>
                <CardBody className="card-body">
                  <CardTitle className="card-title">{item.pname}</CardTitle>
                  <CardText className="card-text">
                    <strong>Precio por unidad/kilo/litro:</strong>{" "}
                    {formatPrice(item.price_per_unit)}
                  </CardText>
                  <CardText className="card-text">
                    <strong>Precio total:</strong> {item.total_price}
                  </CardText>
                  <CardText className="card-text">
                    <strong>Fecha de obtención:</strong>{" "}
                    {lastPriceHistory
                      ? formatDate(lastPriceHistory.timestamp)
                      : formatDate(item.timestamp)}
                  </CardText>
                  <CardText className="card-text">
                    <strong>Proveedor:</strong> {item.origin}
                  </CardText>
                </CardBody>
                <ButtonGroup className="mt-auto">
                  <Link
                    to={`/item/${item.pname}`}
                    className="btn btn-primary"
                  >
                    Ver Detalles
                  </Link>
                  {isAdmin && (
                    <button
                      onClick={() => deleteItem(item.pname)}
                      className="btn btn-danger ms-2"
                    >
                      Borrar Ítem
                    </button>
                  )}
                </ButtonGroup>
              </Card>
            </div>
          );
        })
      )}
    </div>
  );
}

export default ItemList;
