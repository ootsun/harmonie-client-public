import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {PatientEditorComponent} from './patient-editor/patient-editor.component';
import {AuthenticationGuard} from '@services/authentication.gard';

const routes: Routes = [
    {
        path: 'new',
        component: PatientEditorComponent,
        canActivate: [AuthenticationGuard]
    },
    {
        path: ':id',
        component: PatientEditorComponent,
        canActivate: [AuthenticationGuard]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
    providers: [
        AuthenticationGuard
    ]
})
export class PatientsRoutingModule {

}
