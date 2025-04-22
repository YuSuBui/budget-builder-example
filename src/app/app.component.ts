import { Component } from '@angular/core';
import { BudgetTableComponent } from './components/budget-table/budget-table.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';

@Component({
    selector: 'app-root',
    imports: [CommonModule, FormsModule, DatePickerModule, BudgetTableComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent {
    title = 'budget-builder-example';
    startDate = new Date(2024, 0);
    endDate = new Date(2024, 11);

    constructor() {
    }
}
