import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CareEditorComponent} from './care-editor/care-editor.component';
import {CaresRoutingModule} from './cares-routes.module';
import {SharedModule} from '../../shared/shared.module';

@NgModule({
  declarations: [
    CareEditorComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    CaresRoutingModule
  ]
})
export class CaresModule { }
