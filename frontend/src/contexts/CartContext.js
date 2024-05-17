import React, { createContext, useReducer, useContext, useEffect } from 'react';

const CartContext = createContext();

const cartReducer = (state, action) => {
    switch (action.type) {
        case 'ADD_ITEM':
            const updatedItemsAdd = [...state.items, action.payload];
            localStorage.setItem('cartItems', JSON.stringify(updatedItemsAdd));
            return { ...state, items: updatedItemsAdd };
        case 'REMOVE_ITEM':
            const updatedItemsRemove = state.items.filter(item => item.id !== action.payload.id);
            localStorage.setItem('cartItems', JSON.stringify(updatedItemsRemove));
            return { ...state, items: updatedItemsRemove };
        case 'SET_ITEMS':
            return { ...state, items: action.payload };
        case 'CLEAR_ALL_ITEMS':
            localStorage.removeItem('cartItems');
            return { ...state, items: [] };
        default:
            return state;
    }
};

const CartProvider = ({ children }) => {
    const [state, dispatch] = useReducer(cartReducer, { items: [] });

    useEffect(() => {
        const storedItems = JSON.parse(localStorage.getItem('cartItems')) || [];
        dispatch({ type: 'SET_ITEMS', payload: storedItems });
    }, []);

    return (
        <CartContext.Provider value={{ state, dispatch }}>
            {children}
        </CartContext.Provider>
    );
};

const useCart = () => {
    return useContext(CartContext);
};

export { CartProvider, useCart };
