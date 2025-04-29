export interface IBudgetRow {
    id: number;
    name: string;
    typeId?: string;
    parentCategoryId?: number; // 0 is Income, 1 is Expenses
    values?: number[];
    totals?: number[];
}

export interface IRowTree {
    id: string;
    name: string;
    renamable: boolean;
    checked: boolean;
    totals: number[];
    values?: number[]; // only valid for last level
    operation?: 'sum' | 'subtract';
    children?: IRowTree[]; // valid for parent level
}

export const RawBudgetData: IBudgetRow[] = [
    {
        id: 0,
        name: 'General Income',
        parentCategoryId: 0,
        values: [],
        totals: []
    },
    {
        id: 1,
        name: 'Sales',
        parentCategoryId: 0,
        values: [],
        totals: []
    },
    {
        id: 2,
        name: 'Commission',
        parentCategoryId: 0,
        values: [],
        totals: []
    },
    {
        id: 3,
        name: 'Training',
        typeId: 'Others',
        parentCategoryId: 0,
        values: [],
        totals: []
    },
    {
        id: 4,
        name: 'Consulting',
        typeId: 'Others',
        parentCategoryId: 0,
        values: [],
        totals: []
    },
    {
        id: 5,
        name: 'Operational Expenses',
        parentCategoryId: 1,
        values: [],
        totals: []
    },
    {
        id: 6,
        name: 'Management Fees',
        parentCategoryId: 1,
        values: [],
        totals: []
    },
    {
        id: 7,
        name: 'Cloud Hosting',
        parentCategoryId: 1,
        values: [],
        totals: []
    },
    {
        id: 8,
        name: 'Full Time Dev Salaries',
        typeId: 'Salaries & Wages',
        parentCategoryId: 1,
        values: [],
        totals: []
    },
    {
        id: 9,
        name: 'Part Time Dev Salaries',
        typeId: 'Salaries & Wages',
        parentCategoryId: 1,
        values: [],
        totals: []
    },
    {
        id: 10,
        name: 'Remote Salaries',
        typeId: 'Salaries & Wages',
        parentCategoryId: 1,
        values: [],
        totals: []
    },
];
