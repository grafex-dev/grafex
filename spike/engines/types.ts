export interface BrowserEngine {
  name: string;
  launch(): Promise<void>;
  render(html: string, viewport: { width: number; height: number }): Promise<Buffer>;
  close(): Promise<void>;
  getPid(): number | undefined;
}
