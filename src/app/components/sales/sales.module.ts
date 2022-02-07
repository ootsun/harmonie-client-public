import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SaleEditorComponent} from './sale-editor/sale-editor.component';
import {SalesRoutingModule} from './sales-routes.module';
import {SharedModule} from '../../shared/shared.module';
import {FormsModule} from '@angular/forms';
import {SnackBarUpdatedPriceComponent} from '../sales/sale-editor/sale-editor.component';

@NgModule({
    declarations: [
        SaleEditorComponent,
        SnackBarUpdatedPriceComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        SalesRoutingModule,
        FormsModule
    ]
})
export class SalesModule {
}
