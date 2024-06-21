import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  credentials = this.formBuilder.nonNullable.group({
    email: ['zeshan@gmail.com', [Validators.required, Validators.email]],
    password: ['password', Validators.required],
  });

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private router: Router
  ) {
    this.authService.getCurrentUser().subscribe((user) => {
      if (user) {
        console.log('USER ON LOGIN PAGE', user);
        this.router.navigateByUrl('/groups');
      }
    });
  }

  get email() {
    return this.credentials.controls.email;
  }

  get password() {
    return this.credentials.controls.password;
  }

  async login() {
    const loading = await this.loadingController.create();
    await loading.present();

    const result = await this.authService.signIn(
      this.credentials.getRawValue()
    );
    loading.dismiss();
    if (result.error) {
      this.showAlert(result.error.name, result.error.message);
    }
  }

  async showAlert(title: string, message: string) {
    const alert = await this.alertController.create({
      header: title,
      mode: 'ios',
      message,
      buttons: ['OK'],
    });
    alert.present();
  }

  async getMagicLink() {
    await (
      await this.alertController.create({
        header: 'Get a magic link',
        message: 'We will send you a link to magically login!',
        inputs: [
          {
            type: 'email',
            name: 'email',
          },
        ],
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
          },
          {
            text: 'Get magic link',
            handler: async (result) => {
              const loading = await this.loadingController.create();
              await loading.present();
              const { error } = await this.authService.signInWithEmail(
                result.email
              );
              await loading.dismiss();

              if (error) {
                this.showAlert('Failed', error.message);
              } else {
                this.showAlert('Success', 'Please check your emails!');
              }
            },
          },
        ],
      })
    ).present();
  }

  async forgotPassword() {
    await (
      await this.alertController.create({
        header: 'Receive a new password',
        message: 'Please insert your email',
        inputs: [
          {
            type: 'email',
            name: 'email',
          },
        ],
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
          },
          {
            text: 'Reset password',
            handler: async (result) => {
              const loading = await this.loadingController.create();
              await loading.present();
              const { error } = await this.authService.sendPasswordReset(
                result.email
              );
              await loading.dismiss();

              if (error) {
                this.showAlert('Failed', error.message);
              } else {
                this.showAlert('Success', 'Please check your emails!');
              }
            },
          },
        ],
      })
    ).present();
  }

  async withFacebook() {
    const result = await this.authService.facebookAuth();
    if (result.error) {
      this.showAlert(result.error.name, result.error.message);
    }
  }

  async withGoogle() {
    const result = await this.authService.googleAuth();
    if (result.error) {
      this.showAlert(result.error.name, result.error.message);
    }
  }

  ngOnInit() {}
}
