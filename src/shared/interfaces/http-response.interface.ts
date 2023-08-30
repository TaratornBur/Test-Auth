/* eslint-disable prettier/prettier */
export interface HttpResponse {
  statusCode: number;
  message: string;
  data?: any;

  // Error Handle
  error?: any;

  // Pagination
  totalCount?: number;
  page?: number;
  perPage?: number;
}
