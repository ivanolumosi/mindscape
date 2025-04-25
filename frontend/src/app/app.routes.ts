import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { UserDashComponent } from './user-dash/user-dash.component';
import { JournalComponent } from './journal/journal.component';
import { ChatAppComponent } from './chat-app/chat-app.component';
import { GoalsComponent } from './goals/goals.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { CounselorDashComponent } from './counsellor/counselor-dash/counselor-dash.component';
import { AdminComponent } from './admin/admin.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { AssessmentComponent } from './assessment/assessment.component';
import { FriendsComponent } from './friends/friends.component';
import { CrisisComponent } from './crisis/crisis.component';
import { LoginComponent } from './login/login.component';
import { ProfileComponent } from './profile/profile.component';
import { PostsComponent } from './posts/posts.component';
import { MoodComponent } from './mood/mood.component';


export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'userdash', component: UserDashComponent },
    { path: 'login', component: LoginComponent },
    { path: 'journal', component: JournalComponent },
    { path: 'chatapp', component: ChatAppComponent },
    { path: 'goals', component: GoalsComponent },
    { path: 'sidebar', component: SidebarComponent },
    { path: 'assessment', component: AssessmentComponent },
    { path: 'friends', component: FriendsComponent },
    { path: 'profile', component: ProfileComponent },
    { path: 'posts', component: PostsComponent },
    { path: 'mood', component: MoodComponent },
    

    { path: 'counsellor', component: CounselorDashComponent },

    { path: 'admin', component: AdminComponent },

    { path: 'crisis', component: CrisisComponent },

    { path: '**', component: NotFoundComponent }

    


];
