import React, { createContext, useReducer, useContext, useEffect } from 'react';
import { fetchAuthSession, getCurrentUser, signOut as amplifySignOut } from '@aws-amplify/auth';

const UserContext = createContext();

const userReducer = (state, action) => {
    switch (action.type) {
        case 'SET_USER':
            return { ...state, user: action.payload };
        case 'CLEAR_USER':
            return { ...state, user: null };
        case 'SIGN_OUT':
            return { ...state, user: null };
        default:
            return state;
    }
};

const UserProvider = ({ children }) => {
    const [state, dispatch] = useReducer(userReducer, { user: null });

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
    return useContext(UserContext);
};

export { UserProvider, useUser };
