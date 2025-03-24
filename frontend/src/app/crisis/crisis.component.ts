import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SharedModule } from "../shared/shared.module";
import { SidebarComponent } from "../sidebar/sidebar.component";

@Component({
  selector: 'app-crisis',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './crisis.component.html',
  styleUrl: './crisis.component.css'
})
export class CrisisComponent {
  
    crisisOptions = [
      { 
        id: 1, 
        title: 'Crisis Chat', 
        description: 'Immediate text-based support', 
        icon: 'chat-icon',
        available: true
      },
      { 
        id: 2, 
        title: 'Crisis Call', 
        description: '24/7 phone counseling', 
        icon: 'call-icon',
        available: true
      }
    ];
  
    recentCrisisLogs = [
      {
        id: 1,
        type: 'Chat',
        timestamp: new Date('2025-03-15T10:30:00'),
        status: 'Completed'
      },
      {
        id: 2,
        type: 'Call',
        timestamp: new Date('2025-03-14T15:45:00'),
        status: 'In Progress'
      }
    ];
  
    emergencyContacts = [
      {
        id: 1,
        name: 'National Helpline',
        number: '1-800-273-8255',
        type: 'Primary'
      },
      {
        id: 2,
        name: 'Local Crisis Center',
        number: '(555) 123-4567',
        type: 'Secondary'
      }
    ];
  }