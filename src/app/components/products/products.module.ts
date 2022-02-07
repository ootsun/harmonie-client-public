import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ProductEditorComponent, SnackBarUpdatedStockComponent} from './product-editor/product-editor.component';
import {ProductsRoutingModule} from './products-routes.module';
import {SharedModule} from '../../shared/shared.module';

@NgModule({
    declarations: [
        ProductEditorComponent,
        SnackBarUpdatedStockComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        ProductsRoutingModule
    ]
})
export class ProductsModule {
}
