import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TrainingEditorComponent} from './training-editor/training-editor.component';
import {TrainingsRoutingModule} from './trainings-routes.module';
import {SharedModule} from '../../shared/shared.module';

@NgModule({
  declarations: [
    TrainingEditorComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    TrainingsRoutingModule
  ]
})
export class TrainingsModule {
}
