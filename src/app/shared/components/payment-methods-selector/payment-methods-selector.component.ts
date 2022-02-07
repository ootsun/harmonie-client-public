import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {MatChipInputEvent} from '@angular/material/chips';
import {MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {Observable} from 'rxjs';
import {HelperService} from '@services/helper.service';
import {map, startWith} from 'rxjs/operators';
import {FormControl} from '@angular/forms';
import {AppConfigService} from '@services/app-config.service';

@Component({
    selector: 'app-payment-methods-selector',
    templateUrl: './payment-methods-selector.component.html',
    styleUrls: ['./payment-methods-selector.component.scss']
})
export class PaymentMethodsSelectorComponent implements OnInit {

    @Input() paymentMethodsCtrl: FormControl;

    separatorKeysCodes: number[] = [ENTER, COMMA];
    filteredPaymentMethods: Observable<string[]>;
    paymentMethodPropositions: string[];
    filteredValues: string[] = [];

    @ViewChild('paymentMethodsInput') paymentMethodsInput: ElementRef<HTMLInputElement>;

    constructor(
        private helperService: HelperService,
        private appConfigService: AppConfigService
    ) {
        this.paymentMethodPropositions = this.appConfigService.paymentMethodPropositions;
    }

    ngOnInit(): void {
        for (const value of this.paymentMethodPropositions) {
            if (!this.paymentMethodsCtrl.value.includes(value)) {
                this.filteredValues.push(value);
            }
        }

        this.filteredPaymentMethods = this.paymentMethodsCtrl.valueChanges.pipe(
            startWith(null),
            map((paymentMethod: string | null) =>
                paymentMethod ? this._filter(paymentMethod) : this.filteredValues));
    }

    add(event: MatChipInputEvent): void {
        const value = (event.value || '').trim();
        if (value) {
            this.paymentMethodsCtrl.value.push(value);
            this.filteredValues.splice(this.filteredValues.indexOf(value), 1);
        }
        this.paymentMethodsInput.nativeElement.value = '';
        this.paymentMethodsCtrl.markAsDirty();
    }

    remove(paymentMethod: string): void {
        this.paymentMethodsCtrl.value.splice(this.paymentMethodsCtrl.value.indexOf(paymentMethod), 1);
        if (this.paymentMethodPropositions.includes(paymentMethod)) {
            this.filteredValues.push(paymentMethod);
        }
        this.paymentMethodsCtrl.markAsDirty();
    }

    selected(event: MatAutocompleteSelectedEvent): void {
        this.paymentMethodsCtrl.value.push(event.option.viewValue);
        this.filteredValues.splice(this.filteredValues.indexOf(event.option.viewValue), 1);
        this.paymentMethodsInput.nativeElement.value = '';
        this.paymentMethodsCtrl.markAsDirty();
    }

    private _filter(value: string): string[] {
        return this.filteredValues.filter(paymentMethod =>
            this.helperService.normalizeString(paymentMethod).toLowerCase().includes(
                this.helperService.normalizeString(value).toLowerCase()));
    }
}
