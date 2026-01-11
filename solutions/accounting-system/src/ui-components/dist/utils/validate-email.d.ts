export interface EmailValidationOptions {
    allowDisplayName?: boolean;
    requireDisplayName?: boolean;
    allowUtf8LocalPart?: boolean;
    requireTld?: boolean;
}
export declare function validateEmail(email: string, options?: EmailValidationOptions): boolean;
export declare function normalizeEmail(email: string): string;
export declare function extractDomain(email: string): string | null;
export declare function isDisposableEmail(email: string): boolean;
export declare function isCorporateEmail(email: string): boolean;
export declare function suggestEmailCorrection(email: string): string[];
//# sourceMappingURL=validate-email.d.ts.map