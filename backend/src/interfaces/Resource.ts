export interface Resource {
    id: number;                             // Unique identifier for each resource
    title: string;                           // Title of the resource (e.g., video, book, event)
    description?: string;                    // Description of the resource
    type: string;                            // Type of the resource: 'video', 'book', 'event', etc.
    url?: string;                            // URL link to the resource (e.g., YouTube link for video, PDF link for books)
    author?: string;                         // Author/Creator of the resource (for books or videos)
    date_published?: Date;                   // Date when the resource was published
    duration?: number;                       // Duration of the resource (for videos, in minutes; for books, use estimated reading time)
    event_date?: Date;                       // Date and time of the event (if the resource is an event)
    created_at: Date;                        // Timestamp when the record is created
    updated_at: Date;                        // Timestamp when the record is last updated
  }
  