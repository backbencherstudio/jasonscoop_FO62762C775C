export interface IPaymentMethod {
  id?: string;
  number?: string;
  name?: string;
  expiry_date?: string;
  // exp_month?: number;
  // exp_year?: number;
  cvc?: string;
}

export interface ICoupon {
  code: string;
}

export class CreateCheckoutDto {}
