import { IBudgetRow, IRowTree } from '../model/budget-row.model';
import _ from 'lodash';

/**
 * Migrates flat IBudgetRow[] data to a hierarchical IRowTree[] structure.
 * @param {IBudgetRow[]} rawRows - The flat array of budget rows.
 * @returns {IRowTree[]} - The hierarchical tree structure.
 */
export function migrateBudgetRowsToTree(rawRows: IBudgetRow[]): IRowTree[] {
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
