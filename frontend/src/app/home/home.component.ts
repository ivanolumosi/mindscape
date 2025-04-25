import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Title, Meta } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  currentUser: any = null;
  userGreeting = '';
  currentHour = new Date().getHours();
  isMenuOpen = false;
  showScrollTop = false;

  benefitsList = [
    {
      title: 'It\'s Professional.',
      description: 'All counselors are qualified and experienced professionals. Mindscape allows you to connect with them in a safe and convenient online environment.',
      icon: 'assets/images/images(1).jpeg'
    },
    {
      title: 'It\'s Free.',
      description: 'Access counseling services and support at no cost. Mental health support doesn\'t have to be expensive for Chuka University students.',
      icon: 'assets/images/images.png'
    },
    {
      title: 'It\'s Convenient.',
      description: 'Do it at your own time and at your own pace. Communicate with your counselor as often as you want and whenever you feel it\'s needed.',
      icon: 'assets/images/conect.jpg'
    },
    {
      title: 'It\'s Effective.',
      description: 'Thousands of students have benefited from mental health support. With Mindscape, you can switch counselors at any point if you don\'t feel you are getting enough benefit.',
      icon: 'assets/images/images(6).jpeg'
    }
  ];

  featuresList = [
    {
      title: 'Professional Counseling',
      description: 'Access to qualified mental health professionals for one-on-one sessions.',
      icon: 'assets/images/images.jpeg'
    },
    {
      title: 'Peer Support Groups',
      description: 'Connect with fellow students facing similar challenges in a safe environment.',
      icon: 'assets/images/community1.png'
    },
    {
      title: 'Self-Help Resources',
      description: 'Access articles, guides, and tools to manage stress and improve wellbeing.',
      icon: 'assets/images/selfhelp.jpeg'
    },
    {
      title: 'Goal Setting',
      description: 'Track your personal and academic goals with our easy-to-use tools.',
      icon: 'assets/images/goals.png'
    },
    {
      title: 'Workshops & Webinars',
      description: 'Participate in regular events on mental resilience and emotional intelligence.',
      icon: 'assets/images/webinar.jpeg'
    },
    {
      title: 'Crisis Support',
      description: 'Immediate help available for students experiencing emotional distress.',
      icon: 'assets/icons/crisis.jpg'
    }
  ];

  testimonials = [
    {
      text: '"Mindscape helped me manage my anxiety during exam season. The counselors are understanding and the resources are really helpful. I\'m so glad our university offers this service!"',
      author: 'Sarah K., 3rd Year Student',
      avatar: 'assets/images/user3.jpeg',
      rating: 5
    },
    {
      text: '"The peer support groups have been a lifesaver. It\'s comforting to know I\'m not alone in my struggles with academic pressure."',
      author: 'James M., 2nd Year Student',
      avatar: 'assets/images/user4.jpeg',
      rating: 5
    },
    {
      text: '"As someone dealing with homesickness, the counselors at Mindscape have given me practical strategies to cope and connect with others."',
      author: 'Lisa T., 1st Year Student',
      avatar: 'assets/images/user1.jpeg',
      rating: 4
    },
    {
      text: '"The journal feature has been incredibly therapeutic for me. I can track my moods and see my progress over time."',
      author: 'Michael O., 4th Year Student',
      avatar: 'assets/images/user2.jpeg.png',
      rating: 5
    }
  ];

  inspirationalQuotes = [
    "Mental health is not a destination, but a process. It's about how you drive, not where you're going.",
    "You don't have to be positive all the time. It's perfectly okay to feel sad, angry, annoyed, frustrated, scared and anxious. Having feelings doesn't make you a negative person. It makes you human.",
    "Self-care is how you take your power back.",
    "Your mental health is a priority. Your happiness is essential. Your self-care is a necessity.",
    "Recovery is not one and done. It is a lifelong journey that takes place one day, one step at a time."
  ];

  currentQuote = '';
  currentTestimonialIndex = 0;
  testimonialInterval!: ReturnType<typeof setInterval>;
  quoteInterval!: ReturnType<typeof setInterval>;

  constructor(
    private titleService: Title,
    private metaService: Meta,
    private router: Router,
    private userService: UserService
  ) {}
  public navigateTo(route: string): void {
    this.router.navigate([route]);
  }
  ngOnInit(): void {
    // Check if user is logged in (mock implementation)
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.isLoggedIn = true;
      this.currentUser = JSON.parse(storedUser);
      this.setUserGreeting();
    }

    // Set page title and meta descriptions for SEO
    this.titleService.setTitle('Mindscape - Mental Health Support for Chuka University Students');
    this.metaService.addTags([
      { name: 'description', content: 'Mindscape offers free mental health support, counseling, and resources for Chuka University students.' },
      { name: 'keywords', content: 'mental health, student counseling, university support, wellness, Chuka University, stress management' }
    ]);

    // Start automatic testimonial slideshow
    this.startTestimonialSlideshow();
    
    // Start quotes rotation
    this.rotateQuotes();
    
    // Add scroll event listener
    window.addEventListener('scroll', this.checkScroll);
  }

  ngOnDestroy(): void {
    // Clear intervals when component is destroyed
    if (this.testimonialInterval) {
      clearInterval(this.testimonialInterval);
    }
    if (this.quoteInterval) {
      clearInterval(this.quoteInterval);
    }
    
    // Remove scroll event listener
    window.removeEventListener('scroll', this.checkScroll);
  }

  /**
   * Set user greeting based on time of day
   */
  setUserGreeting(): void {
    let greeting = '';
    if (this.currentHour < 12) {
      greeting = 'Good morning';
    } else if (this.currentHour < 18) {
      greeting = 'Good afternoon';
    } else {
      greeting = 'Good evening';
    }
    
    this.userGreeting = `${greeting}, ${this.currentUser?.firstName || 'friend'}!`;
  }

  /**
   * Automatically changes the testimonial every 5 seconds
   */
  startTestimonialSlideshow(): void {
    // Set initial testimonial
    this.currentTestimonialIndex = 0;
    
    this.testimonialInterval = setInterval(() => {
      this.nextTestimonial();
    }, 5000);
  }

  /**
   * Show next testimonial with fade transition
   */
  nextTestimonial(): void {
    const testimonialCard = document.querySelector('.testimonial-card') as HTMLElement;

    if (testimonialCard) {
      // Apply fade-out effect before changing text
      testimonialCard.classList.add('fade-out');

      setTimeout(() => {
        // Change the testimonial
        this.currentTestimonialIndex = (this.currentTestimonialIndex + 1) % this.testimonials.length;
        
        // Remove fade-out effect for smooth transition
        testimonialCard.classList.remove('fade-out');
      }, 500); // Delay to match fade effect
    }
  }

  /**
   * Manually navigate to a specific testimonial
   */
  goToTestimonial(index: number): void {
    // Clear the automatic interval
    if (this.testimonialInterval) {
      clearInterval(this.testimonialInterval);
    }
    
    const testimonialCard = document.querySelector('.testimonial-card') as HTMLElement;
    
    if (testimonialCard) {
      testimonialCard.classList.add('fade-out');
      
      setTimeout(() => {
        this.currentTestimonialIndex = index;
        testimonialCard.classList.remove('fade-out');
        
        // Restart the interval
        this.testimonialInterval = setInterval(() => {
          this.nextTestimonial();
        }, 5000);
      }, 500);
    }
  }

  /**
   * Rotate through inspirational quotes
   */
  rotateQuotes(): void {
    // Set initial quote
    this.currentQuote = this.inspirationalQuotes[Math.floor(Math.random() * this.inspirationalQuotes.length)];
    
    this.quoteInterval = setInterval(() => {
      const quoteElement = document.querySelector('.inspirational-quote') as HTMLElement;
      
      if (quoteElement) {
        quoteElement.classList.add('fade-out');
        
        setTimeout(() => {
          // Get a new random quote (different from current)
          let newIndex;
          do {
            newIndex = Math.floor(Math.random() * this.inspirationalQuotes.length);
          } while (this.currentQuote === this.inspirationalQuotes[newIndex]);
          
          this.currentQuote = this.inspirationalQuotes[newIndex];
          quoteElement.classList.remove('fade-out');
        }, 500);
      }
    }, 8000);
  }

  /**
   * Check scroll position for "scroll to top" button
   */
  checkScroll = (): void => {
    this.showScrollTop = window.scrollY > 300;
  }

  /**
   * Scroll to top of page
   */
  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  /**
   * Navigate to the support type selection page
   */
  selectSupportType(supportType: string): void {
    console.log(`Selected support type: ${supportType}`);
    this.router.navigate(['/login'], { queryParams: { type: supportType } });
  }

  /**
   * Navigate to the get started page
   */
  getStarted(): void { 
    console.log('Get started clicked');
    if (this.isLoggedIn) {
      this.router.navigate(['/login']);
    } else {
      this.router.navigate(['/login'], { queryParams: { redirect: 'get-started' } });
    }
  }

  /**
   * Navigate to the login page
   */
  login(): void {
    console.log('Login clicked');
    this.router.navigate(['/login']);
  }
  goToDashboard(): void {
    this.navigateTo('/login');
  }
  goToLearnMore(): void {
    this.navigateTo('/learn-more');
  }

  /**
   * Toggle mobile menu
   */
  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen; 
  }
}