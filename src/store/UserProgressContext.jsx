import { createContext, useState } from "react";
import Cart from "../components/Cart";

const UserProgressContext = createContext({
  progress: "",
  showCart: () => {},
  hideCart: () => {},
  showCheckout: () => {},
  hideCheckOut: () => {},
});

export function UserProgressContextProvider({ children }) {
    const [userProgress, setUserProgress] = useState('');

    function showCart(){
        setUserProgress('cart');
    };
    function hideCart(){
        setUserProgress('');
    };
    function showCheckout(){
        setUserProgress('checkout');
    };
    function hideCheckOut(){
        setUserProgress('');
    };

    const userProgressCtx = {
        progress: userProgress,
        showCart,
        hideCart,
        showCheckout,
        hideCheckOut
    };

  return(
  <UserProgressContext.Provider value={userProgressCtx}>{children}</UserProgressContext.Provider>
);
}

export default UserProgressContext;
