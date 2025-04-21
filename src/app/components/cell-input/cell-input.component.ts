import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'cell-input',
    imports: [CommonModule, FormsModule],
    templateUrl: './cell-input.component.html',
    styleUrl: './cell-input.component.css'
})
export class CellInputComponent {
    @Input() type!: 'number' | 'text';
    @Input() class!: string;
    @Input() value!: number | string;
    @Output() valueChange = new EventEmitter<number | string>();
    @ViewChild('input') myInputRef!: ElementRef<HTMLInputElement>;

    onInputChange(text: string) {
        if (this.type === 'number') {
            const transform = text.replace(/[^0-9]/g, '');
            this.value = Number(transform)
            this.valueChange.emit(Number(transform));
        } else if (this.type === 'text') {
            this.valueChange.emit(text);
        }
    }

    focus(): void {
        this.myInputRef.nativeElement.focus();
    }
    
    onFocusFunc(): void {
        const parent = this.myInputRef.nativeElement.parentElement?.parentElement;
        if (parent) {
            parent.style.border = '2px solid #000';
        }
    }

    onUnFocusFunc(): void {
        const parent = this.myInputRef.nativeElement.parentElement?.parentElement;
        if (parent) {
            parent.style.border = '1px solid #000';
        }
    }

}
