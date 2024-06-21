import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./page/login/login.module').then((m) => m.LoginPageModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./page/register/register.module').then((m) => m.RegisterPageModule),
  },
  {
    path: 'groups/:groupId',
    loadChildren: () => import('./page/messages/messages.module').then((m) => m.MessagesPageModule),
  },
  {
    path: 'groups',
    loadChildren: () => import('./page/groups/groups.module').then((m) => m.GroupsPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
