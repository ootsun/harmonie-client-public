import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {DialogService} from '../../../shared/components/generic-dialog/dialog.service';
import {Training} from '@models/training.model';
import {TrainingService} from '@services/training.service';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {HelperService} from '@services/helper.service';

@Component({
    templateUrl: './training-list.component.html',
    styleUrls: ['./training-list.component.scss'],
})
export class TrainingListComponent implements OnInit {
    displayedColumns: string[] = ['title', 'actions'];
    dataSource: MatTableDataSource<Training>;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    trainings: Training[];
    loading = true;

    constructor(
        private trainingService: TrainingService,
        private router: Router,
        private dialogService: DialogService,
        private helperService: HelperService,
        private cdr: ChangeDetectorRef,
    ) {
    }

    ngOnInit() {
        this.init();
    }

    private init() {
        this.trainingService.getAll().subscribe(
            (data) => {
                this.trainings = data;
                this.initDataSource();
            },
            (error) => {
                this.dialogService.error(error);
                this.loading = false;
            }
        );
    }

    onAdd() {
        this.router.navigate(['trainings/new']);
    }

    edit(training: Training) {
        this.router.navigate(['trainings/' + training._id]);
    }

    remove(training: Training) {
        this.dialogService
            .confirm(
                'Êtes-vous sûr de vouloir supprimer la formation "' +
                training.title +
                '" ?'
            )
            .subscribe((next) => {
                if (next) {
                    this.loading = true;
                    this.trainingService.delete(training._id).subscribe(
                        () => {
                            this.trainings.splice(
                                this.trainings.findIndex((p) => p._id === training._id),
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

    applyFilter(filterValue: string) {
        this.dataSource.filter = filterValue
            ? this.helperService.normalizeString(filterValue)
            : '';

        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }

    private initDataSource() {
        this.dataSource = new MatTableDataSource(this.trainings);
        this.dataSource.filterPredicate = (data: Training, filter: string) => {
            return this.helperService.normalizeString(data.title).indexOf(filter) !== -1;
        };
        // https://stackoverflow.com/questions/48785965/angular-matpaginator-doesnt-get-initialized
        this.loading = false;
        this.cdr.detectChanges();
        this.dataSource.paginator = this.paginator;
        this.dataSource.sortingDataAccessor = (item: any, property: string): string => {
            const value = item[property];
            return typeof value === 'string' ? value.toLocaleLowerCase() : value;
        };
        this.dataSource.sort = this.sort;
    }
}
