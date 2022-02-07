import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {DialogService} from '../../../shared/components/generic-dialog/dialog.service';
import {CareType} from '@models/care-type.model';
import {CareTypeService} from '@services/care-type.service';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {HelperService} from '@services/helper.service';

@Component({
    templateUrl: './care-type-list.component.html',
    styleUrls: ['./care-type-list.component.scss'],
})
export class CareTypeListComponent implements OnInit {
    displayedColumns: string[] = ['title', 'price', 'actions'];
    dataSource: MatTableDataSource<CareType>;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    careTypes: CareType[];
    loading = true;

    constructor(
        private careTypeService: CareTypeService,
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
        this.careTypeService.getAll().subscribe(
            (data) => {
                this.careTypes = data;
                this.initDataSource();
            },
            (error) => {
                this.dialogService.error(error);
                this.loading = false;
            }
        );
    }

    onAdd() {
        this.router.navigate(['care-types/new']);
    }

    edit(careType: CareType) {
        this.router.navigate(['care-types/' + careType._id]);
    }

    remove(careType: CareType) {
        this.dialogService
            .confirm(
                'Êtes-vous sûr de vouloir supprimer le type de soins "' +
                careType.title +
                '" ?'
            )
            .subscribe((next) => {
                if (next) {
                    this.loading = true;
                    this.careTypeService.delete(careType._id).subscribe(
                        () => {
                            this.careTypes.splice(
                                this.careTypes.findIndex((p) => p._id == careType._id),
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
        this.dataSource = new MatTableDataSource(this.careTypes);
        this.dataSource.filterPredicate = (data: CareType, filter: string) => {
            return (
                this.helperService.normalizeString(data.title).indexOf(filter) !== -1 ||
                new Intl.NumberFormat('fr-BE', { style: 'currency', currency: 'EUR' }).format(data.price).indexOf(filter) !== -1
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
