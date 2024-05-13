import React, { useState, useEffect } from "react";
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
import ChildComponent from "./ChildComponent";
Amplify.configure(awsExports);


const App = () => {
  const {
    items,
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
    fetchItems,
  } = useItems();

  useEffect(() => {
    fetchItems();
  }, [page]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
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
            style={{width:"100%", height: "100%" }}
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

  console.log("Pagination props in App:", { page, totalPages });
  
  return (
    <Router>
      <Authenticator signUpAttributes={["email"]} components={components}>
        <ChildComponent fetchItems={fetchItems} />
        <Navbar onSearch={searchItems} />
        <div className="container mt-4">
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <ItemList items={items} deleteItem={deleteItem} />
                  <Pagination
                    page={page}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
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
      </Authenticator>
    </Router>
  );
};

export default App;
