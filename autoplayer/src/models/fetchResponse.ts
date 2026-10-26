export interface FetchResponse {
  ok: boolean;
  status: number;
  text(): Promise<string>;
}
