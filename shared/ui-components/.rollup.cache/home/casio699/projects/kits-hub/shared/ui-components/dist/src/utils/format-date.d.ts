export interface DateFormatOptions {
    locale?: string;
    dateStyle?: 'full' | 'long' | 'medium' | 'short';
    timeStyle?: 'full' | 'long' | 'medium' | 'short';
    timeZone?: string;
}
export declare function formatDate(date: Date | string | number, options?: DateFormatOptions): string;
export declare function formatRelativeTime(date: Date | string | number, _locale?: string): string;
export declare function formatDateTime(date: Date | string | number, options?: DateFormatOptions): string;
export declare function formatDateShort(date: Date | string | number, locale?: string): string;
export declare function isDateValid(date: Date | string | number): boolean;
export declare function addDays(date: Date, days: number): Date;
export declare function addMonths(date: Date, months: number): Date;
export declare function addYears(date: Date, years: number): Date;
export declare function startOfDay(date: Date): Date;
export declare function endOfDay(date: Date): Date;
export declare function isToday(date: Date): boolean;
export declare function isYesterday(date: Date): boolean;
export declare function isTomorrow(date: Date): boolean;
//# sourceMappingURL=format-date.d.ts.map