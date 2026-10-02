export const ORDER_STATUSES = [
  "جديد",
  "تم التأكيد",
  "قيد التوصيل",
  "مكتمل",
  "ملغي",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type Order = {
  id: string;
  createdAt: string;
  name: string;
  phone: string;
  city: string;
  size: string;
  status: OrderStatus;
};
