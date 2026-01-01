declare module 'secure-web-storage' {
  class SecureStorage {
    constructor(
      storage: Storage,
      options: {
        hash: (key: string) => string;
        encrypt: (data: string) => string;
        decrypt: (data: string) => string;
      }
    );

    setItem(key: string, value: string): void;
    getItem(key: string): string | null;
    removeItem(key: string): void;
    clear(): void;
    key(index: number): string | null;
    readonly length: number;
  }

  export default SecureStorage;
}
