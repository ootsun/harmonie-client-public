import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {Care} from '@models/care.model';
import {CareService} from '@services/care.service';
import {Router} from '@angular/router';
import {DialogService} from '../../../shared/components/generic-dialog/dialog.service';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {DatePipe} from '@angular/common';
import {HelperService} from '@services/helper.service';

@Component({
    templateUrl: './care-list.component.html',
    styleUrls: ['./care-list.component.scss'],
})
export class CareListComponent implements OnInit {
    displayedColumns: string[] = ['date', 'patient', 'type', 'paid', 'toPay', 'actions'];
    dataSource: MatTableDataSource<Care>;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    cares: Care[];
    loading = true;

    constructor(
        private careService: CareService,
        private router: Router,
        private dialogService: DialogService,
        private datePipe: DatePipe,
        private helperService: HelperService,
        private cdr: ChangeDetectorRef,
    ) {
    }

    ngOnInit() {
        this.careService.getAll().subscribe(
            (data) => {
                this.cares = data;
                this.initDataSource();
            },
            (error) => {
                this.dialogService.error(error);
                this.loading = false;
            }
        );
    }

    onAdd() {
        this.router.navigate(['cares/new']);
    }

    remove(care: Care) {
        this.dialogService
            .confirm(
                'Êtes-vous sûr de vouloir supprimer le soin du "' +
                this.datePipe.transform(care.date, 'EEEE dd LLLL yyyy', '', 'fr-BE') +
                '" de "' +
                care.patient.lastName +
                ' ' +
                care.patient.firstName +
                '" ?'
            )
            .subscribe((next) => {
                if (next) {
                    this.loading = true;
                    this.careService.delete(care._id).subscribe(
                        () => {
                            this.cares.splice(
                                this.cares.findIndex((c) => c._id === care._id),
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

    edit(care: Care) {
        this.router.navigate(['cares/' + care._id]);
    }

    pay(care: Care) {
        this.dialogService
            .confirm(
                'Êtes-vous sûr que le soin du "' +
                this.datePipe.transform(care.date, 'EEEE dd LLLL yyyy', '', 'fr-BE') +
                '" de "' +
                care.patient.lastName +
                ' ' +
                care.patient.firstName +
                '" a bien été payé?'
            )
            .subscribe((next) => {
                if (next) {
                    this.loading = true;
                    const oldValue = care.paid;
                    care.paid = care.toPay;
                    this.careService.update(care).subscribe(
                        () => {
                            this.loading = false;
                        },
                        (error) => {
                            this.dialogService.error(error);
                            care.paid = oldValue;
                            this.loading = false;
                        }
                    );
                }
            });
    }

    getRemaingToPayFormatted(care: Care) {
        const remaining = care.toPay - care.paid;
        return 'Reste ' + new Intl.NumberFormat('fr-BE', {
            style: 'currency',
            currency: 'EUR'
        }).format(remaining) + ' à payer';
    }

    private initDataSource() {
        this.dataSource = new MatTableDataSource(this.cares);
        this.dataSource.filterPredicate = (data: Care, filter: string) => {
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
                this.helperService.normalizeString(data.type.title).indexOf(filter) !==
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
                case 'type':
                    return this.helperService.normalizeString(item.type.title).toLocaleLowerCase();
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
