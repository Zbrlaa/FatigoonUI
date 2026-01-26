import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { UserDetailComponent } from './components/user-detail/user-detail.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'user/:username', component: UserDetailComponent }
];