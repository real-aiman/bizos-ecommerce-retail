export interface BizosProduct {
  id: number;
  name: string;
  slug: string;
  regularPrice: number;
  productImageUrl: string;
  departmentId: number;
  departmentName: string;
  productMeasureUnitId: number;
  productMeasureUnitName: string;
  totalCount?: number;
  /** Optional enrichments. Rendered automatically when the API starts returning them. */
  description?: string;
  brand?: string;
  images?: string[];
  inStock?: boolean;
  /** Optional "was" price. Display only: the charged price is always regularPrice. */
  compareAtPrice?: number;
}

export interface ProductListResponse {
  lastId: number;
  pageNo: number;
  pageSize: number;
  totalCount: number;
  data: BizosProduct[];
}
