import { IBudgetRow, IRowTree } from '../model/budget-row.model';
import _ from 'lodash';

/**
 * Migrates flat IBudgetRow[] data to a hierarchical IRowTree[] structure.
 * @param {IBudgetRow[]} rawRows - The flat array of budget rows.
 * @returns {IRowTree[]} - The hierarchical tree structure.
 */
export function migrateBudgetRowsToTree1(rawRows: IBudgetRow[]): IRowTree[] {
    // Group by parentCategoryId (0: Income, 1: Expenses)
    const groupedByParent = _.groupBy(rawRows, 'parentCategoryId');

    // Group by typeId within each parent group
    function buildTree(parentCategoryId: number, parentName: string): IRowTree {
        const parentId = `${parentCategoryId + 1}`;
        const typeGroups = _.groupBy(groupedByParent[parentCategoryId] || [], 'typeId');
        const children: IRowTree[] = Object.entries(typeGroups).map(([typeId, items], parentIndex) => ({
            id: `${parentId}_${parentIndex + 1}`,
            name: typeId,
            renamable: false,
            checked: false,
            totals: [],
            children: (items as IBudgetRow[]).map((child, childIndex) => ({
                id: `${parentId}_${parentIndex + 1}_${childIndex + 1}`,
                name: child.name,
                renamable: false,
                checked: false,
                values: child.values,
                totals: child.totals ?? []
            }))
        }));

        return {
            id: parentId,
            name: parentName,
            renamable: false,
            checked: false,
            totals: [],
            children
        };
    }

    // Build the tree for Income and Expenses
    const tree: IRowTree[] = [
        buildTree(0, 'Income'),
        buildTree(1, 'Expenses')
    ];

    return tree;
}

export function migrateBudgetRowsToTree(rawRows: IBudgetRow[]): IRowTree[] {
    function buildChildren(parentCategoryId: number, parentId: string): IRowTree[] {
        // 1. Children trực tiếp (không có typeId)
        const directChildren = rawRows
            .filter(row => row.parentCategoryId === parentCategoryId && !row.typeId)
            .map((row, idx) => ({
                id: `${parentId}_${idx + 1}`,
                name: row.name,
                renamable: false,
                checked: false,
                totals: row.totals || [],
                values: row.values || [],
            }));

        // 2. Group các row có typeId theo typeId (ví dụ: Others, Salaries & Wages)
        const typeGroups = rawRows
            .filter(row => row.parentCategoryId === parentCategoryId && !!row.typeId)
            .reduce((acc, row) => {
                acc[row.typeId!] = acc[row.typeId!] || [];
                acc[row.typeId!].push(row);
                return acc;
            }, {} as Record<string, IBudgetRow[]>);

        // 3. Tạo node cha cho từng typeId group
        const typeNodes = Object.entries(typeGroups).map(([typeName, items], idx) => ({
            id: `${parentId}_${directChildren.length + idx + 1}`,
            name: typeName,
            renamable: false,
            checked: false,
            totals: [],
            children: items.map((row, subIdx) => ({
                id: `${parentId}_${directChildren.length + idx + 1}_${subIdx + 1}`,
                name: row.name,
                renamable: false,
                checked: false,
                totals: row.totals || [],
                values: row.values || [],
            }))
        }));

        return [...directChildren, ...typeNodes];
    }

    return [
        {
            id: '1',
            name: 'Income',
            renamable: false,
            checked: false,
            totals: [],
            children: buildChildren(0, '1'),
        },
        {
            id: '2',
            name: 'Expenses',
            renamable: false,
            checked: false,
            totals: [],
            children: buildChildren(1, '2'),
        }
    ];
}
