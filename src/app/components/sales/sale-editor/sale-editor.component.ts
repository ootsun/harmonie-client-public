import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {DialogService} from '../../../shared/components/generic-dialog/dialog.service';
import {SaleService} from '@services/sale.service';
import {PatientService} from '@services/patient.service';
import {ProductService} from '@services/product.service';
import {SaleLine} from '@models/sale-line.model';
import {displayPatientFn} from '@models/patient.model';
import {Sale} from '@models/sale.model';
import {_filterPatient, PatientGroup} from '@models/patient-group.model';
import {displayProductFn, Product} from '@models/product.model';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {HelperService} from '@services/helper.service';
import {_filterProduct, ProductGroup} from '@models/product-group.model';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
    templateUrl: './sale-editor.component.html',
    styleUrls: ['./sale-editor.component.scss'],
})
export class SaleEditorComponent implements OnInit {
    editing: boolean;
    waiting = true;
    displayPatientFn = displayPatientFn;
    displayProductFn = displayProductFn;
    totalToPayFormatted: string;

    saleForm: FormGroup;
    saleLinesFormArray: FormArray;
    sale: Sale;
    maxDate = new Date();
    patientGroupOptions: Observable<PatientGroup[]>;
    patientGroups: PatientGroup[];
    productGroupOptionsMap: Map<FormGroup, Observable<ProductGroup[]>> = new Map();
    productGroups: ProductGroup[];

