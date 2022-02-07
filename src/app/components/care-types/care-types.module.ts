import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CareTypeEditorComponent} from './care-type-editor/care-type-editor.component';
import {CareTypesRoutingModule} from './care-types-routes.module';
import {SharedModule} from '../../shared/shared.module';

@NgModule({
  declarations: [
    CareTypeEditorComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    CareTypesRoutingModule
  ]
})
export class CareTypesModule {
}
