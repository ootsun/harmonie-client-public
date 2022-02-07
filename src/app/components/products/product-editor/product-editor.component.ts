import {Component, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Product} from '@models/product.model';
import {ActivatedRoute, Router} from '@angular/router';
import {DialogService} from '../../../shared/components/generic-dialog/dialog.service';
import {ProductService} from '@services/product.service';
import {Loss} from '@models/loss.model';
import {MatSnackBar} from '@angular/material/snack-bar';
import {pairwise, startWith} from 'rxjs/operators';

@Component({
    templateUrl: './product-editor.component.html',
    styleUrls: ['./product-editor.component.scss'],
})
export class ProductEditorComponent implements OnInit {
    PRICE_REGEX = /^\d+(,\d{1,2})?$/;
    NUMBER_REGEX = /^\d+$/;

    editing: boolean;
    waiting = true;
    maxDate = new Date();

    productForm: FormGroup;
    lossesFormArray: FormArray;
    product: Product;

    private trueStock: number;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private dialogService: DialogService,
        private productService: ProductService,
        private formBuilder: FormBuilder,
        private _snackBar: MatSnackBar
    ) {
    }

    ngOnInit() {
        this.route.params.subscribe((params) => {
            if (params['id']) {
                this.loadProduct(params['id']);
            } else {
                this.buildForm();
            }
        });
    }

    onCancel() {
        this.router.navigate(['/products']);
    }

    onSave() {
        this.waiting = true;
        if (this.editing) {
            this.update();
        } else {
            this.create();
        }
    }

    removeLoss(index: number) {
        this.updateStock((<FormGroup>this.lossesFormArray.controls[index]).controls.quantity.value, 0);
        this.lossesFormArray.controls.splice(index, 1);
        this.productForm.markAsDirty();
        this.lossesFormArray.updateValueAndValidity();
    }

    addLoss() {
        this.lossesFormArray.controls.push(this.createLossForm(null));
        this.lossesFormArray.updateValueAndValidity();
        this.productForm.updateValueAndValidity();
    }

    private loadProduct(productId: string) {
        this.editing = true;
        this.productService.get(productId).subscribe(
            (data) => {
                this.product = data;
                this.buildForm();
            },
            (error) => {
                console.error(error);
                this.dialogService.error(error, '/products');
            }
        );
    }

    private buildForm() {
        this.productForm = this.formBuilder.group({
            title: [this.product ? this.product.title : null, Validators.required],
            brand: this.product ? this.product.brand : null,
            price: [
                this.product ? ('' + this.product.price).replace('.', ',') : null,
                [Validators.required, Validators.pattern(this.PRICE_REGEX)],
            ],
            vatAmount: [
                this.product ? this.product.vatAmount : 21,
                [Validators.required, Validators.pattern(this.NUMBER_REGEX)],
            ],
            stock: [
                this.product ? this.product.stock : null,
                [Validators.required, Validators.pattern(this.NUMBER_REGEX)],
            ],
            losses: this.createLossesFormArray(),
        });

        this.trueStock = this.product?.stock;
        this.productForm.controls.stock.valueChanges
            .subscribe(value => {
                this.trueStock = value * 1;
            });

        this.waiting = false;
    }

    private createLossesFormArray() {
        const lossForms = [];
        if (this.product) {
            for (const loss of this.product.losses) {
                lossForms.push(this.createLossForm(loss));
            }
        }
        this.lossesFormArray = this.formBuilder.array(lossForms);
        return this.lossesFormArray;
    }

    private createLossForm(loss: Loss) {
        const defaultQuantity = 1;
        const newForm = this.formBuilder.group({
            _id: loss?._id,
            date: [loss ? loss.date : new Date(), Validators.required],
            price: [loss ? loss.price : this.productForm?.controls.price.value, Validators.required],
            quantity: [loss?.quantity, [Validators.required, Validators.min(1)]],
        });

        newForm.controls.quantity.valueChanges
            .pipe(
                startWith(0),
                pairwise()
            )
            .subscribe(([previousValue, currentValue]) => this.updateStock(previousValue, currentValue));

        if (!loss) {
            newForm.controls.quantity.patchValue(defaultQuantity);
        }

        return newForm;
    }

    private updateStock(previousValue: number, currentValue: number) {
        //  * 1 => To be sure they are numbers (string if it's a value passed by the template)
        this.trueStock += previousValue * 1 - currentValue * 1;
        if (this.trueStock >= 0) {
            this.productForm.controls.stock.patchValue(this.trueStock, {emitEvent: false});
        } else {
            this.productForm.controls.stock.patchValue(0, {emitEvent: false});
        }

        this.productForm.updateValueAndValidity();
        this.productForm.markAsDirty();

        this._snackBar.openFromComponent(SnackBarUpdatedStockComponent, {
            duration: 3000,
        });
    }

    private update() {
        this.productService.update(this.buildProduct()).subscribe(
            (next) => {
                this.router.navigate(['/products']);
            },
            (error) => {
                this.dialogService.error(error);
                this.waiting = false;
            }
        );
    }

    private create() {
        this.productService.create(this.buildProduct()).subscribe(
            (next) => {
                this.router.navigate(['/products']);
            },
            (error) => {
                this.dialogService.error(error);
                this.waiting = false;
            }
        );
    }

    private buildProduct() {
        return new Product(
            this.product ? this.product._id : null,
            this.productForm.controls.title.value,
            this.productForm.controls.brand.value,
            this.productForm.controls.price.value.replace(',', '.'),
            this.productForm.controls.vatAmount.value,
            this.productForm.controls.stock.value,
            this.buildLosses()
        );
    }

    private buildLosses(): Array<Loss> {
        const losses = [];
        for (let i = 0; i < this.lossesFormArray.length; i++) {
            const lossForm: FormGroup = <FormGroup>this.lossesFormArray.at(i);
            losses.push(new Loss(
                lossForm.controls._id.value,
                lossForm.controls.date.value,
                lossForm.controls.price.value,
                lossForm.controls.quantity.value));
        }
        return losses;
    }
}

@Component({
    template: `<p>Le <span class='font-accent'>stock</span> a été mis à jour</p>`,
})
export class SnackBarUpdatedStockComponent {
}