    products: Product[] = [];
    availableProducts: Product[] = [];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private dialogService: DialogService,
        private saleService: SaleService,
        private formBuilder: FormBuilder,
        private productService: ProductService,
        private patientService: PatientService,
        private cdr: ChangeDetectorRef,
        private _snackBar: MatSnackBar,
        private helperService: HelperService
    ) {
    }

    ngOnInit() {
        this.route.params.subscribe((params) => {
            const promises = [];
            this.editing = params['id'] !== undefined;
            if (this.editing) {
                promises.push(this.loadSale(params['id']));
            } else {
                this.buildForm();
            }

            promises.push(this.initProducts());
            promises.push(this.initPatients());

            Promise.all(promises)
                .then(() => {
                    if (this.sale) {
                        for (const saleLine of this.sale.saleLines) {
                            this.availableProducts.splice(this.availableProducts.findIndex(p => p._id === saleLine.product._id), 1);
                        }
                    }
                    this.productGroups = this.helperService.buildEntityGroups([...this.availableProducts],
                        'brand',
                        false,
                        displayProductFn) as ProductGroup[];
                    this.waiting = false;
                    this.updateTotalToPayFormatted();
                })
                .catch((err) => {
                    console.error(err);
                });
        });
    }

    onCancel() {
        this.router.navigate(['/sales']);
    }

    onSave() {
        this.waiting = true;
        if (this.editing) {
            this.update();
        } else {
            this.create();
        }
    }

    removeSaleLine(index: number) {
        const product = (<FormGroup>this.saleLinesFormArray.controls[index]).controls.product.value;
        this.saleLinesFormArray.controls.splice(index, 1);
        if (product) {
            this.availableProducts.push(product);
            this.updateTotalToPayFormatted();
        }
        this.saleForm.markAsDirty();
        this.saleLinesFormArray.updateValueAndValidity();
    }

    addSaleLine() {
        this.saleLinesFormArray.controls.push(this.createSaleLineForm(null));
        this.saleLinesFormArray.updateValueAndValidity();
        this.saleForm.updateValueAndValidity();
    }

    productChange(event) {
        this.availableProducts = [...this.products];
        for (const form of this.saleLinesFormArray.controls) {
            const selected = (<FormGroup>form).controls.product.value;
            if (selected) {
                this.availableProducts.splice(this.availableProducts.findIndex(p => p._id === selected._id), 1);
                form.updateValueAndValidity();
            }
        }
        this.productGroups = this.helperService.buildEntityGroups(
            [...this.availableProducts],
            'brand',
            false,
            displayProductFn) as ProductGroup[];
        this.cdr.detectChanges();
        this.saleLinesFormArray.updateValueAndValidity();
        this.saleForm.updateValueAndValidity();
    }

    pay(formGroup: FormGroup) {
        if (!formGroup) {
            (this.saleForm.controls.saleLines as FormArray).controls
                .forEach(form => {
                    (form as FormGroup).controls.paid.setValue((form as FormGroup).controls.toPay.value);
                    (form as FormGroup).controls.paid.markAsDirty();
                });
        } else {
            formGroup.controls.paid.setValue(formGroup.controls.toPay.value);
            formGroup.controls.paid.markAsDirty();
        }
    }

    private loadSale(saleId: string) {
        return this.saleService.get(saleId)
            .toPromise()
            .then((data) => {
                    this.sale = data;
                    this.buildForm();
                },
                (error) => {
                    console.error(error);
                    this.dialogService.error(error, '/sales');
                });
    }

    private buildForm() {
        this.saleForm = this.formBuilder.group({
            date: [
                {value: this.sale ? this.sale.date : new Date(), disabled: true},
                Validators.required,
            ],
            patient: [this.sale ? this.sale.patient : null, Validators.required],
            saleLines: this.createSaleLineFormArray(),
            paymentMethods: [this.sale ? this.sale.paymentMethods : []],
        });

        this.patientGroupOptions = this.saleForm.controls.patient.valueChanges
            .pipe(
                startWith(''),
                map(value => this._filterPatientGroup(value)));
    }

    private _filterPatientGroup(value: any): PatientGroup[] {
        // When a value is selected, the type is Patient
        if (value && typeof value === 'string') {
            return this.patientGroups
                .map(group => (new PatientGroup(group.letter, _filterPatient(group.patients, value, this.helperService))))
                .filter(group => group.patients.length > 0);
        }

        return this.patientGroups;
    }

    private _filterProductGroup(value: any): ProductGroup[] {
        // When a value is selected, the type is Product
        if (value && typeof value === 'string') {
            return this.productGroups
                .map(group => (new ProductGroup(group.letter, _filterProduct(group.products, value, this.helperService))))
                .filter(group => group.products.length > 0);
        }

        return this.productGroups;
    }

    private createSaleLineFormArray() {
        const saleLineForms = [];
        if (this.sale) {
            for (const saleLine of this.sale.saleLines) {
                saleLineForms.push(this.createSaleLineForm(saleLine));
            }
        } else {
            saleLineForms.push(this.createSaleLineForm(null));
        }
        this.saleLinesFormArray = this.formBuilder.array(saleLineForms);
        return this.saleLinesFormArray;
    }

    private createSaleLineForm(saleLine: SaleLine) {
        const newForm = this.formBuilder.group({
            _id: saleLine?._id,
            product: [saleLine?.product, Validators.required],
            quantity: [saleLine?.quantity, [Validators.required, Validators.min(1)]],
            toPay: [saleLine?.toPay, Validators.required],
            paid: saleLine?.paid,
        });

        this.productGroupOptionsMap.set(newForm, newForm.controls.product.valueChanges
            .pipe(
                startWith(''),
                map(value => this._filterProductGroup(value))));

        newForm.controls.product.statusChanges.subscribe(
            val => {
                if (val === 'VALID' && newForm.controls.quantity.valid) {
                    this.updateToPay(newForm);
                }
            });
        newForm.controls.quantity.statusChanges.subscribe(
            val => {
                if (val === 'VALID' && newForm.controls.product.valid) {
                    this.updateToPay(newForm);
                }
            });
        return newForm;
    }

    private updateToPay(form: FormGroup) {
        const toPay = this.computeToPayFor(form);

        form.controls.toPay.setValue(toPay);
        form.controls.toPay.updateValueAndValidity();
        form.updateValueAndValidity();
        this.saleForm.markAsDirty();
        this.saleForm.controls.saleLines.updateValueAndValidity();
        this.saleForm.updateValueAndValidity();

        this.updateTotalToPayFormatted();

        this._snackBar.openFromComponent(SnackBarUpdatedPriceComponent, {
            duration: 3000,
        });
    }

    private computeToPayFor(form: FormGroup) {
        const product = (<FormGroup>form).controls.product.value;
        if (!product) {
            return 0;
        }
        return ((product.price * 100) * (<FormGroup>form).controls.quantity.value) / 100;
    }

    private update() {
        this.saleService.update(this.buildSale()).subscribe(
            (next) => {
                this.router.navigate(['/sales']);
            },
            (error) => {
                console.error(error);
                this.dialogService.error(error, '/sales');
            }
        );
    }

    private create() {
        this.saleService.create(this.buildSale()).subscribe(
            (next) => {
                this.router.navigate(['/sales']);
            },
            (error) => {
                this.dialogService.error(error);
                this.waiting = false;
            }
        );
    }

    private buildSale() {
        return new Sale(
            this.sale ? this.sale._id : null,
            this.saleForm.controls.patient.value,
            this.buildSaleLines(),
            this.saleForm.controls.date.value,
            this.saleForm.controls.paymentMethods.value
        );
    }

    private buildSaleLines(): Array<SaleLine> {
        const saleLines = [];
        for (let i = 0; i < this.saleLinesFormArray.length; i++) {
            const saleLineForm: FormGroup = <FormGroup>this.saleLinesFormArray.at(i);
            saleLines.push(new SaleLine(saleLineForm.controls._id.value,
                saleLineForm.controls.product.value,
                saleLineForm.controls.quantity.value,
                saleLineForm.controls.toPay.value,
                saleLineForm.controls.paid.value));
        }
        return saleLines;
    }

    private initProducts() {
        return this.productService.getAll()
            .toPromise()
            .then((data) => {
                    this.products = [...data];
                    this.availableProducts = [...data];
                },
                (err) => {
                    console.error(err);
                    this.dialogService.error(err, '/sales');
                }
            );
    }

    private initPatients() {
        return this.patientService.getAll()
            .toPromise()
            .then((data) => {
                    this.patientGroups = this.helperService.buildEntityGroups(data, 'lastName', true, displayPatientFn) as PatientGroup[];
                },
                (err) => console.error(err)
            );
    }

    private updateTotalToPayFormatted() {
        const totalToPay = this.saleLinesFormArray.controls.map(form => this.computeToPayFor(form as FormGroup))
            .reduce((acc, value) => acc + value, 0);
        this.totalToPayFormatted = new Intl.NumberFormat('fr-BE', {
            style: 'currency',
            currency: 'EUR'
        }).format(totalToPay);
    }
}

@Component({
    template: `<p>Le <span class='font-accent'>prix à payer</span> a été mis à jour</p>`,
})
export class SnackBarUpdatedPriceComponent {
}
