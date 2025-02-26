export interface Enrollee {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  compositeKey: string;
}

export interface CartItem {
  type: 'event' | 'product';
  eventId?: string;
  productId?: string;
  enrollees?: { firstName: string; lastName: string; email: string; phone: string }[];
  quantity: number;
  event?: { id: string; name: string; date: string; price: number; location: string };
  product?: { id: string; name: string; price: number };
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

export interface Product {

}