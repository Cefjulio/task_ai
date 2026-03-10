export interface IStorageService {
    getItem: (name: string) => any | Promise<any>;
    setItem: (name: string, value: any) => void | Promise<void>;
    removeItem: (name: string) => void | Promise<void>;
}
