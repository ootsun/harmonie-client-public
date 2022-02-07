import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CareType} from '@models/care-type.model';
import {ActivatedRoute, Router} from '@angular/router';
import {DialogService} from '../../../shared/components/generic-dialog/dialog.service';
import {CareTypeService} from '@services/care-type.service';

@Component({
    templateUrl: './care-type-editor.component.html',
    styleUrls: ['./care-type-editor.component.scss'],
})
export class CareTypeEditorComponent implements OnInit {
    PRICE_REGEX = /^\d+(,\d{1,2})?$/;

    editing: boolean;
    waiting = true;

    careTypeForm: FormGroup;
    careType: CareType;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private dialogService: DialogService,
        private careTypeService: CareTypeService,
        private formBuilder: FormBuilder
    ) {
    }

    ngOnInit() {
        this.route.params.subscribe((params) => {
            if (params['id']) {
                this.loadCareType(params['id']);
            } else {
                this.buildForm();
            }
        });
    }

    onCancel() {
        this.router.navigate(['/care-types']);
    }

    onSave() {
        this.waiting = true;
        if (this.editing) {
            this.update();
        } else {
            this.create();
        }
    }

    private loadCareType(careTypeId: string) {
        this.editing = true;
        this.careTypeService.get(careTypeId).subscribe(
            (data) => {
                this.careType = data;
                this.buildForm();
            },
            (error) => {
                console.error(error);
                this.dialogService.error(error, '/care-types');
            }
        );
    }

    private buildForm() {
        this.careTypeForm = this.formBuilder.group({
            title: [this.careType ? this.careType.title : null, Validators.required],
            price: [
                this.careType ? ('' + this.careType.price).replace('.', ',') : null,
                [Validators.required, Validators.pattern(this.PRICE_REGEX)],
            ],
        });
        this.waiting = false;
    }

    private update() {
        this.careTypeService.update(this.buildCareType()).subscribe(
            (next) => {
                this.router.navigate(['/care-types']);
            },
            (error) => {
                this.dialogService.error(error);
                this.waiting = false;
            }
        );
    }

    private create() {
        this.careTypeService.create(this.buildCareType()).subscribe(
            (next) => {
                this.router.navigate(['/care-types']);
            },
            (error) => {
                this.dialogService.error(error);
                this.waiting = false;
            }
        );
    }

    private buildCareType() {
        return new CareType(
            this.careType ? this.careType._id : null,
            this.careTypeForm.controls.title.value,
            this.careTypeForm.controls.price.value.replace(',', '.')
        );
    }
}
