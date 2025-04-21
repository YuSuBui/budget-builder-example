import { AfterViewInit, Component, computed, QueryList, signal, ViewChildren, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ToastModule } from 'primeng/toast';
import { CellInputComponent } from '../cell-input/cell-input.component';
import _ from 'lodash';

interface BudgetRow {
    id: number;
    name: string;
    parent: string;
    group: string;
    values: number[];
    renamed?: boolean;
}

const BudgetRows = [
    { id: 0, name: 'General Income', parent: 'Income', group: 'General' },
    { id: 1, name: 'Sales', parent: 'Income', group: 'General' },
    { id: 2, name: 'Commission', parent: 'Income', group: 'General' },
    { id: 3, name: 'Training', parent: 'Income', group: 'Other' },
    { id: 4, name: 'Consulting', parent: 'Income', group: 'Other' },
    { id: 5, name: 'Operational Expenses', parent: 'Expenses', group: 'Operational' },
    { id: 6, name: 'Management Fees', parent: 'Expenses', group: 'Operational' },
    { id: 7, name: 'Cloud Hosting', parent: 'Expenses', group: 'Operational' },
    { id: 8, name: 'Full Time Dev Salaries', parent: 'Expenses', group: 'Salaries & Wages' },
    { id: 9, name: 'Part Time Dev Salaries', parent: 'Expenses', group: 'Salaries & Wages' },
    { id: 10, name: 'Remote Salaries', parent: 'Expenses', group: 'Salaries & Wages' },
];

@Component({
    selector: 'app-budget-table',
    imports: [CommonModule, FormsModule, ToastModule, ConfirmPopupModule, CellInputComponent],
    providers: [ConfirmationService, MessageService],
    templateUrl: './budget-table.component.html',
    styleUrl: './budget-table.component.css'
})
export class BudgetTableComponent implements AfterViewInit {
    startDate = "2024-01";
    endDate = "2024-11";
    startMonth = signal<Date>(new Date(this.startDate));
    endMonth = signal<Date>(new Date(this.endDate));
    data: WritableSignal<BudgetRow[]> = signal<BudgetRow[]>([]);
    @ViewChildren('cell') cellInputs!: QueryList<CellInputComponent>;

    constructor(private confirmationService: ConfirmationService, private messageService: MessageService) {
        this.data.set(Array.from(BudgetRows).map(raw => ({
            ...raw,
            values: Array(this.months().length).fill(0),
            renamed: true
        })));
    }

    ngAfterViewInit() {
        const firstCell = this.cellInputs?.get(0);
        firstCell?.focus();
    }

    months = computed(() => {
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

    parents = computed(() => {
        return _.chain(this.data())
            .groupBy('parent')
            .map((parentGroup, parent) => ({
                name: parent,
                values: _.chain(parentGroup)
                    .groupBy('group')
                    .map((values, group) => ({
                        name: group,
                        values,
                    }))
                    .value(),
            }))
            .value();
    });

    getRowsByParentName(parentName: string) {
        return this.parents().find(p => p.name === parentName)?.values ?? [];
    }

    getRowIndexById(id: number): number {
        return this.data().findIndex(r => r.id === id);
    }

    calculateTotalByGroupAndMonth(group: BudgetRow[], monthIndex: number): number {
        return _.sumBy(group, row => row.values[monthIndex] || 0);
    }

    calculateTotalByParentAndMonth(name: string, monthIndex: number): number {
        return _.sumBy(
            this.data().filter(row => row.parent === name),
            row => row.values[monthIndex] || 0
        );
    }

    calculateProfits(monthIndex: number): number {
        const incomes = this.calculateTotalByParentAndMonth("Income", monthIndex);
        const expenses = this.calculateTotalByParentAndMonth("Expenses", monthIndex);
        return incomes - expenses;
    }

    calculateOpenningBalance(monthIndex: number): number {
        if (monthIndex === 0) return 0;
        let openingBalances = 0;

        for (let i = 0; i < monthIndex; i++) {
            const prevProfit = this.calculateProfits(i);
            openingBalances += prevProfit;
        }

        return openingBalances;
    }

    createCell(parent: string, group: string): void {
        const newCell: BudgetRow = {
            id: Date.now(),
            name: '',
            parent,
            group,
            values: Array(this.months().length).fill(0),
            renamed: false
        };
        this.data.set([...this.data(), newCell]);
    }

    deleteRow(r: BudgetRow, event: Event): void {
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: 'Do you want to delete this record?',
            icon: 'pi pi-info-circle',
            rejectButtonProps: {
                label: 'Cancel',
                severity: 'secondary',
                outlined: true
            },
            acceptButtonProps: {
                label: 'Delete',
                severity: 'danger'
            },
            accept: () => {
                const updated = this.data().filter(row => row.id !== r.id);
                this.data.set([...updated]);
                this.messageService.add({ severity: 'info', summary: 'Confirmed', detail: 'Record deleted', life: 3000 });
            },
            reject: () => {
                this.messageService.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected', life: 3000 });
            }
        });
    }

    applyToAll(rowIndex: number, monthIndex: number, event: MouseEvent): void {
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: 'Are you sure you want to apply this to all?',
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
                const value = this.data()[rowIndex].values[monthIndex];
                const updated = this.data().map(row => ({
                    ...row,
                    values: row.values.map((v, i) => (i === monthIndex ? value : v))
                }));
                this.data.set(updated);
                this.messageService.add({ severity: 'info', summary: 'Confirmed', detail: 'Record applied', life: 3000 });
            },
            reject: () => {
                this.messageService.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected', life: 3000 });
            }
        });

    }

    onDateChange(): void {
        this.startMonth.set(new Date(this.startDate));
        this.endMonth.set(new Date(this.endDate));
    }

    handleKeyDown(event: KeyboardEvent, rowIndex: number, colIndex: number): void {
        const cols = this.data()[0].values.length;
        const idx = rowIndex * cols + colIndex;

        switch (event.key) {
            case 'ArrowRight': this.cellInputs.get(idx + 1)?.focus(); break;
            case 'ArrowLeft': this.cellInputs.get(idx - 1)?.focus(); break;
            case 'ArrowDown': this.cellInputs.get(idx + cols)?.focus(); break;
            case 'ArrowUp': this.cellInputs.get(idx - cols)?.focus(); break;
            case 'Tab': event.preventDefault(); this.cellInputs.get(idx + 1)?.focus(); break;
            case 'Enter': event.preventDefault(); this.cellInputs.get(idx + cols)?.focus(); break;
        }
    }
}
