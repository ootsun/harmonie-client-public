import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {DialogService} from '../../../shared/components/generic-dialog/dialog.service';
import {Product} from '@models/product.model';
import {ProductService} from '@services/product.service';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {HelperService} from '@services/helper.service';
import {SelectYearDialogComponent} from './select-year-dialog/select-year-dialog.component';
import {MatDialog} from '@angular/material/dialog';

@Component({
    templateUrl: './product-list.component.html',
    styleUrls: ['./product-list.component.scss'],
})
export class ProductListComponent implements OnInit {
    displayedColumns: string[] = ['title', 'brand', 'price', 'stock', 'actions'];
    dataSource: MatTableDataSource<Product>;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    products: Product[];
    loading = true;

    constructor(
        private productService: ProductService,
        private router: Router,
        private dialogService: DialogService,
        private helperService: HelperService,
        private cdr: ChangeDetectorRef,
        public dialog: MatDialog
    ) {
    }

    ngOnInit() {
        this.productService.getAll().subscribe(
            (data) => {
                this.products = data;
                this.initDataSource();
            },
            (error) => {
                this.dialogService.error(error);
                this.loading = false;
            }
        );
    }

    onAdd() {
        this.router.navigate(['products/new']);
    }

    edit(product: Product) {
        this.router.navigate(['products/' + product._id]);
    }

    remove(product: Product) {
        this.dialogService
            .confirm(
                'Êtes-vous sûr de vouloir supprimer le produit "' +
                product.title +
                '" ?'
            )
            .subscribe((next) => {
                if (next) {
                    this.loading = true;
                    this.productService.delete(product._id).subscribe(
                        () => {
                            this.products.splice(
                                this.products.findIndex((p) => p._id === product._id),
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

    openExportLossesDialog() {
        this.dialog.open(SelectYearDialogComponent, {
            width: '400px',
            disableClose: true,
        }).afterClosed().subscribe(err => {
            this.dialogService.error(err);
        });
    }

    private initDataSource() {
        this.dataSource = new MatTableDataSource(this.products);
        this.dataSource.filterPredicate = (data: Product, filter: string) => {
            return (
                this.helperService.normalizeString(data.title).indexOf(filter) !== -1 ||
                this.helperService.normalizeString(data.brand).indexOf(filter) !== -1 ||
                new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(data.price).indexOf(filter) !== -1 ||
                ('' + data.stock).indexOf(filter) !== -1
            );
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
