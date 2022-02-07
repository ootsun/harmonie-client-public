import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CareTypeEditorComponent} from './care-type-editor/care-type-editor.component';
import {AuthenticationGuard} from '@services/authentication.gard';

const routes: Routes = [
    {
        path: 'new',
        component: CareTypeEditorComponent,
        canActivate: [AuthenticationGuard]
    },
    {
        path: ':id',
        component: CareTypeEditorComponent,
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
export class CareTypesRoutingModule {

}
