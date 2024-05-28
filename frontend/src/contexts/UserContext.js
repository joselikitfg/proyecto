import React, { createContext, useReducer, useContext, useEffect, useState } from 'react';
import { fetchAuthSession, getCurrentUser, signOut as amplifySignOut } from '@aws-amplify/auth';
import { useNavigate } from 'react-router-dom';
import { cognitoUserPoolsTokenProvider } from 'aws-amplify/auth/cognito'

const UserContext = createContext();

const userReducer = (state, action) => {
    switch (action.type) {
        case 'SET_USER':
            return { ...state, user: action.payload, loading: false };
        case 'CLEAR_USER':
            return { ...state, user: null, loading: false };
        case 'SIGN_OUT':
            return { ...state, user: null, loading: false };
        default:
            return state;
    }
};

const UserProvider = ({ children }) => {
    const [state, dispatch] = useReducer(userReducer, { user: null, loading: true });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const session = await fetchAuthSession();
                const user = await getCurrentUser();
                const groups = session.tokens.accessToken.payload["cognito:groups"];
                const username = user.username;
                const email = session.tokens.idToken.payload["email"];

                dispatch({
                    type: 'SET_USER',
                    payload: { groups, username, email },
                });
            } catch (error) {
                console.error('Error fetching user session:', error);
                dispatch({ type: 'CLEAR_USER' });
            }
        };

        fetchUser();
    }, []);

    const signOut = async () => {
        try {
            await amplifySignOut();
            localStorage.clear(); // Clear all items in localStorage
            dispatch({ type: 'SIGN_OUT' });
            navigate('/'); // Redirect to the home page
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <UserContext.Provider value={{ state, dispatch, signOut }}>
            {children}
        </UserContext.Provider>
    );
};

const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};

export { UserProvider, useUser };
