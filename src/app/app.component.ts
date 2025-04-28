import { Component } from '@angular/core';
import { BudgetTableComponent } from './components/budget-table/budget-table.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';

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

    constructor() {
    }

    get startDate(): Date | undefined {
        return this.dateRange ? this.dateRange[0] : undefined;
    }

    get endDate(): Date | undefined {
        return this.dateRange ? this.dateRange[1] : undefined;
    }
}
