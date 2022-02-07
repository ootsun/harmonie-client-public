import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PatientEditorComponent} from "./patient-editor/patient-editor.component";
import {PatientsRoutingModule} from "./patients-routes.module";
import {SharedModule} from "../../shared/shared.module";
import {FormsModule} from "@angular/forms";

@NgModule({
  declarations: [
    PatientEditorComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    PatientsRoutingModule,
    FormsModule
  ]
})
export class PatientsModule { }
