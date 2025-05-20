// Define more specific return types
export interface CloudinaryResourcesResponse {
  resources: unknown[];
  next_cursor?: string;
  rate_limit_allowed?: number;
  rate_limit_reset_at?: string;
  rate_limit_remaining?: number;
}
