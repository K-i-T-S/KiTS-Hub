export interface BarcodeOptions {
    width?: number;
    height?: number;
    format?: 'CODE128' | 'CODE39' | 'EAN13' | 'EAN8' | 'UPC';
    displayValue?: boolean;
    background?: string;
    lineColor?: string;
    fontSize?: number;
    margin?: number;
}
export declare function generateBarcodeSVG(value: string, options?: BarcodeOptions): string;
export declare function generateBarcodeDataURL(value: string, options?: BarcodeOptions): string;
export declare function downloadBarcode(value: string, filename?: string, options?: BarcodeOptions): void;
export declare function validateBarcode(value: string, format: string): boolean;
export declare function calculateChecksum(value: string, format: string): number;
export declare const barcodeTypes: {
    CODE128: {
        name: string;
        description: string;
        maxLength: number;
        supportedChars: string;
    };
    CODE39: {
        name: string;
        description: string;
        maxLength: number;
        supportedChars: string;
    };
    EAN13: {
        name: string;
        description: string;
        maxLength: number;
        supportedChars: string;
    };
    EAN8: {
        name: string;
        description: string;
        maxLength: number;
        supportedChars: string;
    };
    UPC: {
        name: string;
        description: string;
        maxLength: number;
        supportedChars: string;
    };
};
//# sourceMappingURL=generate-barcode.d.ts.map