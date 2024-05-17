import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ItemList from "./components/ItemList";
import ItemDetail from "./components/ItemDetail";
import ItemForm from "./components/ItemForm";
import UploadFile from "./components/UploadFile";
import Navbar from "./components/Navbar";
import Pagination from "./components/Pagination";
import useItems from "./useItems";
import ScrapingFormA from "./components/ScrapingForm";
import ScrapingFormH from "./components/ScrapingFormH";
import "bootstrap/dist/css/bootstrap.min.css";
import { Amplify } from "aws-amplify";
import { awsExports } from "./aws-exports";
import {
  Authenticator,
  useAuthenticator,
  useTheme,
  View,
  Heading,
  Image,
  Button,
} from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
// import ChildComponent from "./ChildComponent";

import { UserProvider } from './contexts/UserContext';
import { CartProvider } from './contexts/CartContext';
import TestComponent from "./components/TestComponent";

Amplify.configure(awsExports);

const App = () => {
  const {
    items,
    setItems,
    newItemName,
    setNewItemName,
    newItemPricePerUnit,
    setNewItemPricePerUnit,
    newItemTotalPrice,
    setNewItemTotalPrice,
    newItemImageUrl,
    setNewItemImageUrl,
    handleFormSubmit,
    deleteItem,
    searchItems,
    page,
    setPage,
    totalPages,
    setTotalPages,
    fetchItems,
    lastEvaluatedKey,
    setLastEvaluatedKey,
  } = useItems();

  // Función para leer los parámetros de la URL
  const getPageFromUrl = () => {
    const queryParams = new URLSearchParams(window.location.search);
    return parseInt(queryParams.get('page')) || 1;
  };

  useEffect(() => {
    const currentPage = getPageFromUrl();
    const storedData = JSON.parse(localStorage.getItem('paginationData')) || {};
    const storedItems = storedData[`items-page-${currentPage}`];
    const storedLastEvaluatedKey = storedData[`lastEvaluatedKey-page-${currentPage}`];

    if (storedItems && storedLastEvaluatedKey !== undefined) {
      setItems(storedItems);
      setTotalPages(storedData.totalPages);
      setLastEvaluatedKey(storedLastEvaluatedKey);
    } else {
      fetchItems(currentPage);
    }
  }, []); // Este useEffect se ejecuta solo una vez al montar el componente

  const handlePageChange = (newPage) => {
    let newPageNum = page;
    if (newPage === 'prev' && page > 1) {
      newPageNum = page - 1;
    } else if (newPage === 'next' && page < totalPages) {
      newPageNum = page + 1;
    } else if (typeof newPage === 'number') {
      newPageNum = newPage;
    }

    const newUrl = `/?page=${newPageNum}`;
    window.history.pushState({ path: newUrl }, '', newUrl);
    setPage(newPageNum);

    const storedData = JSON.parse(localStorage.getItem('paginationData')) || {};
    const storedItems = storedData[`items-page-${newPageNum}`];
    const storedLastEvaluatedKey = storedData[`lastEvaluatedKey-page-${newPageNum}`];

    if (storedItems && storedLastEvaluatedKey !== undefined) {
      setItems(storedItems);
      setTotalPages(storedData.totalPages);
      setLastEvaluatedKey(storedLastEvaluatedKey);
    } else {
      fetchItems(newPageNum);
    }
  };

  const components = {
    Header() {
      const { tokens } = useTheme();
      return (
        <View
          textAlign="center"
          padding={tokens.space.large}
          backgroundColor={tokens.colors.background.primary}
        >
          <Image
            alt="SmartTrackApp"
            src="https://i.postimg.cc/BnyPBXs8/2-YURCjl-Imgur.png"
            style={{ width: "100%", height: "100%" }}
          />
        </View>
      );
    },

    SignIn: {
      Header() {
        const { tokens } = useTheme();
        return (
          <Heading
            padding={`${tokens.space.xl} 0`}
            level={3}
            color={tokens.colors.font}
            style={{ backgroundColor: tokens.colors.background.secondary }}
            textAlign="center"
          >
            Sign in to your account
          </Heading>
        );
      },
      Footer() {
        const { toForgotPassword } = useAuthenticator();
        const { tokens } = useTheme();
        return (
          <View textAlign="center" padding={tokens.space.large}>
            <Button
              fontWeight="normal"
              onClick={toForgotPassword}
              size="small"
              variation="link"
            >
              Forgot Password?
            </Button>
          </View>
        );
      },
    },
  };

  return (
    <Router>
      <Authenticator signUpAttributes={["email"]} components={components}>
        <UserProvider>
        <CartProvider>
        {/* <ChildComponent /> */}
        <Navbar onSearch={searchItems} />
        <div className="container mt-4">
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <TestComponent></TestComponent>
                  <ItemList items={items} deleteItem={deleteItem} />
                  <Pagination onPageChange={handlePageChange} />
                  <ItemForm
                    newItemName={newItemName}
                    setNewItemName={setNewItemName}
                    newItemPricePerUnit={newItemPricePerUnit}
                    setNewItemPricePerUnit={setNewItemPricePerUnit}
                    newItemTotalPrice={newItemTotalPrice}
                    setNewItemTotalPrice={setNewItemTotalPrice}
                    newItemImageUrl={newItemImageUrl}
                    setNewItemImageUrl={setNewItemImageUrl}
                    handleFormSubmit={handleFormSubmit}
                  />
                  <UploadFile />
                  <ScrapingFormA />
                  <ScrapingFormH />
                </>
              }
            />
            <Route path="/item/:id" element={<ItemDetail />} />
          </Routes>
        </div>
        </CartProvider>
      </UserProvider>
      </Authenticator>
    </Router>
    
  );
};

export default App;
