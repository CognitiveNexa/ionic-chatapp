import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-groups',
  templateUrl: './groups.page.html',
  styleUrls: ['./groups.page.scss'],
})
export class GroupsPage {
  user = this.authService.getCurrentUser();
  groups: any = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private dataService: DataService
  ) {}

  async ionViewWillEnter() {
    const result = await this.dataService.getGroups();
    console.log(result);

    if (result) {
      this.groups = result;
    }
  }

  async createGroup() {
    await (
      await this.alertController.create({
        header: 'Start chat group',
        message: 'All group names will public you can make it private',
        inputs: [
          {
            type: 'text',
            name: 'title',
            placeholder: 'My super group',
          },
        ],
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
          },
          {
            text: 'Create group',
            handler: async (result) => {
              const loading = await this.loadingController.create();
              await loading.present();
              const newGroup = await this.dataService.createGroup(result.title);
              await loading.dismiss();

              if (newGroup.error) {
                this.showAlert('Failed', newGroup.error.message);
              } else {
                this.ionViewWillEnter();
                this.router.navigateByUrl(`/groups/${newGroup.data.id}`);
              }
            },
          },
        ],
      })
    ).present();
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

  async signOut() {
    await this.authService.signOut();
  }
}
