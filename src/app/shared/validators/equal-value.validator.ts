import { FormGroup, ValidatorFn } from '@angular/forms';

export function equalValueValidator(targetKey: string, toMatchKey: string, message: string): ValidatorFn {
  return (group: FormGroup): {[key: string]: any} => {
    try {
      const target = group.controls[targetKey];
      const toMatch = group.controls[toMatchKey];
      const isMatch = target.value === toMatch.value;
      if (!isMatch && target.valid && toMatch.valid) {
        toMatch.setErrors({equalValue: targetKey});
        return {'equalValue': message};
      }
      if (isMatch && toMatch.hasError('equalValue')) {
        toMatch.setErrors(null);
      }
    } catch (e) {
      // Catch error because group.controls[targetKey]; throw on error when form isn't initialized yet
    }

    return null;
  };
}
