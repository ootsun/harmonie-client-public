import {HelperService} from '@services/helper.service';
import {Product} from './product.model';

export class ProductGroup {

    constructor(public letter: string, public products: Product[]) {
    }
}

export const _filterProduct = (opt: Product[], value: string, helperService: HelperService): Product[] => {
    return opt.filter(product => helperService.normalizeString(product.brand + ' - ' + product.title)
        .toLowerCase()
        .includes(helperService.normalizeString(value)));
};
