import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {DialogService} from '../../../shared/components/generic-dialog/dialog.service';
import {CourseService} from '@services/course.service';
import {TrainingService} from '@services/training.service';
import {PatientService} from '@services/patient.service';
import {Training} from '@models/training.model';
import {displayPatientFn} from '@models/patient.model';
import {Course} from '@models/course.model';
import {Observable} from 'rxjs/internal/Observable';
import {startWith, map} from 'rxjs/operators';
import {HelperService} from '@services/helper.service';
import {PatientGroup, _filterPatient} from '@models/patient-group.model';

@Component({
    templateUrl: './course-editor.component.html',
    styleUrls: ['./course-editor.component.scss'],
})
export class CourseEditorComponent implements OnInit {
    editing: boolean;
    waiting = true;
    displayPatientFn = displayPatientFn;

    courseForm: FormGroup;
    course: Course;
    maxDate = new Date();
    patientGroupOptions: Observable<PatientGroup[]>;
    patientGroups: PatientGroup[];

    trainings: Training[] = [];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private dialogService: DialogService,
        private courseService: CourseService,
        private formBuilder: FormBuilder,
        private trainingService: TrainingService,
        private patientService: PatientService,
        private helperService: HelperService
    ) {
    }

    ngOnInit() {
        this.route.params.subscribe((params) => {
            const promises = [];
            this.editing = params['id'] !== undefined;
            if (this.editing) {
                promises.push(this.loadCourse(params['id']));
            } else {
                this.buildForm();
            }

            promises.push(this.initTrainings());
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
        this.router.navigate(['/courses']);
    }

    onSave() {
        this.waiting = true;
        if (this.editing) {
            this.update();
        } else {
            this.create();
        }
    }

    compareFunction(o1: any, o2: any) {
        return o1?._id === o2?._id;
    }

    pay() {
        this.courseForm.controls.paid.setValue(this.courseForm.controls.toPay.value);
        this.courseForm.controls.paid.markAsDirty();
    }

    private loadCourse(courseId: string) {
        return this.courseService.get(courseId)
            .toPromise()
            .then((data) => {
                    this.course = data;
                },
                (error) => {
                    console.error(error);
                    this.dialogService.error(error, '/courses');
                }
            );
    }

    private buildForm() {
        this.courseForm = this.formBuilder.group({
            date: [
                {value: this.course ? this.course.date : new Date(), disabled: true},
                Validators.required,
            ],
            patient: [this.course ? this.course.patient : null, Validators.required],
            training: [this.course ? this.course.training : null, Validators.required],
            toPay: [this.course ? this.course.toPay : null, Validators.required],
            paid: [this.course ? this.course.paid : null],
            paymentMethods: [this.course ? this.course.paymentMethods : []],
        });

        this.patientGroupOptions = this.courseForm.controls.patient.valueChanges
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
        this.courseService.update(this.buildCourse()).subscribe(
            (next) => {
                this.router.navigate(['/courses']);
            },
            (error) => {
                this.dialogService.error(error);
                this.waiting = false;
            }
        );
    }

    private create() {
        this.courseService.create(this.buildCourse()).subscribe(
            (next) => {
                this.router.navigate(['/courses']);
            },
            (error) => {
                this.dialogService.error(error);
                this.waiting = false;
            }
        );
    }

    private buildCourse() {
        return new Course(
            this.course ? this.course._id : null,
            this.courseForm.controls.date.value,
            this.courseForm.controls.patient.value,
            this.courseForm.controls.training.value,
            this.courseForm.controls.toPay.value,
            this.courseForm.controls.paid.value,
            this.courseForm.controls.paymentMethods.value,
        );
    }

    private initTrainings() {
        return this.trainingService.getAll()
            .toPromise()
            .then((data) => {
                    this.trainings = data;
                    if (!this.editing) {
                        this.courseForm.controls.training.setValue(data[0]);
                    }
                },
                (error) => {
                    console.error(error);
                    this.dialogService.error(error, '/courses');
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
                    this.dialogService.error(error, '/courses');
                }
            );
    }
}
