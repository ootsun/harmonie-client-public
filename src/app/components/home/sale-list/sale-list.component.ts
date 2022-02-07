import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {Sale} from '@models/sale.model';
import {SaleService} from '@services/sale.service';
import {Router} from '@angular/router';
import {DialogService} from '../../../shared/components/generic-dialog/dialog.service';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {DatePipe} from '@angular/common';
import {HelperService} from '@services/helper.service';

@Component({
    templateUrl: './sale-list.component.html',
    styleUrls: ['./sale-list.component.scss'],
})
export class SaleListComponent implements OnInit {
    displayedColumns: string[] = ['date', 'patient', 'paid', 'toPay', 'actions'];
    dataSource: MatTableDataSource<Sale>;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    sales: Sale[];
    loading = true;

    constructor(
        private saleService: SaleService,
        private router: Router,
        private dialogService: DialogService,
        private datePipe: DatePipe,
        private helperService: HelperService,
        private cdr: ChangeDetectorRef,
    ) {
    }

    ngOnInit() {
        this.fetchSales();
    }

    onAdd() {
        this.router.navigate(['sales/new']);
    }

    remove(sale: Sale) {
        this.dialogService
            .confirm(
                'Êtes-vous sûr de vouloir supprimer la vente du "' +
                this.datePipe.transform(sale.date, 'EEEE dd LLLL yyyy', '', 'fr-BE') +
                '" à "' +
                sale.patient.lastName +
                ' ' +
                sale.patient.firstName +
                '" ?'
            )
            .subscribe((next) => {
                if (next) {
                    this.loading = true;
                    this.saleService.delete(sale._id).subscribe(
                        () => {
                            this.sales.splice(
                                this.sales.findIndex((c) => c._id === sale._id),
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

    edit(sale: Sale) {
        this.router.navigate(['sales/' + sale._id]);
    }

    pay(sale: Sale) {
        this.dialogService
            .confirm(
                'Êtes-vous sûr que la vente du "' +
                this.datePipe.transform(sale.date, 'EEEE dd LLLL yyyy', '', 'fr-BE') +
                '" à "' +
                sale.patient.lastName +
                ' ' +
                sale.patient.firstName +
                '" a bien été payée?'
            )
            .subscribe((next) => {
                if (next) {
                    this.loading = true;
                    sale.saleLines.forEach(sl => sl.paid = sl.toPay);
                    this.saleService.update(sale).subscribe(
                        () => {
                            this.loading = false;
                        },
                        (error) => {
                            this.dialogService.error(error);
                            this.fetchSales();
                        }
                    );
                }
            });
    }

    isPaid(sale: Sale) {
        return !sale.saleLines.some(sl => sl.paid < sl.toPay);
    }

    getRemaingToPayFormatted(sale: Sale) {
        const remaining = sale.saleLines.reduce((acc, value) => acc + value.toPay - value.paid, 0);
        return 'Reste ' + new Intl.NumberFormat('fr-BE', {
            style: 'currency',
            currency: 'EUR'
        }).format(remaining) + ' à payer';
    }

    private fetchSales() {
        this.saleService.getAll().subscribe(
            (data) => {
                this.sales = data;
                this.initDataSource();
            },
            (error) => {
                this.dialogService.error(error);
                this.loading = false;
            }
        );
    }

    private initDataSource() {
        this.dataSource = new MatTableDataSource(this.sales);
        this.dataSource.filterPredicate = this.filterPredicate;
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
                case 'toPay':
                    return Sale.computeTotalToPay(item);
                default:
                    const value = item[property];
                    return typeof value === 'string' ? value.toLocaleLowerCase() : value;
            }
        };
        this.dataSource.sort = this.sort;
    }

    private filterPredicate = (data: Sale, filter: string) =>
        this.helperService
            .normalizeString(
                'Le ' +
                this.datePipe.transform(
                    data.date,
                    'EEEE dd LLLL yyyy',
                    '',
                    'fr-BE')).includes(filter)
        || (this.helperService.normalizeString(data.patient.lastName) +
            ' ' +
            this.helperService.normalizeString(data.patient.firstName)).includes(filter)
        || (this.isPaid(data) ? 'oui' : 'non').includes(filter)
        || Sale.computeTotalToPayFormatted(data).includes(filter)

    applyFilter(filterValue: string) {
        this.dataSource.filter = filterValue
            ? this.helperService.normalizeString(filterValue)
            : '';

        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }

    computeTotalToPayFormatted(sale: Sale) {
        return Sale.computeTotalToPayFormatted(sale);
    }
}
