export interface Ad {
  adId: string;
  message: string;
  reward: number;
  expiresIn: number;
  encrypted?: string | number;
  probability: string;
}
