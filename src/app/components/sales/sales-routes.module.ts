import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SaleEditorComponent} from './sale-editor/sale-editor.component';
import {AuthenticationGuard} from '@services/authentication.gard';

const routes: Routes = [
    {
        path: 'new',
        component: SaleEditorComponent,
        canActivate: [AuthenticationGuard]
    },
    {
        path: ':id',
        component: SaleEditorComponent,
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
export class SalesRoutingModule {

}
