import { HelperService } from "@services/helper.service";
import { Patient } from "./patient.model";

export class PatientGroup {
    
    constructor(public letter: string, public patients: Patient[]){}
}
  
export const _filterPatient = (opt: Patient[], value: string, helperService: HelperService): Patient[] => {
    return opt.filter(patient => helperService.normalizeString(patient.lastName + " " + patient.firstName).toLowerCase().includes(helperService.normalizeString(value)));
};