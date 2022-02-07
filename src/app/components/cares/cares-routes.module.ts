import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CareEditorComponent} from './care-editor/care-editor.component';
import {AuthenticationGuard} from '@services/authentication.gard';

const routes: Routes = [
    {
        path: 'new',
        component: CareEditorComponent,
        canActivate: [AuthenticationGuard]
    },
    {
        path: ':id',
        component: CareEditorComponent,
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
export class CaresRoutingModule {

}
