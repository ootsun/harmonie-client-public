import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {Course} from '@models/course.model';
import {CourseService} from '@services/course.service';
import {Router} from '@angular/router';
import {DialogService} from '../../../shared/components/generic-dialog/dialog.service';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {DatePipe} from '@angular/common';
import {HelperService} from '@services/helper.service';

@Component({
    templateUrl: './course-list.component.html',
    styleUrls: ['./course-list.component.scss'],
})
export class CourseListComponent implements OnInit {
    displayedColumns: string[] = ['date', 'patient', 'training', 'paid', 'toPay', 'actions'];
    dataSource: MatTableDataSource<Course>;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    courses: Course[];
    loading = true;

    constructor(
        private courseService: CourseService,
        private router: Router,
        private dialogService: DialogService,
        private datePipe: DatePipe,
        private helperService: HelperService,
        private cdr: ChangeDetectorRef,
    ) {
    }

    ngOnInit() {
        this.courseService.getAll().subscribe(
            (data) => {
                this.courses = data;
                this.initDataSource();
            },
            (error) => {
                this.dialogService.error(error);
                this.loading = false;
            }
        );
    }

    onAdd() {
        this.router.navigate(['courses/new']);
    }

    remove(course: Course) {
        this.dialogService
            .confirm(
                'Êtes-vous sûr de vouloir supprimer le cours du "' +
                this.datePipe.transform(course.date, 'EEEE dd LLLL yyyy', '', 'fr-BE') +
                '" de "' +
                course.patient.lastName +
                ' ' +
                course.patient.firstName +
                '" ?'
            )
            .subscribe((next) => {
                if (next) {
                    this.loading = true;
                    this.courseService.delete(course._id).subscribe(
                        () => {
                            this.courses.splice(
                                this.courses.findIndex((c) => c._id === course._id),
                                1
                            );
                            this.initDataSource();
                            this.loading = false;
                        },
                        (error) => {
                            this.dialogService.error(error);
                            this.loading = false;
                        }
                    );
                }
            });
    }

    edit(course: Course) {
        this.router.navigate(['courses/' + course._id]);
    }

    pay(course: Course) {
        this.dialogService
            .confirm(
                'Êtes-vous sûr que le cours du "' +
                this.datePipe.transform(course.date, 'EEEE dd LLLL yyyy', '', 'fr-BE') +
                '" de "' +
                course.patient.lastName +
                ' ' +
                course.patient.firstName +
                '" a bien été payé?'
            )
            .subscribe((next) => {
                if (next) {
                    this.loading = true;
                    const oldValue = course.paid;
                    course.paid = course.toPay;
                    this.courseService.update(course).subscribe(
                        () => {
                            this.loading = false;
                        },
                        (error) => {
                            this.dialogService.error(error);
                            course.paid = oldValue;
                            this.loading = false;
                        }
                    );
                }
            });
    }

    getRemaingToPayFormatted(course: Course) {
        const remaining = course.toPay - course.paid;
        return 'Reste ' + new Intl.NumberFormat('fr-BE', {
            style: 'currency',
            currency: 'EUR'
        }).format(remaining) + ' à payer';
    }

    private initDataSource() {
        this.dataSource = new MatTableDataSource(this.courses);
        this.dataSource.filterPredicate = (data: Course, filter: string) => {
            return (
                this.helperService
                    .normalizeString(
                        'Le ' +
                        this.datePipe.transform(
                            data.date,
                            'EEEE dd LLLL yyyy',
                            '',
                            'fr-BE'
                        )
                    )
                    .indexOf(filter) !== -1 ||
                (
                    this.helperService.normalizeString(data.patient.lastName) +
                    ' ' +
                    this.helperService.normalizeString(data.patient.firstName)
                ).indexOf(filter) !== -1 ||
                this.helperService.normalizeString(data.training.title).indexOf(filter) !==
                -1 ||
                (data.toPay - data.paid === 0 ? 'oui' : 'non').indexOf(filter) !== -1
            );
        };
        // https://stackoverflow.com/questions/48785965/angular-matpaginator-doesnt-get-initialized
        this.loading = false;
        this.cdr.detectChanges();
        this.dataSource.paginator = this.paginator;
        this.dataSource.sortingDataAccessor = (item, property) => {
            switch (property) {
                case 'patient':
                    return this.helperService.normalizeString(
                        item.patient.lastName + ' ' + item.patient.firstName
                    ).toLocaleLowerCase();
                case 'training':
                    return this.helperService.normalizeString(item.training.title).toLocaleLowerCase();
                default:
                    const value = item[property];
                    return typeof value === 'string' ? value.toLocaleLowerCase() : value;
            }
        };
        this.dataSource.sort = this.sort;
    }

    applyFilter(filterValue: string) {
        this.dataSource.filter = filterValue
            ? this.helperService.normalizeString(filterValue)
            : '';

        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }
}
