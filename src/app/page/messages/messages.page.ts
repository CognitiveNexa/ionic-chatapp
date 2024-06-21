import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { IGroup, IMessage } from './types';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.page.html',
  styleUrls: ['./messages.page.scss'],
})
export class MessagesPage implements OnInit, OnDestroy {
  group: IGroup | null = null;
  currentUserId: string = '';
  messages: IMessage[] = [];
  messageText: string = '';

  constructor(
    private route: ActivatedRoute,
    private loadingController: LoadingController,
    private dataService: DataService,
    private authService: AuthService
  ) {}

  async sendMessage() {
    await this.dataService.addGroupMessage(this.group?.id!, this.messageText);
    this.messageText = '';
  }

  async ngOnInit() {
    const loading = await this.loadingController.create({
      message: 'Load messages...',
    });
    loading.present();
    const groupId = this.route.snapshot.paramMap.get('groupId');
    if (groupId) {
      // this.currentUserId = this.authService.getCurrentUserId();
      this.group = await this.dataService.getGroupById(+groupId);
      const messages = await this.dataService.getGroupMessages(+groupId)!;
      if (messages) this.messages = messages;
      this.dataService.listenToGroup(+groupId).subscribe((msg) => {
        this.messages.push(msg as IMessage);
      });
    }

    loading.dismiss();
  }

  ngOnDestroy() {
    this.dataService.unSubscribeGroupChanges();
    console.log('DESTORY SUBSCRIPTION');
  }
}
