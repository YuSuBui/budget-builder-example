import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IRowTree } from '../../model/budget-row.model';

@Component({
    selector: 'cell-input',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './cell-input.component.html',
    styleUrl: './cell-input.component.css'
})
export class CellInputComponent {
    @Input() type!: 'number' | 'text';
    @Input() row!: IRowTree;
    @Input() colIndex!: number;
    @Input() class!: string;
    @Input() value!: number | string;
    @Output() valueChange = new EventEmitter<number | string>();
    @Output() onBlurFunc = new EventEmitter<void>();
    @ViewChild('input') myInputRef!: ElementRef<HTMLInputElement>;

    /**
     * Handles input changes and emits the new value.
     * If the input type is 'number', only numeric characters are allowed.
     *
     * @param {string} value - The new input value as a string.
     */
    onInputChange(value: string) {
        if (this.type === 'number') {
            const num = Number(value.replace(/[^0-9]/g, ''));
            this.value = num;
            this.valueChange.emit(num);
        } else {
            this.valueChange.emit(value);
        }
    }

    /**
     * Sets focus to the input element.
     */
    focus(): void {
        this.myInputRef.nativeElement.focus();
    }

    /**
     * Applies focus styling to the parent cell when the input gains focus.
     */
    onFocusFunc(): void {
        const parent = this.myInputRef.nativeElement.parentElement?.parentElement;
        if (parent) {
            parent.style.border = '1.5px solid #000';
            parent.style.backgroundColor = "rgb(255, 255, 200)";
        }
    }

    /**
     * Removes focus styling from the parent cell and emits the blur event when the input loses focus.
     */
    onUnFocusFunc(): void {
        const parent = this.myInputRef.nativeElement.parentElement?.parentElement;
        if (parent) {
            parent.style.border = '0.75px solid #000';
            parent.style.background = 'transparent';
        }
        this.onBlurFunc.emit();
    }

}
