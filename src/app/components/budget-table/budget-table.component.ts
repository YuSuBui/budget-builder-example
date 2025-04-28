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
import _ from 'lodash';

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
        console.log("ngAfterViewInit", this.data());
        
        const firstCell = this.cellInputs?.get(0);
        firstCell?.focus();

        this.cellInputs.changes.subscribe((inputs: QueryList<CellInputComponent>) => {
            inputs.get(0)?.focus();
        });

        this.renameCells.changes.subscribe((inputs: QueryList<CellInputComponent>) => {
            inputs.get(0)?.focus();
        });
    }

    headlines = computed(() => {
        const start = this.startMonth().toLocaleString('default', { month: "2-digit", year: 'numeric' });
        const end = this.endMonth().toLocaleString('default', { month: "2-digit", year: 'numeric' });
        return `Start from: ${start} to: ${end}`;
    });

    trackById(index: number, item: BudgetRows): number {
        return item.id;
    }

    onCheckBoxChange(row: BudgetRows, checked: boolean): void {
        console.log("onCheckBoxChange", row);
        if (row.children && row.children.length > 0) {
            row.children.forEach((child) => {
                child.checked = checked;
                this.onCheckBoxChange(child, checked);
            });
        }
    }

    handleNextCell(row: BudgetRows, colIndex = 0): void {
        // Lấy danh sách cell input
        const cells = this.cellInputs.toArray();
        // Tìm index của cell hiện tại trong danh sách
        const currentIndex = cells.findIndex(cell => cell.row?.id === row.id && cell.colIndex === colIndex);
        cells[currentIndex]?.focus();
    }

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

    addNewRowCategory(row: BudgetRows, level = 0): void {
        const index = row.children?.length ?? 0;
        const newRow: BudgetRows = this.generateBlankNode(level, this.months().length);
        row.children?.splice(index + 1, 0, newRow);
        this.updateTotalsRecursively(this.data());
        this.data.set(this.data());
    }

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

    calcuateOpeningBalance(rows: BudgetRows): number [] {
        const monthsCount = this.months().length;
        const profits = rows.totals ?? [];
        const openingBalances: number[] = Array(monthsCount).fill(0);

        for (let i = 1; i < monthsCount; i++) {
            openingBalances[i] = openingBalances[i - 1] + (profits[i - 1] || 0);
        }
        return openingBalances;
    }

    calcuateClosingBalance(rows: BudgetRows): number[] {
        const monthsCount = this.months().length;
        const profits = rows.totals ?? [];
        const openingBalances = this.calcuateOpeningBalance(rows);
        const closingBalances: number[] = Array(monthsCount).fill(0);

        for (let i = 0; i < monthsCount; i++) {
            closingBalances[i] = (openingBalances[i] || 0) + (profits[i] || 0);
        }
        return closingBalances;

    }

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

    private setBudgetRows(rows: BudgetRows[]): void {
        // update totals value a whole tree
        this.updateTotalsRecursively(rows);
        // set new data
        this.data.set(rows);
    }

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

    private addRowAfterRow(parent: BudgetRows, afterRow: BudgetRows) {
        const newId = Date.now(); // Hoặc cách sinh id khác
        const newRow: BudgetRows = {
            id: newId,
            name: 'New Row',
            renamed: true,
            checked: false,
            totals: Array(this.months().length).fill(0),
            values: Array(this.months().length).fill(0)
        };
        const idx = parent.children!.findIndex(child => child.id === afterRow.id);
        parent.children!.splice(idx + 1, 0, newRow);
        this.updateTotalsRecursively(this.data());
        this.data.set(this.data());
    }

    private initializeDataRows(data: BudgetRows[] = BudgetRows) {
        const values = Array(this.months().length).fill(0);
        this.setLeafValuesRecursively(data, values);
        this.updateTotalsRecursively(data);
        this.data.set(data);
    }
    
    /**
     * Update the totals for each node based on the values of the leaf nodes.
     * totals[i] = the sum of values[i] of all child nodes (if any), or the node's own values[i] if it is a leaf node.
     */
    private updateTotalsRecursively(nodes: BudgetRows[]) {
        // for (const node of nodes) {
        //     if (node.children && node.children.length > 0) {
        //         // Đệ quy cập nhật totals cho các node con trước
        //         this.updateTotalsRecursively(node.children);
        //         // Tính tổng totals từ các node con
        //         const childTotals = node.children.map(child => child.totals || []);
        //         const totals: number[] = [];
        //         const maxLen = Math.max(...childTotals.map(arr => arr.length));
        //         for (let i = 0; i < maxLen; i++) {
        //             totals[i] = childTotals.reduce((sum, arr) => sum + (arr[i] || 0), 0);
        //         }
        //         node.totals = totals;
        //     } else if (node.values !== undefined) {
        //         // Nếu là node lá, totals = values
        //         node.totals = [...node.values];
        //     }
        // }
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
