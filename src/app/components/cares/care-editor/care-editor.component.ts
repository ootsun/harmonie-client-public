import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {DialogService} from '../../../shared/components/generic-dialog/dialog.service';
import {CareService} from '@services/care.service';
import {CareTypeService} from '@services/care-type.service';
import {PatientService} from '@services/patient.service';
import {CareType} from '@models/care-type.model';
import {displayPatientFn} from '@models/patient.model';
import {Care} from '@models/care.model';
import {Observable} from 'rxjs/internal/Observable';
import {startWith, map} from 'rxjs/operators';
import {HelperService} from '@services/helper.service';
import {PatientGroup, _filterPatient} from '@models/patient-group.model';

@Component({
    templateUrl: './care-editor.component.html',
    styleUrls: ['./care-editor.component.scss'],
})
export class CareEditorComponent implements OnInit {
    editing: boolean;
    waiting = true;
    displayPatientFn = displayPatientFn;

    careForm: FormGroup;
    care: Care;
    maxDate = new Date();
    patientGroupOptions: Observable<PatientGroup[]>;
    patientGroups: PatientGroup[];

    careTypes: CareType[] = [];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private dialogService: DialogService,
        private careService: CareService,
        private formBuilder: FormBuilder,
        private careTypeService: CareTypeService,
        private patientService: PatientService,
        private helperService: HelperService
    ) {
    }

    ngOnInit() {
        this.route.params.subscribe((params) => {
            const promises = [];
            this.editing = params['id'] !== undefined;
            if (this.editing) {
                promises.push(this.loadCare(params['id']));
            } else {
                this.buildForm();
            }

            promises.push(this.initCareTypes());
            promises.push(this.initPatients());

            Promise.all(promises)
                .then(() => {
                    this.buildForm();
                    this.waiting = false;
                })
                .catch((err) => {
                    console.error(err);
                });
        });
    }

    onCancel() {
        this.router.navigate(['/cares']);
    }

    onSave() {
        this.waiting = true;
        if (this.editing) {
            this.update();
        } else {
            this.create();
        }
    }

    typeChanged() {
        if (!this.editing) {
            this.careForm.controls.toPay.setValue(
                this.careForm.controls.type.value.price
            );
        }
    }

    compareFunction(o1: any, o2: any) {
        return o1?._id === o2?._id;
    }

    pay() {
        this.careForm.controls.paid.setValue(this.careForm.controls.toPay.value);
        this.careForm.controls.paid.markAsDirty();
    }

    private loadCare(careId: string) {
        return this.careService.get(careId)
            .toPromise()
            .then((data) => {
                    this.care = data;
                },
                (error) => {
                    console.error(error);
                    this.dialogService.error(error, '/cares');
                }
            );
    }

    private buildForm() {
        this.careForm = this.formBuilder.group({
            date: [
                {value: this.care ? this.care.date : new Date(), disabled: true},
                Validators.required,
            ],
            patient: [this.care ? this.care.patient : null, Validators.required],
            type: [this.care ? this.care.type : null, Validators.required],
            toPay: [this.care ? this.care.toPay : null, Validators.required],
            paid: [this.care ? this.care.paid : null],
            paymentMethods: [this.care ? this.care.paymentMethods : []],
            note: [this.care ? this.care.note : null],
        });

        this.patientGroupOptions = this.careForm.controls.patient.valueChanges
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

    private update() {
        this.careService.update(this.buildCare()).subscribe(
            (next) => {
                this.router.navigate(['/cares']);
            },
            (error) => {
                this.dialogService.error(error);
                this.waiting = false;
            }
        );
    }

    private create() {
        this.careService.create(this.buildCare()).subscribe(
            (next) => {
                this.router.navigate(['/cares']);
            },
            (error) => {
                this.dialogService.error(error);
                this.waiting = false;
            }
        );
    }

    private buildCare() {
        return new Care(
            this.care ? this.care._id : null,
            this.careForm.controls.date.value,
            this.careForm.controls.patient.value,
            this.careForm.controls.type.value,
            this.careForm.controls.toPay.value,
            this.careForm.controls.paid.value,
            this.careForm.controls.paymentMethods.value,
            this.careForm.controls.note.value
        );
    }

    private initCareTypes() {
        return this.careTypeService.getAll()
            .toPromise()
            .then((data) => {
                    this.careTypes = data;
                    if (!this.editing) {
                        this.careForm.controls.type.setValue(data[0]);
                        this.careForm.controls.toPay.setValue(data[0].price);
                    }
                },
                (error) => {
                    console.error(error);
                    this.dialogService.error(error, '/cares');
                }
            );
    }

    private initPatients() {
        return this.patientService.getAll()
            .toPromise()
            .then((data) => {
                    this.patientGroups = this.helperService.buildEntityGroups(data, 'lastName', true, displayPatientFn) as PatientGroup[];
                },
                (error) => {
                    console.error(error);
                    this.dialogService.error(error, '/cares');
                }
            );
    }
}
