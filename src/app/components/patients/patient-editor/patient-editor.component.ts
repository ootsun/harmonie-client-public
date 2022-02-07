import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Patient } from "@models/patient.model";
import { ActivatedRoute, Router } from "@angular/router";
import { DialogService } from "../../../shared/components/generic-dialog/dialog.service";
import { PatientService } from "@services/patient.service";
import { Address } from "@models/address.model";

@Component({
  templateUrl: "./patient-editor.component.html",
  styleUrls: ["./patient-editor.component.scss"],
})
export class PatientEditorComponent implements OnInit {
  editing: boolean;
  waiting = true;

  patientForm: FormGroup;
  patient: Patient;
  maxDate = new Date();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialogService: DialogService,
    private patientService: PatientService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      if (params["id"]) {
        this.loadPatient(params["id"]);
      } else {
        this.buildForm();
      }
    });
  }

  onCancel() {
    this.router.navigate(["/patients"]);
  }

  onSave() {
    this.waiting = true;
    if (this.editing) {
      this.update();
    } else {
      this.create();
    }
  }

  private loadPatient(patientId: string) {
    this.editing = true;
    this.patientService.get(patientId).subscribe(
      (data) => {
        this.patient = data;
        this.buildForm();
      },
      (error) => {
        console.error(error);
        this.dialogService.error(error, "/patients");
      }
    );
  }

  private buildForm() {
    this.patientForm = this.formBuilder.group({
      lastName: [
        this.patient ? this.patient.lastName : null,
        Validators.required,
      ],
      firstName: [
        this.patient ? this.patient.firstName : null,
        Validators.required,
      ],
      phone: [this.patient ? this.patient.phone : null],
      mobile: [this.patient ? this.patient.mobile : null],
      email: [this.patient ? this.patient.email : null, Validators.email],
      subscriptionDate: [
        {
          value: this.patient ? this.patient.subscriptionDate : new Date(),
          disabled: true,
        },
        Validators.required,
      ],
      gender: [
        this.patient ? this.patient.gender : "Femme",
        Validators.required,
      ],
      birthDate: [
        { value: this.patient ? this.patient.birthDate : null, disabled: true },
      ],
      nbChildren: [this.patient ? this.patient.nbChildren : null],
      job: [this.patient ? this.patient.job : null],
      country: [this.patient ? this.patient.address.country : null],
      zipCode: [
        this.patient ? this.patient.address.zipCode : null,
        Validators.pattern("[1-9][0-9]{3,4}"),
      ],
      city: [this.patient ? this.patient.address.city : null],
      street: [this.patient ? this.patient.address.street : null],
      number: [this.patient ? this.patient.address.number : null],
    });
    this.waiting = false;
  }

  private update() {
    this.patientService.update(this.buildPatient()).subscribe(
      (next) => {
        this.router.navigate(["/patients"]);
      },
      (error) => {
        this.dialogService.error(error);
        this.waiting = false;
      }
    );
  }

  private create() {
    this.patientService.create(this.buildPatient()).subscribe(
      (next) => {
        this.router.navigate(["/patients"]);
      },
      (error) => {
        this.dialogService.error(error);
        this.waiting = false;
      }
    );
  }

  private buildPatient() {
    return new Patient(
      this.patient ? this.patient._id : null,
      this.patientForm.controls.lastName.value,
      this.patientForm.controls.firstName.value,
      this.patientForm.controls.phone.value,
      this.patientForm.controls.mobile.value,
      this.patientForm.controls.email.value,
      this.patientForm.controls.subscriptionDate.value,
      this.patientForm.controls.gender.value,
      this.patientForm.controls.birthDate.value,
      this.patientForm.controls.nbChildren.value,
      this.patientForm.controls.job.value,
      new Address(
        this.patientForm.controls.country.value,
        this.patientForm.controls.zipCode.value,
        this.patientForm.controls.city.value,
        this.patientForm.controls.street.value,
        this.patientForm.controls.number.value
      )
    );
  }
}
