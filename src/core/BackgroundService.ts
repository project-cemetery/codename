export interface BackgroundService {
  onStart: () => Promise<void>;
}
