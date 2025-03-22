import { Gallery } from "./gallery.model";

export interface Enrollee {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  compositeKey: string;
}

export interface CartItems {
  events: {
   //_id: string,
    eventId: string; 
    name: string;
    date: string;
    price: number;
    location: string;
    images: Gallery[];
    enrollees: { firstName: string; lastName: string; email: string; phone: string }[];
  }[];
  products: {
    //_id: string,
    productId: string; 
    name: string;
    price: number;
    images: string[];
    quantity: number;
  }[];
}

/* export interface FlattenedCartItem {
  events: {
    _id: string;
    eventId: string;
    name: string;
    date: string;
    price: number;
    location: string;
    images: Gallery[];
    quantity: number;
    enrollees: { firstName: string; lastName: string; email: string; phone: string }[];
  }[];
  products: {
    _id: string;
    productId: string;
    name: string;
    price: number;
    images: string[];
    quantity: number;
  }[];
} */

export interface CartVerificationResult {
  validItems: {
    events: {
      _id: string;
      eventId: string; 
      name: string;
      date: string;
      price: number; 
      pricePaid: number;
      location: string;
      images: Gallery[];
      enrollees: { firstName: string; lastName: string; email: string; phone: string }[];
    }[];
    products: {
      _id: string;
      productId: string;
      name: string;
      price: number;
      pricePaid: number;
      images: string[];
      quantity: number;
    }[];
  };
  invalidItems: { 
    item: { 
      _id?: string;
      id?: string;
      name?: string;
    }; 
    reason: string 
  }[];
  totalPrice: number;
  salesTax: number;
  shipping: number;
  shippingRate: number;
  taxRate: number;
}

export interface PayPalOrderDetails {
  id: string;
  status: string;
  purchase_units: {
    amount: {
      currency_code: string;
      value: string;
    };
    shipping: {
      name: { full_name: string };
      address: {
        address_line_1: string;
        admin_area_2: string;
        admin_area_1: string;
        postal_code: string;
        country_code: string;
      };
    };
  }[];
  payer: {
    name: { given_name: string; surname: string };
    email_address: string;
  };
  create_time: string;
}

export interface OrderDetails {
  orderDetails: any; // PayPal response
  items: { events: any[], products: any[] }[];
  email: string;
  shippingAddress: { street: string, city: string, postalCode: string, country: string };
}

export interface CartResponse {
  cartId: string;
  items: CartItems;
  removedItems?: any[];
}

export interface Order {
  _id: string;
  orderNumber: string;
  cartId: string;
  userId?: string;
  email: string;
  items: {
    events: { eventId: string | EventRef; pricePaid: number; enrollees: { firstName: string; lastName: string; email: string; phone: string }[] }[];
    products: { productId: string | ProductRef; quantity: number; pricePaid: number }[];
  }[];
  shippingAddress?: { 
    fullName: string;
    street1: string;
    street2: string; 
    city: string;
    state: string; 
    zip: string; 
    country: string };
  paymentId: string;
  total: number;
  salesTax: number;
  shipping: number;
  taxRate: number;
  shippingRate: number;
  date: string;
  status: 'pending' | 'completed' | 'canceled';
  trackingNumber?: string;
  carrier?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventRef {
  _id: string;
  name: string;
  location?: string;
  date?: string;
  [key: string]: any; // Allow extra fields from population
}

export interface ProductRef {
  _id: string; // Backend uses _id, not id, for MongoDB docs
  name: string;
  [key: string]: any; // Allow extra fields
}

export interface Address {
  fullName?: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}