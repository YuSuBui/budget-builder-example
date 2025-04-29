import { AfterViewInit, Component, computed, Input, OnChanges, QueryList, signal, SimpleChanges, ViewChildren, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ToastModule } from 'primeng/toast';
import { CellInputComponent } from '../cell-input/cell-input.component';

export interface BudgetRows {
    id: number;
    name: string;
    totals: number[];
    renamed?: boolean;
    checked?: boolean;
    children?: BudgetRows[];
    values?: number[];
    operation?: 'sum' | 'subtract' | 'multiply' | 'divide';
}

const BudgetRows: BudgetRows[] = [
    {
        id: 0,
        name: 'parent',
        totals: [],
        renamed: false,
        checked: false,
        operation: 'subtract',
        children: [
            {
                id: 1,
                name: 'Income',
                renamed: false,
                checked: false,
                totals: [],
                operation: 'sum',
                children: [
                    {
                        id: 3,
                        name: 'General',
                        renamed: false,
                        checked: false,
                        totals: [],
                        children: [
                            {
                                id: 7,
                                name: 'General Income',
                                renamed: false,
                                checked: false,
                                totals: [],
                                values: []
                            },
                            {
                                id: 8,
                                name: 'Sales',
                                renamed: false,
                                checked: false,
                                totals: [],
                                values: []
                            },
                            {
                                id: 9,
                                name: 'Commission',
                                renamed: false,
                                checked: false,
                                totals:[],
                                values: []
                            },
                        ]
                    },
                    {
                        id: 4,
                        name: 'Others',
                        renamed: false,
                        checked: false,
                        totals: [],
                        children: [
                            {
                                id: 10,
                                name: 'Training',
                                renamed: false,
                                checked: false,
                                totals: [],
                                values: []
                            },
                            {
                                id: 11,
                                name: 'Consulting',
                                renamed: false,
                                checked: false,
                                totals: [],
                                values: []
                            }
                        ]
                    }
                ]
            },
            {
                id: 2,
                name: 'Expenses',
                renamed: false,
                checked: false,
                totals: [],
                operation: 'sum',
                children: [
                    {
                        id: 5,
                        name: 'Operational',
                        renamed: false,
                        checked: false,
                        totals: [],
                        children: [
                            {
                                id: 12,
                                name: 'Operational Expenses',
                                renamed: false,
                                checked: false,
                                totals: [],
                                values: []
                            },
                            {
                                id: 13,
                                name: 'Management Fees',
                                renamed: false,
                                checked: false,
                                totals: [],
                                values: []
                            },
                            {
                                id: 14,
                                name: 'Cloud Hosting',
                                renamed: false,
                                checked: false,
                                totals:[],
                                values: []
                            },
                        ]
                    },
                    {
                        id: 6,
                        name: 'Salaries & Wages',
                        renamed: false,
                        checked: false,
                        totals: [],
                        children: [
                            {
                                id: 15,
                                name: 'Full Time Dev Salaries',
                                renamed: false,
                                checked: false,
                                totals: [],
                                values: []
                            },
                            {
                                id: 16,
                                name: 'Part Time Dev Salaries',
                                renamed: false,
                                checked: false,
                                totals: [],
                                values: []
                            },
                            {
                                id: 17,
                                name: 'Remote Salaries',
                                renamed: false,
                                checked: false,
                                totals: [],
                                values: []
                            }
                        ]
                    }
                ]
            }
        ]
    }
];

@Component({
    selector: 'app-budget-table',
    standalone: true,
    imports: [CommonModule, FormsModule, ToastModule, ButtonModule, CheckboxModule, TooltipModule, ConfirmPopupModule, CellInputComponent],
    providers: [ConfirmationService, MessageService],
    templateUrl: './budget-table.component.html',
    styleUrl: './budget-table.component.css'
})
export class BudgetTableComponent implements OnChanges, AfterViewInit {
    @Input('startDate') startDate!: Date | undefined;
    @Input('endDate') endDate!: Date | undefined;
    startMonth = signal<Date>(new Date(2024, 0));
    endMonth = signal<Date>(new Date(2024, 11));
    data: WritableSignal<BudgetRows[]> = signal<BudgetRows[]>([]);
    @ViewChildren('cell') cellInputs!: QueryList<CellInputComponent>;
    @ViewChildren('renameCell') renameCells!: QueryList<CellInputComponent>;
    private timeout: number = 250;

