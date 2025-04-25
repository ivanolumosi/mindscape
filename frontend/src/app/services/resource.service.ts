import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface Resource {
  id: number;
  title: string;
  description?: string;
  type: string;
  url?: string;
  author?: string;
  date_published?: Date;
  duration?: number;
  event_date?: Date;
  created_at: Date;
  updated_at: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ResourceService {
  private apiUrl = 'http://localhost:3000/api/resources';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Add a new resource
   */
  addResource(resource: Partial<Resource>): Observable<Resource> {
    const currentUser = this.authService.getCurrentUser();
    
    // If no author is provided, use current user's name
    if (!resource.author && currentUser) {
      resource.author = currentUser.name;
    }
    
    return this.http.post<Resource>(this.apiUrl, resource);
  }

  /**
   * Delete a resource by ID
   */
  deleteResource(id: number): Observable<boolean> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
      map(response => true),
    );
  }

  /**
   * Get all resources
   */
  getAllResources(): Observable<Resource[]> {
    return this.http.get<Resource[]>(this.apiUrl).pipe(
      map(resources => this.formatDates(resources))
    );
  }

  /**
   * Get recently added resources with limit
   */
  getRecentlyAddedResources(limit: number = 5): Observable<Resource[]> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<Resource[]>(`${this.apiUrl}/recent`, { params }).pipe(
      map(resources => this.formatDates(resources))
    );
  }

  /**
   * Get resource by ID
   */
  getResourceById(id: number): Observable<Resource> {
    return this.http.get<Resource>(`${this.apiUrl}/${id}`).pipe(
      map(resource => this.formatDates([resource])[0])
    );
  }

  /**
   * Get resources by author
   */
  getResourcesByAuthor(author: string): Observable<Resource[]> {
    return this.http.get<Resource[]>(`${this.apiUrl}/author/${author}`).pipe(
      map(resources => this.formatDates(resources))
    );
  }

  /**
   * Get resources by type
   */
  getResourcesByType(type: string): Observable<Resource[]> {
    return this.http.get<Resource[]>(`${this.apiUrl}/type/${type}`).pipe(
      map(resources => this.formatDates(resources))
    );
  }

  /**
   * Get resources for the current logged-in user
   */
  getMyResources(): Observable<Resource[]> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return new Observable(observer => {
        observer.next([]);
        observer.complete();
      });
    }
    
    return this.getResourcesByAuthor(currentUser.name);
  }

  /**
   * Update a resource
   */
  updateResource(id: number, resource: Partial<Resource>): Observable<Resource> {
    return this.http.patch<Resource>(`${this.apiUrl}/${id}`, resource).pipe(
      map(resource => this.formatDates([resource])[0])
    );
  }

  /**
   * Convert date strings to Date objects
   */
  private formatDates(resources: Resource[]): Resource[] {
    return resources.map(resource => ({
      ...resource,
      date_published: resource.date_published ? new Date(resource.date_published) : undefined,
      event_date: resource.event_date ? new Date(resource.event_date) : undefined,
      created_at: new Date(resource.created_at),
      updated_at: new Date(resource.updated_at)
    }));
  }
}