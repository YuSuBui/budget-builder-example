import { Component } from '@angular/core';
import { BudgetTableComponent } from './components/budget-table/budget-table.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { IRowTree, RawBudgetData } from './model/budget-row.model';
import { migrateBudgetRowsToTree } from './utils';

@Component({
    selector: 'app-root',
    imports: [CommonModule, FormsModule, DatePickerModule, BudgetTableComponent],
    standalone: true,
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent {
    title = 'budget-builder-example';
    dateRange: Date[] = [new Date(2024, 0), new Date(2024, 11)];
    data: IRowTree[] = [];

    constructor() {
        this.data = migrateBudgetRowsToTree(RawBudgetData);
    }

    /**
     * Returns the start date of the selected date range.
     *
     * @returns {Date | undefined} The start date, or undefined if not set.
     */
    get startDate(): Date | undefined {
        return this.dateRange ? this.dateRange[0] : undefined;
    }

    /**
     * Returns the end date of the selected date range.
     *
     * @returns {Date | undefined} The end date, or undefined if not set.
     */
    get endDate(): Date | undefined {
        return this.dateRange ? this.dateRange[1] : undefined;
    }

    /**
     * Blurs (removes focus from) the date picker input element after the date range is selected or closed.
     *
     * @param {any} picker - The date picker component reference.
     */
    blurDatePickerInput(picker: any) {
        // Find the input element and blur it
        const input = picker?.el?.nativeElement?.querySelector('input');
        if (input) input.blur();
    }
}
