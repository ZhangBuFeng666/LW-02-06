import { createContext } from 'react';
import addressService from '../services/addressService';
import adminService from '../services/adminService';
import cartService from '../services/cartService';
import favoriteService from '../services/favoriteService';
import goodService from '../services/goodService';
import orderService from '../services/orderService';
import reviewService from '../services/reviewService';
import userService from '../services/userService';

const ServiceContext = createContext();

const ServiceProvider = ({ children }) => {
  const value = {
    address: addressService,
    admin: adminService,
    cart: cartService,
    favorite: favoriteService,
    good: goodService,
    order: orderService,
    review: reviewService,
    user: userService,
  };

  return <ServiceContext.Provider value={value}>{children}</ServiceContext.Provider>;
};

export { ServiceContext, ServiceProvider };
