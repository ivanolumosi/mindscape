import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Title, Meta } from '@angular/platform-browser';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  benefitsList = [
    {
      title: 'It\'s Professional.',
      description: 'All counselors are qualified and experienced professionals. Mindscape allows you to connect with them in a safe and convenient online environment.',
      icon: 'assets/icons/professional-icon.png'
    },
    {
      title: 'It\'s Free.',
      description: 'Access counseling services and support at no cost. Mental health support doesn\'t have to be expensive for Chuka University students.',
      icon: 'assets/icons/affordable-icon.png'
    },
    {
      title: 'It\'s Convenient.',
      description: 'Do it at your own time and at your own pace. Communicate with your counselor as often as you want and whenever you feel it\'s needed.',
      icon: 'assets/icons/convenient-icon.png'
    },
    {
      title: 'It\'s Effective.',
      description: 'Thousands of students have benefited from mental health support. With Mindscape, you can switch counselors at any point if you don\'t feel you are getting enough benefit.',
      icon: 'assets/icons/effective-icon.png'
    }
  ];

  featuresList = [
    {
      title: 'Professional Counseling',
      description: 'Access to qualified mental health professionals for one-on-one sessions.',
      icon: 'assets/icons/counseling-icon.png'
    },
    {
      title: 'Peer Support Groups',
      description: 'Connect with fellow students facing similar challenges in a safe environment.',
      icon: 'assets/icons/peer-support-icon.png'
    },
    {
      title: 'Self-Help Resources',
      description: 'Access articles, guides, and tools to manage stress and improve wellbeing.',
      icon: 'assets/icons/resources-icon.png'
    },
    {
      title: 'Goal Setting',
      description: 'Track your personal and academic goals with our easy-to-use tools.',
      icon: 'assets/icons/goals-icon.png'
    },
    {
      title: 'Workshops & Webinars',
      description: 'Participate in regular events on mental resilience and emotional intelligence.',
      icon: 'assets/icons/workshops-icon.png'
    },
    {
      title: 'Crisis Support',
      description: 'Immediate help available for students experiencing emotional distress.',
      icon: 'assets/icons/crisis-icon.png'
    }
  ];

  testimonials = [
    {
      text: '"Mindscape helped me manage my anxiety during exam season. The counselors are understanding and the resources are really helpful. I\'m so glad our university offers this service!"',
      author: 'Sarah K., 3rd Year Student'
    },
    {
      text: '"The peer support groups have been a lifesaver. It\'s comforting to know I\'m not alone in my struggles with academic pressure."',
      author: 'James M., 2nd Year Student'
    },
    {
      text: '"As someone dealing with homesickness, the counselors at Mindscape have given me practical strategies to cope and connect with others."',
      author: 'Lisa T., 1st Year Student'
    }
  ];

  currentTestimonialIndex = 0;
  testimonialInterval!: ReturnType<typeof setInterval>;

  constructor(
    private titleService: Title,
    private metaService: Meta,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Set page title and meta descriptions for SEO
    this.titleService.setTitle('Mindscape - Mental Health Support for Chuka University Students');
    this.metaService.addTags([
      { name: 'description', content: 'Mindscape offers free mental health support, counseling, and resources for Chuka University students.' },
      { name: 'keywords', content: 'mental health, student counseling, university support, wellness, Chuka University' }
    ]);

    // Start automatic testimonial slideshow
    this.startTestimonialSlideshow();
  }

  /**
   * Automatically changes the testimonial every 1 second
   */
  startTestimonialSlideshow(): void {
    this.testimonialInterval = setInterval(() => {
      this.nextTestimonial();
    }, 2000);
  }

  /**
   * Show next testimonial with fade transition
   */
  nextTestimonial(): void {
    const testimonialText = document.querySelector('.testimonial-text') as HTMLElement;
    const testimonialAuthor = document.querySelector('.testimonial-author') as HTMLElement;

    if (testimonialText && testimonialAuthor) {
      // Apply fade-out effect before changing text
      testimonialText.classList.add('fade-out');
      testimonialAuthor.classList.add('fade-out');

      setTimeout(() => {
        // Change the testimonial
        this.currentTestimonialIndex = (this.currentTestimonialIndex + 1) % this.testimonials.length;
        testimonialText.textContent = this.testimonials[this.currentTestimonialIndex].text;
        testimonialAuthor.textContent = `— ${this.testimonials[this.currentTestimonialIndex].author}`;

        // Remove fade-out effect for smooth transition
        testimonialText.classList.remove('fade-out');
        testimonialAuthor.classList.remove('fade-out');
      }, 500); // Delay to match fade effect
    }
  }

  /**
   * Navigate to the support type selection page
   */
  selectSupportType(supportType: string): void {
    console.log(`Selected support type: ${supportType}`);
    // this.router.navigate(['/get-started'], { queryParams: { type: supportType } });
  }

  /**
   * Navigate to the get started page
   */
  getStarted(): void { 
    console.log('Get started clicked');
    this.router.navigate(['login']);
  }

  /**
   * Navigate to the login page
   */
  login(): void {
    console.log('Login clicked');
    this.router.navigate(['login']);
  }
  isMenuOpen = false; 

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen; 
  }
}