    constructor(private confirmationService: ConfirmationService, private messageService: MessageService) {
        this.initializeDataRows(BudgetRows);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (!this.startDate || !this.endDate) return;
        this.startMonth.set(this.startDate);
        this.endMonth.set(this.endDate);
        const data = this.data();
        const values = Array(this.months().length).fill(0);
        this.setLeafValuesRecursively(data, values);
        this.updateTotalsRecursively(data);
        this.data.update((row) => (row));
        this.handleMessage('info', 'Updated', 'Date range changed.');
    }

    ngAfterViewInit() {
        const firstCell = this.cellInputs?.get(0);
        firstCell?.focus();

        this.cellInputs.changes.subscribe((inputs: QueryList<CellInputComponent>) => {
            setTimeout(() => inputs.get(0)?.focus(), this.timeout)
        });

        this.renameCells.changes.subscribe((inputs: QueryList<CellInputComponent>) => {
            setTimeout(() => inputs.get(0)?.focus(), this.timeout)
        });
    }

    readonly headlines = computed(() => {
        const start = this.startMonth().toLocaleString('default', { month: "2-digit", year: 'numeric' });
        const end = this.endMonth().toLocaleString('default', { month: "2-digit", year: 'numeric' });
        return `Start from: ${start} to: ${end}`;
    });

    readonly months = computed(() => {
        const months: string[] = [];
        const start = new Date(this.startMonth());
        const end = new Date(this.endMonth());

        while (start <= end) {
            const monthStr = start.toLocaleString('default', { month: "short", year: 'numeric' });
            months.push(monthStr);
            start.setMonth(start.getMonth() + 1);
        }
        return months;
    });

    trackById(index: number, item: BudgetRows): number {
        return item.id;
    }

    trackByIndex(index: number, item: any): number {
        return index;
    }

    /**
     * Handles the change event for a checkbox in the budget table.
     * Propagates the checked state to all child nodes recursively.
     *
     * @param {BudgetRows} row - The row whose checkbox state changed.
     * @param {boolean} checked - The new checked state.
     */
    onCheckBoxChange(row: BudgetRows, checked: boolean): void {
        console.log("onCheckBoxChange", row);
        if (row.children && row.children.length > 0) {
            row.children.forEach((child) => {
                child.checked = checked;
                this.onCheckBoxChange(child, checked);
            });
        }
    }

    /**
     * Moves focus to the next cell input in the table based on the current row and column index.
     *
     * @param {BudgetRows} row - The current row.
     * @param {number} [colIndex=0] - The current column index.
     */
    handleNextCell(row: BudgetRows, colIndex: number = 0): void {
        // Lấy danh sách cell input
        const cells = this.cellInputs.toArray();
        // Tìm index của cell hiện tại trong danh sách
        const currentIndex = cells.findIndex(cell => cell.row?.id === row.id && cell.colIndex === colIndex);
        cells[currentIndex]?.focus();
    }

    /**
     * Handles keyboard navigation for cell inputs.
     * Supports arrow keys for navigation and Enter for adding new rows or moving down.
     *
     * @param {KeyboardEvent} event - The keyboard event.
     * @param {BudgetRows} row - The current row.
     * @param {number} colIndex - The current column index.
     */
    handleKeyDown(event: KeyboardEvent, row: BudgetRows, colIndex: number): void {
        console.log("handleKeyDown", event.key, row, colIndex);
        // Lấy danh sách cell input
        const cells = this.cellInputs.toArray();
        // Tìm index của cell hiện tại trong danh sách
        const currentIndex = cells.findIndex(cell => cell.row?.id === row.id && cell.colIndex === colIndex);

        let nextIndex = currentIndex;
        if (event.key === 'ArrowRight') {
            nextIndex = Math.min(currentIndex + 1, cells.length - 1);
        } else if (event.key === 'ArrowLeft') {
            nextIndex = Math.max(currentIndex - 1, 0);
        } else if (event.key === 'ArrowDown') {
            // Giả sử mỗi row có N cột, nhảy xuống dưới
            const columns = this.months().length;
            nextIndex = Math.min(currentIndex + columns, cells.length - 1);
        } else if (event.key === 'ArrowUp') {
            const columns = this.months().length;
            nextIndex = Math.max(currentIndex - columns, 0);
        } else if (event.key === 'Enter') {
            // Tìm parent của row hiện tại
            const parent = this.findParent(this.data(), row);
            if (parent && parent.children) {
                const idx = parent.children.findIndex(child => child.id === row.id);
                if (idx === parent.children.length - 1) {
                    // Nếu là phần tử cuối cùng, tạo row mới phía sau nó
                    this.addRowAfterRow(parent, row);
                    return;
                } else {
                    // Nếu không, di chuyển xuống dưới như ArrowDown
                    const columns = this.months().length;
                    nextIndex = Math.min(currentIndex + columns, cells.length - 1);
                }
            }
        }

        if (nextIndex !== currentIndex) {
            event.preventDefault();
            cells[nextIndex]?.focus();
        }
    }

