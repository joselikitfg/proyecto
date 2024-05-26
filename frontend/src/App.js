import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ItemList from "./components/ItemList";
import ItemDetail from "./components/ItemDetail";
import ItemForm from "./components/ItemForm";
import UploadFile from "./components/UploadFile";

import Pagination from "./components/Pagination";
import useItems from "./useItems";
import ScrapingFormA from "./components/ScrapingForm";
import ScrapingFormH from "./components/ScrapingFormH";

import { Amplify } from "aws-amplify";
import { awsExports } from "./aws-exports";
import Navbar from "./components/Navbar/Navbar";
import "bootstrap/dist/css/bootstrap.min.css";
import GuestComponent from './components/RolesComponents/GuestComponent';
import UserComponent from './components/RolesComponents/UserComponent';
import AdminComponent from './components/RolesComponents/AdminComponent';
import ProtectedRoute from './components/RolesComponents/ProtectedRoute';
import { AuthComponents } from "./AuthComponents";
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

import { UserProvider, useUser } from './contexts/UserContext';  
import { CartProvider } from './contexts/CartContext';
import TestComponent from "./components/TestComponent";
import RoleBasedRedirect from "./components/RoleBasedRedirect";
import Loading from "./components/Loading";
import UserDetails from "./components/UserDetails";

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
    error,
    nextToken,
    setNextToken,
  } = useItems();

  const getPageFromUrl = () => {
    const queryParams = new URLSearchParams(window.location.search);
    return parseInt(queryParams.get("page")) || 1;
  };

  useEffect(() => {
    const currentPage = getPageFromUrl();
    setPage(currentPage);
    if (!searchTerm) {
      fetchItems(currentPage);
    } else {
      fetchItems(currentPage, searchTerm);
    }
  }, []);


  const AppContent = () => {
    const { loading, state } = useUser();
  
    if (loading) {
      return <Loading />;
    }
  
    return (
      <>
        <Navbar />
        <div className="container mt-4">
          <Routes>
            {console.debug(state.user)}
            {state.user?.groups.includes('User') &&
                <Route
              path="/user"
              element={
                <ProtectedRoute allowedRoles={['User']}>
                  <UserComponent />
                </ProtectedRoute>
              }
            />}
            {state.user?.groups.includes('User') &&
                <Route
              path="/item/:pname"
              element={
                <ProtectedRoute allowedRoles={['User']}>
                  <ItemDetail/>
                </ProtectedRoute>
              }
            />}
            {state.user?.groups.includes('Admin') && <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <AdminComponent />
                </ProtectedRoute>
              }
            />
            }

            {state.user?.groups.includes('Guest') && <Route path="/" element={<GuestComponent />} /> }

            { state.user && <Route path="/user-details" element={<UserDetails />} /> }
            
          </Routes>
        </div>
      </>
    );
  };
  
    return (
      <Router>
        <Authenticator signUpAttributes={['email']} components={AuthComponents}>
          <UserProvider>
            <CartProvider>
              <RoleBasedRedirect />
              <AppContent />
            </CartProvider>
          </UserProvider>
        </Authenticator>
      </Router>
    )
}

export default App;
