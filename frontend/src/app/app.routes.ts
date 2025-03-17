import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { UserDashComponent } from './user-dash/user-dash.component';
import { LoginComponent } from './login/login.component';
import { JournalComponent } from './journal/journal.component';
import { ChatAppComponent } from './chat-app/chat-app.component';


export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'userdash', component: UserDashComponent },
    { path: 'login', component: LoginComponent },
    { path: 'journal', component: JournalComponent },
    { path: 'chatapp', component: ChatAppComponent }
];
