import { Gallery } from "./gallery.model";

export interface Enrollee {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  compositeKey: string;
}

export interface CartItem {
  events?: {
    eventId: string;
    quantity: number;
    enrollees: { firstName: string; lastName: string; email: string; phone: string }[];
    event?: { id: string; name: string; date: string; price: number; location: string; images?: Gallery[] };
  }[];
  products?: {
    productId: string;
    quantity: number;
    product?: { id: string; name: string; price: number; images?: string[] };
  }[];
}

export interface FlattenedCartItem {
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
}

export interface CartVerificationResult {
  validItems: FlattenedCartItem[];
  invalidItems: { item: FlattenedCartItem; reason: string }[];
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
  orderDetails: PayPalOrderDetails;
  cartContents: CartItem[];
}

export interface CartResponse {
  cartId: string;
  items: FlattenedCartItem[];
  removedItems?: any[];
}