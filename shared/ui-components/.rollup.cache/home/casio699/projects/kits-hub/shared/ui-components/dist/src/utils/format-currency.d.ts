export interface CurrencyFormatOptions {
    locale?: string;
    currency?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
}
export declare function formatCurrency(amount: number, options?: CurrencyFormatOptions): string;
export declare function parseCurrency(value: string, locale?: string): number;
export declare function getCurrencySymbol(currency: string, locale?: string): string;
export declare const currencyConfigs: {
    USD: {
        locale: string;
        currency: string;
    };
    EUR: {
        locale: string;
        currency: string;
    };
    GBP: {
        locale: string;
        currency: string;
    };
    JPY: {
        locale: string;
        currency: string;
        minimumFractionDigits: number;
    };
    CNY: {
        locale: string;
        currency: string;
    };
    INR: {
        locale: string;
        currency: string;
    };
    CAD: {
        locale: string;
        currency: string;
    };
    AUD: {
        locale: string;
        currency: string;
    };
};
export declare function formatCurrencyByCode(amount: number, currencyCode?: keyof typeof currencyConfigs): string;
//# sourceMappingURL=format-currency.d.ts.map