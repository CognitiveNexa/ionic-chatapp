export interface IGroup {
  created_at: string;
  title: string;
  id: number;
  users: {
    email: string;
    id: string;
  };
}
export interface IMessage {
  created_at: string;
  group_id: number;
  id: number;
  text: string;
  users: {
    id: '3f10d25e-6575-4cb6-a2a1-6aff8735362f';
    email: 'mr.craft.code@gmail.com';
  };
}
