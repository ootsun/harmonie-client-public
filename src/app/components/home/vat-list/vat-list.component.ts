import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {Care} from '@models/care.model';
import {Course} from '@models/course.model';
import {Router} from '@angular/router';
import {DialogService} from '../../../shared/components/generic-dialog/dialog.service';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {DatePipe} from '@angular/common';
import {HelperService} from '@services/helper.service';
import {Sale} from '@models/sale.model';
import {VatService} from '@services/vat.service';
import {MatDialog} from '@angular/material/dialog';
import {SelectQuarterDialogComponent} from './select-quarter-dialog/select-quarter-dialog.component';
import {Vat} from '@models/vat.model';

@Component({
    templateUrl: './vat-list.component.html',
    styleUrls: ['./vat-list.component.scss'],
})
export class VatListComponent implements OnInit {
    displayedColumns: string[] = ['date', 'patient', 'title', 'toPay', 'actions'];
    dataSource: MatTableDataSource<Care | Sale | Course>;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    items: Array<Care | Sale | Course>;
    loading = true;
    displayDate: Date;

    constructor(
        private vatService: VatService,
        private router: Router,
        private dialogService: DialogService,
        private datePipe: DatePipe,
        private helperService: HelperService,
        private cdr: ChangeDetectorRef,
        public dialog: MatDialog
    ) {
        this.displayDate = new Date();
        this.displayDate.setDate(1);
        this.displayDate.setHours(0, 0, 0, 0);
    }

    ngOnInit() {
        this.vatService.getVat().subscribe(
            (data) => {
                this.items = [...data.cares, ...data.sales, ...data.courses];
                this.initDataSource();
            },
            (error) => {
                this.dialogService.error(error);
                this.loading = false;
            }
        );
    }

    applyFilter(filterValue: string) {
        this.dataSource.filter = filterValue
            ? this.helperService.normalizeString(filterValue)
            : '';

        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }

    getTitle(data: Care | Sale | Course): string {
        let title = '';
        if (data['type'] !== undefined) {
            title = data['type'].title;
        } else if (data['training'] !== undefined) {
            title = data['training'].title;
        } else {
            for (const saleLine of data['saleLines']) {
                if (title) {
                    title += ', ';
                }
                title += saleLine.product.title + ' [' + saleLine.quantity + ']';
            }
        }

        return title;
    }

    edit(item: Care | Sale) {
        if (item['type'] !== undefined) {
            this.router.navigate(['/cares/' + item._id]);
        } else if (item['training'] !== undefined) {
            this.router.navigate(['/courses/' + item._id]);
        } else {
            this.router.navigate(['/sales/' + item._id]);
        }
    }

    incrementDisplayDate(increment) {
        this.displayDate.setMonth(this.displayDate.getMonth() + increment);
        // view isn't updated otherwise
        this.displayDate = new Date(this.displayDate);
        this.dataSource.data = this.filterDataForDataSource();
    }

    onShowExportDialog() {
        this.dialog.open(SelectQuarterDialogComponent, {
            width: '400px',
            disableClose: true,
        }).afterClosed().subscribe(err => {
            this.dialogService.error(err);
        });
    }

    getTotalCares() {
        return this.dataSource.filteredData
            .filter(this.isCare())
            .map(i => this.getToPay(i))
            .reduce((acc, value) => acc + value, 0);
    }

    getTotalSales() {
        return this.dataSource.filteredData
            .filter(this.isSale())
            .map(i => this.getToPay(i))
            .reduce((acc, value) => acc + value, 0);
    }

    getTotalCourses() {
        return this.dataSource.filteredData
            .filter(this.isCourse())
            .map(i => this.getToPay(i))
            .reduce((acc, value) => acc + value, 0);
    }

    getTotalCaresFormatted() {
        return this.formatPrice(this.getTotalCares());
    }

    getTotalSalesFormatted() {
        return this.formatPrice(this.getTotalSales());
    }

    getTotalCoursesFormatted() {
        return this.formatPrice(this.getTotalCourses());
    }

    getTotalFormatted() {
        return this.formatPrice(this.getTotalCares() + this.getTotalSales() + this.getTotalCourses());
    }

    formatToPay(data: Care | Sale | Course) {
        return new Intl.NumberFormat('fr-BE', {
            style: 'currency',
            currency: 'EUR'
        }).format(this.getToPay(data));
    }

    private initDataSource() {
        this.dataSource = new MatTableDataSource(this.filterDataForDataSource());
        this.dataSource.filterPredicate = (data: Care | Sale | Course, filter: string) => this.includesFilter(data, filter);
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
                case 'title':
                    return this.helperService.normalizeString(this.getTitle(item)).toLocaleLowerCase();
                case 'toPay':
                    return this.getToPay(item);
                default:
                    const value = item[property];
                    return typeof value === 'string' ? value.toLocaleLowerCase() : value;
            }
        };
        this.dataSource.sort = this.sort;
    }

    private filterDataForDataSource() {
        return this.items
            .filter(i => new Date(i.date).getMonth() === this.displayDate.getMonth()
                && new Date(i.date).getFullYear() === this.displayDate.getFullYear());
    }

    private formatPrice(price) {
        return new Intl.NumberFormat('fr-BE', {style: 'currency', currency: 'EUR'}).format(price);
    }

    private isCare() {
        return i => i['type'] !== undefined;
    }

    private isSale() {
        return i => i['saleLines'] !== undefined;
    }

    private isCourse() {
        return i => i['training'] !== undefined;
    }

    private includesFilter(data: Care | Sale | Course, filter: string) {
        return this.helperService
                .normalizeString(
                    'Le ' +
                    this.datePipe.transform(
                        data.date,
                        'EEEE dd LLLL yyyy',
                        '',
                        'fr-BE'
                    )
                ).includes(filter) ||
            (
                this.helperService.normalizeString(data.patient.lastName) +
                ' ' +
                this.helperService.normalizeString(data.patient.firstName)
            ).includes(filter) ||
            this.helperService.normalizeString(this.getTitle(data)).includes(filter)
            || this.formatToPay(data).includes(filter);
    }

    private getToPay(data: Care | Sale | Course) {
        if (data['type'] !== undefined) {
            return (<Care>data).toPay;
        }
        if (data['training'] !== undefined) {
            return (<Course>data).toPay;
        }
        return Sale.computeTotalToPay(<Sale>data);
    }
}
