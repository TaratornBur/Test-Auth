/* eslint-disable prettier/prettier */
export interface User {
  readonly _id: string;
  readonly username: string;
  readonly password: string;
  readonly name: string;
  readonly phone: string;
  //readonly role: string;
  readonly status: 'activate' | 'not_activate';
  readonly order_history_by_orderId?: string[];
}
