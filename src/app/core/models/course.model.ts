import {Patient} from './patient.model';
import {Training} from '@models/training.model';

export class Course {

  constructor(public _id: string,
              public date: Date,
              public patient: Patient,
              public training: Training,
              public toPay: number,
              public paid: number,
              public paymentMethods: string) {
  }
}
