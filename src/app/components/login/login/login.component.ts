import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {DialogService} from '../../../shared/components/generic-dialog/dialog.service';
import {AuthenticationService} from '@services/authentication.service';
import {SecurityService} from '@services/security.service';
import {Router} from '@angular/router';
import {AppConfigService} from '@services/app-config.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

    loginForm: FormGroup;
    waiting: boolean;

    constructor(
        private formBuilder: FormBuilder,
        private dialogService: DialogService,
        private authenticationService: AuthenticationService,
        private securityService: SecurityService,
        private router: Router,
        private appConfigService: AppConfigService) {
    }

    ngOnInit() {
        this.buildForm();
    }

    onLogin() {
        this.waiting = true;
        this.authenticationService.login(this.loginForm.controls.email.value, this.loginForm.controls.password.value).subscribe(
            (data) => {
                if (data.token) {
                    this.securityService.storeToken(data.token);
                    this.router.navigate(['/']);
                }
            },
            (error) => {
                if (error?.error) {
                    if (error.error.message === 'No valid entry found for provided email') {
                        this.loginForm.controls.email.setErrors({incorrect: true});
                    } else if (error.error.message === 'Provided email and password do not match') {
                        this.loginForm.controls.password.setErrors({incorrect: true});
                    } else if (error.error.message === 'Failed login maximum number of attempts reached') {
                        this.dialogService.error('Le nombre maximal de tentatives a été atteint. Veuillez contacter l\'administrateur afin de débloquer votre compte');
                    } else {
                        this.dialogService.error(error);
                    }
                } else {
                    this.dialogService.error(error);
                }
                this.waiting = false;
            }
        );
    }

    onKeyDown($event) {
        if ($event.code === 'Enter') {
            this.onLogin();
        }
    }

    private buildForm() {
        this.loginForm = this.formBuilder.group({
            email: [
                this.appConfigService.defaultLoginEmail,
                [Validators.required, Validators.email],
            ],
            password: [
                null,
                Validators.required,
            ],
        });
        // If the backend returns an error (incorrect email or pwd) we show an error.
        // But we also must hide the error if the other field is edited.
        this.loginForm.controls.password.valueChanges.subscribe(
            () => {
                if (this.loginForm.controls.email.hasError('incorrect')) {
                    this.loginForm.controls.email.updateValueAndValidity();
                }
            });
        this.loginForm.controls.email.valueChanges.subscribe(
            () => {
                if (this.loginForm.controls.password.hasError('incorrect')) {
                    this.loginForm.controls.password.updateValueAndValidity();
                }
            });
    }
}
