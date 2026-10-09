export type EcommerceItem = {
  item_id: string;
  item_name: string;
  price: number;
  quantity?: number;
  item_category?: string;
};

export type EcommerceEventMap = {
  view_item: { currency: string; value: number; items: EcommerceItem[] };
  add_to_cart: { currency: string; value: number; items: EcommerceItem[] };
  begin_checkout: { currency: string; value: number; items: EcommerceItem[] };
  purchase: {
    transaction_id: string;
    currency: string;
    value: number;
    items: EcommerceItem[];
    tax?: number;
    shipping?: number;
  };
};

export type AnalyticsEvent = keyof EcommerceEventMap;
