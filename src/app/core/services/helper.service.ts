import {Injectable} from '@angular/core';
import {Patient} from '@models/patient.model';
import {PatientGroup} from '@models/patient-group.model';
import {Product} from '@models/product.model';
import {ProductGroup} from '@models/product-group.model';

@Injectable({
    providedIn: 'root',
})
export class HelperService {
    constructor() {
    }

    normalizeString(s: string) {
        return s
            .normalize('NFD')
            .trim()
            .toLowerCase()
            .replace(/[\u0300-\u036f]/g, '');
    }

    buildEntityGroups(entities: Array<Patient | Product>,
                      groupProperty: string,
                      firstLetter: boolean,
                      displayFn: Function): Array<PatientGroup | ProductGroup> {

        const entitiesMap: Map<string, Array<Patient | Product>> = new Map();
        const groups: Array<PatientGroup | ProductGroup> = [];

        for (const entity of entities) {
            const key = this.getKey(entity, groupProperty, firstLetter);
            if (entitiesMap.has(key)) {
                entitiesMap.get(key)
                    .push(entity);
            } else {
                entitiesMap.set(key, new Array<Patient | Product>(entity));
            }
        }

        const letters: string[] = Array.from(entitiesMap.keys()).sort((a, b) => a.localeCompare(b));
        for (const letter of letters) {
            if (entities[0].hasOwnProperty('lastName')) {
                groups.push(new PatientGroup(
                    letter,
                    entitiesMap.get(letter)
                        .sort((a, b) => displayFn(a).toUpperCase().localeCompare(displayFn(b).toUpperCase())) as Patient[]));
            } else {
                groups.push(new ProductGroup(
                    letter,
                    entitiesMap.get(letter)
                        .sort((a, b) => displayFn(a).toUpperCase().localeCompare(displayFn(b).toUpperCase())) as Product[]));
            }
        }

        return groups;
    }

    private getKey(entity: Patient | Product, groupProperty: string, firstLetter: boolean): string {
        if (firstLetter) {
            return entity[groupProperty][0].toUpperCase();
        }
        return entity[groupProperty][0].toUpperCase() + entity[groupProperty].slice(1);
    }
}
