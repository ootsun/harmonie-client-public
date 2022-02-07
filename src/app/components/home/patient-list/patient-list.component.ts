import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {Patient} from "@models/patient.model";
import {PatientService} from "@services/patient.service";
import {Router} from "@angular/router";
import {DialogService} from "../../../shared/components/generic-dialog/dialog.service";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {MatTableDataSource} from "@angular/material/table";
import {HelperService} from "@services/helper.service";
import * as fileSaver from "file-saver";

@Component({
  templateUrl: "./patient-list.component.html",
  styleUrls: ["./patient-list.component.scss"],
})
export class PatientListComponent implements OnInit {
  displayedColumns: string[] = ["fullName", "phone", "email", "actions"];
  dataSource: MatTableDataSource<Patient>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  patients: Patient[];
  loading = true;

  constructor(
    private patientService: PatientService,
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
    this.patientService.getAll().subscribe(
      (data) => {
        this.patients = data;
        this.initDataSource();
      },
      (error) => {
        this.dialogService.error(error);
        this.loading = false;
      }
    );
  }

  onAdd() {
    this.router.navigate(["patients/new"]);
  }

  remove(patient: Patient) {
    this.dialogService
      .confirm(
        'Êtes-vous sûr de vouloir supprimer le patient "' +
        patient.lastName +
        " " +
        patient.firstName +
        '" ?'
      )
      .subscribe((next) => {
        if (next) {
          this.loading = true;
          this.patientService.delete(patient._id).subscribe(
            () => {
              this.patients.splice(
                this.patients.findIndex((p) => p._id == patient._id),
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

  edit(patient: Patient) {
    this.router.navigate(["patients/" + patient._id]);
  }

  private initDataSource() {
    this.dataSource = new MatTableDataSource(this.patients);
    this.dataSource.filterPredicate = (data: Patient, filter: string) => {
      return (
        (
          this.helperService.normalizeString(data.lastName) +
          " " +
          this.helperService.normalizeString(data.firstName)
        ).indexOf(filter) != -1 ||
        (data.phone &&
          this.helperService.normalizeString(data.phone).indexOf(filter) !=
          -1) ||
        (data.mobile &&
          this.helperService.normalizeString(data.mobile).indexOf(filter) !=
          -1) ||
        (data.email &&
          this.helperService.normalizeString(data.email).indexOf(filter) != -1)
      );
    };
    // https://stackoverflow.com/questions/48785965/angular-matpaginator-doesnt-get-initialized
    this.loading = false;
    this.cdr.detectChanges();
    this.dataSource.paginator = this.paginator;
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'fullName':
          return this.helperService.normalizeString(
            item.lastName + ' ' + item.firstName
          ).toLocaleLowerCase();
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
