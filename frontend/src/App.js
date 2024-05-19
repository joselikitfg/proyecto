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
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import ChildComponent from "./ChildComponent";
import { AuthComponents } from "./AuthComponents";

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
    searchTerm,
  } = useItems();

  const getPageFromUrl = () => {
    const queryParams = new URLSearchParams(window.location.search);
    return parseInt(queryParams.get("page")) || 1;
  };

  useEffect(() => {
    const currentPage = getPageFromUrl();
    if (!searchTerm) {
      localStorage.removeItem("paginationData");
      fetchItems(currentPage);
    } else {
      fetchItems(currentPage, searchTerm);
    }
  }, [searchTerm]);

  return (
    <Router>
      <Authenticator signUpAttributes={["email"]} components={AuthComponents}>
        <ChildComponent />
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
                    searchTerm={searchTerm}
                    setPage={setPage}
                    setItems={setItems}
                    setTotalPages={setTotalPages}
                    setLastEvaluatedKey={setLastEvaluatedKey}
                    fetchItems={fetchItems}
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
            <Route path="/item/:pname" element={<ItemDetail />} />
          </Routes>
        </div>
      </Authenticator>
    </Router>
  );
};

export default App;