    /**
     * Updates the value of a specific cell in a row for a given month.
     * Finds the target row by id and updates its value, then refreshes the data tree.
     *
     * @param {BudgetRows} row - The row to update.
     * @param {string | number} value - The new value to set.
     * @param {number} monthIndex - The index of the month to update.
     */
    updateRowByValue(row: BudgetRows, value: string | number, monthIndex: number): void {
        function updateLeaf(nodes: BudgetRows[]): boolean {
            for (const node of nodes) {
                // @ts-ignore
                if (node.values && node.id === row.id) {
                    // @ts-ignore
                    node.values[monthIndex] = Number(value);
                    return true;
                } else if (node.children && node.children.length > 0) {
                    if (updateLeaf(node.children)) return true;
                }
            }
            return false;
        }

        const data = this.data();
        updateLeaf(data);
        this.setBudgetRows(data);
    }

    /**
     * Shows a confirmation popup and, if accepted, applies the value of the selected cell to all months in the row.
     *
     * @param {Event} event - The triggering event (usually right-click/context menu).
     * @param {BudgetRows} row - The row to apply the value to.
     * @param {number} monthIndex - The index of the month whose value will be applied to all months.
     */
    applyToAll(event: Event, row: BudgetRows, monthIndex: number): void {
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: 'Are you sure you want to apply this value to all?',
            icon: 'pi pi-info-circle',
            rejectButtonProps: {
                label: 'Cancel',
                severity: 'secondary',
                outlined: true
            },
            acceptButtonProps: {
                label: 'Apply',
                severity: 'info'
            },
            accept: () => {
                if (row.values) {
                    const value = row.values ? row.values[monthIndex] : 0;
                    function update(nodes: BudgetRows[]): boolean {
                        for (const node of nodes) {
                            if (node.values && node.id === row.id) {
                                node.values = node.values.fill(value);
                                return true;
                            } else if (node.children && node.children.length > 0) {
                                if (update(node.children)) return true;
                            }
                        }
                        return false;
                    }

                    const data = this.data();
                    update(data);
                    this.setBudgetRows(data);
                }
                this.handleMessage('info', 'Confirmed', 'Records applied!');
            },
            reject: () => {
                this.handleMessage('error', 'Rejected', 'You have rejected!');
            }
        });
    }

    /**
     * Adds a new row or category as a child of the specified row, at the given level.
     * The new row/category is initialized with blank values.
     *
     * @param {BudgetRows} row - The parent row to add the new row/category to.
     * @param {number} [level=0] - The depth/level of the new row/category.
     */
    addNewRowCategory(row: BudgetRows, level: number = 0): void {
        const index = row.children?.length ?? 0;
        const newRow: BudgetRows = this.generateBlankNode(level, this.months().length);
        row.children?.splice(index + 1, 0, newRow);
        this.updateTotalsRecursively(this.data());
        this.data.set(this.data());
        this.handleMessage('success', 'Created', level === 0 ? 'Row has been created.' : 'Rows have been created.');
    }

    /**
     * Deletes all rows (and their children) in the budget tree that have the checked property set to true.
     * Updates the data tree and shows a success message after deletion.
     */
    deleteRows() {
        function filterUnchecked(nodes: BudgetRows[]): BudgetRows[] {
            return nodes
                .filter(node => !node.checked)
                .map(node => ({
                    ...node,
                    children: node.children ? filterUnchecked(node.children) : undefined
                }));
        }

        const filtered = filterUnchecked(this.data());
        this.setBudgetRows(filtered);
        this.handleMessage('success', 'Deleted', 'Checked rows have been deleted.');
    }

    /**
     * Calculates the opening balance for each month.
     * The first month is always 0; each subsequent month is the previous opening balance plus the previous month's profit.
     *
     * @param {BudgetRows} rows - The row whose totals are used for calculation.
     * @returns {number[]} An array of opening balances for each month.
     */
    calculateOpeningBalance(rows: BudgetRows): number[] {
        const monthsCount = this.months().length;
        const profits = rows.totals ?? [];
        const openingBalances: number[] = Array(monthsCount).fill(0);

        for (let i = 1; i < monthsCount; i++) {
            openingBalances[i] = openingBalances[i - 1] + (profits[i - 1] || 0);
        }
        return openingBalances;
    }

    /**
     * Calculates the closing balance for each month.
     * Each month's closing balance is the sum of the opening balance and the profit for that month.
     *
     * @param {BudgetRows} rows - The row whose totals are used for calculation.
     * @returns {number[]} An array of closing balances for each month.
     */
    calculateClosingBalance(rows: BudgetRows): number[] {
        const monthsCount = this.months().length;
        const profits = rows.totals ?? [];
        const openingBalances = this.calculateOpeningBalance(rows);
        const closingBalances: number[] = Array(monthsCount).fill(0);

        for (let i = 0; i < monthsCount; i++) {
            closingBalances[i] = (openingBalances[i] || 0) + (profits[i] || 0);
        }
        return closingBalances;

    }

    /**
     * Updates the entire budget rows data tree.
     * Recalculates totals for all nodes and updates the reactive data signal with a new array reference.
     *
     * @param {BudgetRows[]} rows - The new budget rows data to set.
     */
    private setBudgetRows(rows: BudgetRows[]): void {
        // update totals value a whole tree
        this.updateTotalsRecursively(rows);
        // set new data
        this.data.set([...rows]);
    }

    /**
     * Recursively sets the values array for all leaf nodes in the BudgetRows tree.
     * If a node is a leaf (no children), its values array is set to the provided values,
     * keeping existing values if present, otherwise using the default from the input array.
     *
     * @param {BudgetRows[]} nodes - The array of nodes to update.
     * @param {number[]} values - The default values to set for each month in leaf nodes.
     */
    private setLeafValuesRecursively(nodes: BudgetRows[], values: number[]) {
        for (const node of nodes) {
            if (node.children && node.children.length > 0) {
                this.setLeafValuesRecursively(node.children, values);
            } else if (Array.isArray(node.values)) {
                // Fill values for each month, keeping existing value if present, otherwise using the default
                node.values = values.map((v, monthIndex) =>
                    typeof node.values![monthIndex] === 'number' ? node.values![monthIndex] : v
                );
            }
        }
    }

    /**
     * Recursively searches for the parent node of a given target node within a tree of BudgetRows.
     *
     * @param {BudgetRows[]} nodes - The array of nodes to search within.
     * @param {BudgetRows} target - The node whose parent is being searched for.
     * @param {BudgetRows | null} [parent=null] - The current parent node in the recursion (used internally).
     * @returns {BudgetRows | null} The parent node if found, otherwise null.
     */
    private findParent(nodes: BudgetRows[], target: BudgetRows, parent: BudgetRows | null = null): BudgetRows | null {
        for (const node of nodes) {
            if (node.id === target.id) {
                return parent;
            }
            if (node.children) {
                const found = this.findParent(node.children, target, node);
                if (found) return found;
            }
        }
        return null;
    }

    /**
     * Inserts a new row immediately after the specified row within the parent's children array.
     * The new row is initialized as a leaf node with default values for all months.
     * After insertion, totals are recalculated and the data signal is updated.
     *
     * @param {BudgetRows} parent - The parent node containing the children array.
     * @param {BudgetRows} afterRow - The row after which the new row will be inserted.
     */
    private addRowAfterRow(parent: BudgetRows, afterRow: BudgetRows) {
        const newId = Date.now();
        const newRow: BudgetRows = {
            id: newId,
            name: 'New Row',
            renamed: true,
            checked: false,
            totals: Array(this.months().length).fill(0),
            values: Array(this.months().length).fill(0)
        };
        const idx = parent.children!.findIndex(child => child.id === afterRow.id);
        if (idx !== -1) {
            parent.children!.splice(idx + 1, 0, newRow);
            this.updateTotalsRecursively(this.data());
            this.data.set([...this.data()]);
        }
    }

    /**
     * Initializes the budget data tree.
     * Sets default values for all leaf nodes based on the current months,
     * recalculates totals for all nodes, and updates the reactive data signal.
     *
     * @param {BudgetRows[]} [data=BudgetRows] - The initial data tree to initialize. Defaults to the static BudgetRows.
     */
    private initializeDataRows(data: BudgetRows[] = BudgetRows) {
        const values = Array(this.months().length).fill(0);
        this.setLeafValuesRecursively(data, values);
        this.updateTotalsRecursively(data);
        this.data.set([...data]);
    }
    
    /**
     * Update the totals for each node based on the values of the leaf nodes.
     * totals[i] = the sum of values[i] of all child nodes (if any), or the node's own values[i] if it is a leaf node.
     */
    private updateTotalsRecursively(nodes: BudgetRows[]) {
        for (const node of nodes) {
            if (node.children && node.children.length > 0) {
                // Recursively update totals for child nodes first
                this.updateTotalsRecursively(node.children);

                const childTotals = node.children.map(child => child.totals || []);
                const maxLen = Math.max(...childTotals.map(arr => arr.length));
                const operation = node.operation || 'sum';
                const totals: number[] = [];

                for (let i = 0; i < maxLen; i++) {
                    const valuesAtIndex = childTotals.map(arr => arr[i] ?? 0);

                    switch (operation) {
                        case 'sum':
                            totals[i] = valuesAtIndex.reduce((a, b) => a + b, 0);
                            break;
                        case 'subtract':
                            totals[i] = valuesAtIndex.reduce((a, b) => a - b);
                            break;
                        case 'multiply':
                            totals[i] = valuesAtIndex.reduce((a, b) => a * b, valuesAtIndex.length ? 1 : 0);
                            break;
                        case 'divide':
                            totals[i] = valuesAtIndex.reduce((a, b) => b !== 0 ? a / b : 0);
                            break;
                        default:
                            totals[i] = valuesAtIndex.reduce((a, b) => a + b, 0);
                    }
                }
                node.totals = totals;
            } else if (node.values !== undefined) {
                // If it's a leaf node, totals = values
                node.totals = [...node.values];
            }
        }
    }

    /**
     * Recursively generates a blank BudgetRows node.
     * If level < 1, returns a leaf node with values for each month.
     * If level >= 1, returns a category node with one child node, where the child is generated with (level - 1).
     *
     * @param {number} level - The depth of the node to generate. 0 for leaf, >0 for nested categories.
     * @param {number} monthsCount - The number of months (length of values/totals arrays).
     * @returns {BudgetRows} A new BudgetRows node, possibly with children.
     */
    private generateBlankNode(level: number, monthsCount: number): BudgetRows {
        const id = Date.now() + Math.floor(Math.random() * 10000 * Math.random());
        if (level < 1) {
            return {
                id,
                name: 'New Row',
                renamed: true,
                checked: false,
                operation: 'sum',
                totals: Array(monthsCount).fill(0),
                values: Array(monthsCount).fill(0)
            };
        } else {
            return {
                id,
                name: `New Category (Level ${3 - level})`,
                renamed: true,
                checked: false,
                totals: Array(monthsCount).fill(0),
                operation: 'sum',
                children: [this.generateBlankNode(level - 1, monthsCount)]
            };
        }
    }

    /**
     * Show a toast message using PrimeNG's MessageService.
     * 
     * @param {string} severity - The severity level ('success', 'info', 'warn', 'error').
     * @param {string} summary - The summary or title of the message.
     * @param {string} detail - The detailed message content.
     */
    private handleMessage(severity: string, summary: string, detail: string): void {
        this.messageService.add({ severity, summary, detail, life: 3000 });
    }
}
