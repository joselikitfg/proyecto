import React from 'react';
import { useUser } from '../contexts/UserContext';
import { useCart } from '../contexts/CartContext';
import './TestComponent.css'; // Import the CSS file

const TestComponent = () => {
    const { state: userState } = useUser();
    const { state: cartState, dispatch: cartDispatch } = useCart();

    const addItemToCart = () => {
        cartDispatch({ type: 'ADD_ITEM', payload: { id: 1, name: 'Sample Item' } });
    };

    return (
        <div className="test-component">
            {userState.user ? (
                <div>
                    {JSON.stringify(userState.user)}
                    <h2>User Groups:</h2>
                    <ul>
                        {userState.user.groups.map((group, index) => (
                            <li key={index}>{group}</li>
                        ))}
                    </ul>
                </div>
            ) : (
                <div>Loading user information...</div>
            )}

            <div>
                <h2>Cart Items:</h2>
                <ul>
                    {cartState.items.map((item, index) => (
                        <li key={index}>{item.name}</li>
                    ))}
                </ul>
                <button onClick={addItemToCart}>Add Item</button>
            </div>
        </div>
    );
};

export default TestComponent;
