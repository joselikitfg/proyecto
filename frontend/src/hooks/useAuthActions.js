import { useAuthenticator } from "@aws-amplify/ui-react";
import { useUser } from '../contexts/UserContext';
import { useCart } from '../contexts/CartContext';

export const useAuthActions = () => {
  const { signOut } = useAuthenticator();
  const { state: userState, dispatch: userDispatch } = useUser();
  const { state: cartState, dispatch: cartDispatch } = useCart();

  const myCustomSignOutHandler = async () => {
    try {
      userDispatch({ type: 'SIGN_OUT' });
      cartDispatch({ type: 'CLEAR_ALL_ITEMS' });
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return { myCustomSignOutHandler };
};
