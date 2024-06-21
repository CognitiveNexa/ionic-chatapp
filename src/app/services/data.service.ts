import { Injectable } from '@angular/core';
import {
  RealtimeChannel,
  SupabaseClient,
  createClient,
} from '@supabase/supabase-js';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IGroup, IMessage } from '../page/messages/types';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private supabase: SupabaseClient;
  private realTimeChannel: RealtimeChannel | undefined;

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
  }

  async getGroups() {
    return this.supabase
      .from(GROUPS_DB)
      .select('title,id, users:creator( email )')
      .then((data) => data.data);
  }

  async getGroupById(id: number): Promise<IGroup> {
    return (await this.supabase
      .from(GROUPS_DB)
      .select('created_at, title, id, users:creator( email, id )')
      .match({ id })
      .single()
      .then((data) => data.data)) as IGroup;
  }

  async createGroup(title: string) {
    const newGroup = {
      creator: (await this.supabase.auth.getUser()).data.user?.id,
      title: title,
    };
    return this.supabase.from(GROUPS_DB).insert(newGroup).select().single();
  }

  async addGroupMessage(groupId: number, text: string) {
    const newMessage = {
      text,
      user_id: (await this.supabase.auth.getUser()).data.user?.id,
      group_id: groupId,
    };
    return this.supabase.from(MESSAGES_DB).insert(newMessage);
  }

  async getGroupMessages(groupId: number): Promise<IMessage[]> {
    const result = await this.supabase
      .from(MESSAGES_DB)
      .select('created_at, text, id, users:user_id(email,id)')
      .match({ group_id: groupId })
      .order('created_at', { ascending: false })
      .limit(25);
    return result.data! as unknown as IMessage[];

    // .then((data) => data.data as[]!);
  }

  listenToGroup(groupId: number) {
    const subject = new Subject();

    this.realTimeChannel = this.supabase.channel('public:messages').on(
      'broadcast',
      {
        event: '*',
      },
      async (payload: any) => {
        if (payload.new && (payload.new as IMessage).group_id === groupId) {
          const msgId = payload.new.id;
          console.log('load message: ', msgId);

          const msg = await this.supabase
            .from(MESSAGES_DB)
            .select(`created_at, text, id, users:user_id ( email, id )`)
            .match({ id: msgId })
            .single()
            .then((result) => result.data);
          subject.next(msg);
        }
      }
    );

    return subject.asObservable();
  }

  unSubscribeGroupChanges() {
    if (this.realTimeChannel) {
      this.supabase.removeChannel(this.realTimeChannel);
    }
  }
}

const GROUPS_DB = 'groups';
const MESSAGES_DB = 'messages';
