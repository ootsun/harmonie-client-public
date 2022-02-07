import {Address} from "./address.model";

export class Patient {

  constructor(public _id: string,
              public lastName: string,
              public firstName: string,
              public phone: string,
              public mobile: string,
              public email: string,
              public subscriptionDate: string,
              public gender: string,
              public birthDate: string,
              public nbChildren: string,
              public job: string,
              public address: Address) {
  }
}

export function displayPatientFn(patient: Patient): string {
  return patient ? patient.lastName + ' ' + patient.firstName : '';
}