import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AlertController, LoadingController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  credentials = this.formBuilder.nonNullable.group({
    email: ['zeshan@gmail.com', [Validators.required, Validators.email]],
    password: ['password', Validators.required],
  });

  constructor(
    private formBuilder: FormBuilder,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private authService: AuthService
  ) {}

  getMagicLink() {}
  withGoogle() {}
  withFacebook() {}

  async signUp() {
    const loading = await this.loadingController.create();
    await loading.present();

    const result = await this.authService.signUp(
      this.credentials.getRawValue()
    );
    
    loading.dismiss();
    if (result.error) {
      this.showAlert(result.error.name, result.error.message);
    }else {
      this.showAlert("Message", "confirmation sent on email")
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

  ngOnInit() {}
}
