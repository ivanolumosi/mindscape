import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar.component';

@NgModule({
  declarations: [],  // Declare SidebarComponent here
  imports: [CommonModule,SidebarComponent],           // Import CommonModule for basic Angular directives
  exports: [SidebarComponent]        // Export SidebarComponent so other modules can use it
})
export class SharedModule { }
