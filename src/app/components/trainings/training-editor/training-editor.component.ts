import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Training} from '@models/training.model';
import {ActivatedRoute, Router} from '@angular/router';
import {DialogService} from '../../../shared/components/generic-dialog/dialog.service';
import {TrainingService} from '@services/training.service';

@Component({
  templateUrl: './training-editor.component.html',
  styleUrls: ['./training-editor.component.scss'],
})
export class TrainingEditorComponent implements OnInit {

  editing: boolean;
  waiting = true;

  trainingForm: FormGroup;
  training: Training;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialogService: DialogService,
    private trainingService: TrainingService,
    private formBuilder: FormBuilder
  ) {
  }

  ngOnInit() {
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.loadTraining(params['id']);
      } else {
        this.buildForm();
      }
    });
  }

  onCancel() {
    this.router.navigate(['/trainings']);
  }

  onSave() {
    this.waiting = true;
    if (this.editing) {
      this.update();
    } else {
      this.create();
    }
  }

  private loadTraining(trainingId: string) {
    this.editing = true;
    this.trainingService.get(trainingId).subscribe(
      (data) => {
        this.training = data;
        this.buildForm();
      },
      (error) => {
        console.error(error);
        this.dialogService.error(error, '/trainings');
      }
    );
  }

  private buildForm() {
    this.trainingForm = this.formBuilder.group({
      title: [this.training ? this.training.title : null, Validators.required],
    });
    this.waiting = false;
  }

  private update() {
    this.trainingService.update(this.buildTraining()).subscribe(
      (next) => {
        this.router.navigate(['/trainings']);
      },
      (error) => {
        this.dialogService.error(error);
        this.waiting = false;
      }
    );
  }

  private create() {
    this.trainingService.create(this.buildTraining()).subscribe(
      (next) => {
        this.router.navigate(['/trainings']);
      },
      (error) => {
        this.dialogService.error(error);
        this.waiting = false;
      }
    );
  }

  private buildTraining() {
    return new Training(
      this.training ? this.training._id : null,
      this.trainingForm.controls.title.value,
    );
  }
}
