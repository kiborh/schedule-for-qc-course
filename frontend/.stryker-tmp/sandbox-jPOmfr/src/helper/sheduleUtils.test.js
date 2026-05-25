// @ts-nocheck
import React from 'react';
import { render, screen } from '@testing-library/react';
import { filterClassesArray, isNotReadySchedule, getScheduleByType } from './sheduleUtils';

// 🛑 Жорстко блокуємо реальний файл src/i18n.js, щоб він не викликав помилку .use()
jest.mock('../i18n', () => ({
  __esModule: true,
  default: { t: (key) => key },
  t: (key) => key,
}));

// Після моку i18n можемо безпечно імпортувати наш компонент
import { getHref } from './getHref';

// Заглушка для константи, якщо вона глобальна або передається ззовні
global.COMMON_LINK_TO_MEETING_WORD = 'Meeting Link';

describe('sheduleUtils helpers', () => {
    
    describe('getScheduleByType', () => {
        test('returns an empty object', () => {
            const result = getScheduleByType(1, 2);
            expect(result).toBeInstanceOf(Object);
            expect(Object.keys(result)).toHaveLength(0);
        });
    });

    describe('isNotReadySchedule', () => {
        test('returns false for an empty schedule when loading is true', () => {
            expect(isNotReadySchedule({}, true)).toBe(false);
        });

        test('returns true for an empty schedule when loading is false', () => {
            expect(isNotReadySchedule({}, false)).toBe(true);
        });

        test('returns false for a non-empty schedule', () => {
            expect(isNotReadySchedule({ days: ['Monday'] }, false)).toBe(false);
        });

        test('treats a null schedule as not ready when loading is false', () => {
            expect(isNotReadySchedule(null, false)).toBe(true);
        });
    });

    describe('filterClassesArray', () => {
        test('removes duplicate items with the same id', () => {
            const inputArray = [
                { id: 1, name: 'Mathematics' },
                { id: 2, name: 'Physics' },
                { id: 1, name: 'Mathematics duplicate' },
            ];
            const expectedArray = [
                { id: 1, name: 'Mathematics' },
                { id: 2, name: 'Physics' },
            ];
            const result = filterClassesArray(inputArray);
            expect(result).toEqual(expectedArray);
        });

        test('returns a NEW empty array for an empty input array', () => {
            const inputArray = [];
            const result = filterClassesArray(inputArray);
            expect(result).toEqual([]);
            expect(result).not.toBe(inputArray); 
        });

        test('returns an empty array for null input', () => {
            expect(filterClassesArray(null)).toEqual([]);
        });

        test('returns an empty array for invalid non-array inputs', () => {
            expect(filterClassesArray(undefined)).toEqual([]);
            expect(filterClassesArray({})).toEqual([]);
            expect(filterClassesArray('string')).toEqual([]);
        });

        test('returns the same items when the array is already unique', () => {
            const inputArray = [
                { id: 10, name: 'History' },
                { id: 11, name: 'Biology' },
            ];
            const result = filterClassesArray(inputArray);
            expect(result).toEqual(inputArray);
        });
    });
});

// ==========================================
// ТЕСТИ ДЛЯ GET-HREF
// ==========================================
describe('getHref helper', () => {
    describe('normalizeLink логіка', () => {
        test('returns null for empty, string-space, or non-existent links', () => {
            expect(getHref('')).toBeNull();
            expect(getHref('   ')).toBeNull();
            expect(getHref(null)).toBeNull();
            expect(getHref(undefined)).toBeNull();
        });

        test('keeps original link if it starts with http:// or https://', () => {
            const element1 = getHref('https://zoom.us/j/123');
            render(element1);
            expect(screen.getByRole('link')).toHaveAttribute('href', 'https://zoom.us/j/123');

            document.body.innerHTML = '';
            
            const element2 = getHref('http://teams.microsoft.com');
            render(element2);
            expect(screen.getByRole('link')).toHaveAttribute('href', 'http://teams.microsoft.com');

            document.body.innerHTML = '';

            const element3 = getHref('HTTPS://MY-LINK.COM');
            render(element3);
            expect(screen.getByRole('link')).toHaveAttribute('href', 'HTTPS://MY-LINK.COM');
        });

        test('adds https:// prefix if it is missing', () => {
            document.body.innerHTML = '';
            render(getHref('