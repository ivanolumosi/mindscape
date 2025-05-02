// import { TestBed } from '@angular/core/testing';
// import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
// import { RouterTestingModule } from '@angular/router/testing';
// import { Router } from '@angular/router';
// import { AuthService, User, Seeker, Counselor, Admin } from './auth.service';
// import { of, throwError } from 'rxjs';

// describe('AuthService', () => {
//   let service: AuthService;
//   let httpMock: HttpTestingController;
//   let router: Router;
//   const apiUrl = 'http://localhost:3000/api/auth';

//   // Sample test data
//   const mockSeeker: Seeker = {
//     id: 1,
//     userId: 1,
//     name: 'Test Seeker',
//     email: 'seeker@test.com',
//     role: 'seeker',
//     faculty: 'Engineering',
//     isProfileComplete: true,
//     status: 'online'
//   };

//   const mockCounselor: Counselor = {
//     id: 2,
//     userId: 2,
//     name: 'Test Counselor',
//     email: 'counselor@test.com',
//     role: 'counselor',
//     specialization: 'Academic Stress',
//     faculty: 'Psychology'
//   };

//   const mockAdmin: Admin = {
//     id: 3,
//     userId: 3,
//     name: 'Test Admin',
//     email: 'admin@test.com',
//     role: 'admin',
//     privileges: 'full'
//   };

//   const mockToken = 'mock-jwt-token';

//   // Setup before each test
//   beforeEach(() => {
//     // Clear localStorage before each test
//     localStorage.clear();
    
//     TestBed.configureTestingModule({
//       imports: [
//         HttpClientTestingModule,
//         RouterTestingModule.withRoutes([])
//       ],
//       providers: [AuthService]
//     });

//     service = TestBed.inject(AuthService);
//     httpMock = TestBed.inject(HttpTestingController);
//     router = TestBed.inject(Router);

//     // Spy on router navigate method
//     spyOn(router, 'navigate');
//   });

//   // Clean up after each test
//   afterEach(() => {
//     httpMock.verify();
//   });

//   // Test service creation
//   it('should be created', () => {
//     expect(service).toBeTruthy();
//   });

//   // Test initialization and local storage loading
//   describe('Initialization', () => {
//     it('should load stored user from localStorage on initialization', () => {
//       // Arrange - Setup localStorage with user data before service creation
//       const userData = { ...mockSeeker };
//       localStorage.setItem('currentUser', JSON.stringify(userData));
//       localStorage.setItem('token', mockToken);
      
//       // Act - Create a new instance to trigger initialization
//       const newService = TestBed.inject(AuthService);
      
//       // Assert
//       let currentUser: User | null = null;
//       newService.currentUser$.subscribe(user => {
//         currentUser = user;
//       });
      
//       expect(currentUser).toEqual(userData);
//     });

//     it('should handle invalid stored user data gracefully', () => {
//       // Arrange - Setup invalid JSON in localStorage
//       localStorage.setItem('currentUser', 'invalid-json');
//       localStorage.setItem('token', mockToken);
      
//       // Act - Create new service instance
//       const newService = TestBed.inject(AuthService);
      
//       // Assert - Should clear invalid data
//       let currentUser: User | null = null;
//       newService.currentUser$.subscribe(user => {
//         currentUser = user;
//       });
      
//       expect(currentUser).toBeNull();
//       expect(localStorage.getItem('currentUser')).toBeNull();
//       expect(localStorage.getItem('token')).toBeNull();
//     });
//   });

//   // Test registration
//   describe('User Registration', () => {
//     it('should register a new user successfully', () => {
//       // Arrange
//       const registrationData = {
//         name: 'New User',
//         email: 'newuser@test.com',
//         role: 'seeker' as const,
//         password: 'Password123!'
//       };
      
//       const mockResponse = {
//         user: {
//           userId: 123,
//           name: registrationData.name,
//           email: registrationData.email,
//           role: registrationData.role,
//           isProfileComplete: false
//         },
//         token: mockToken,
//         message: 'Registration successful'
//       };
      
//       // Act
//       let result: any;
//       service.register(registrationData).subscribe(resp => {
//         result = resp;
//       });
      
//       // Assert - Check HTTP request
//       const req = httpMock.expectOne(`${apiUrl}/register`);
//       expect(req.request.method).toBe('POST');
//       expect(req.request.body).toEqual(registrationData);
      
//       // Respond with mock data
//       req.flush(mockResponse);
      
//       // Verify results
//       expect(result).toEqual(mockResponse);
//       expect(localStorage.getItem('currentUser')).toBeTruthy();
//       expect(localStorage.getItem('token')).toBe(mockToken);
      
//       // Verify the BehaviorSubject was updated
//       let currentUser: User | null = null;
//       service.currentUser$.subscribe(user => {
//         currentUser = user;
//       });
//       expect(currentUser).toEqual(mockResponse.user);
//     });

//     it('should handle registration errors', () => {
//       // Arrange
//       const registrationData = {
//         name: 'New User',
//         email: 'existing@test.com', // Assuming this email already exists
//         role: 'seeker' as const,
//         password: 'Password123!'
//       };
      
//       const errorResponse = {
//         status: 400,
//         statusText: 'Bad Request',
//         error: { message: 'Email already in use' }
//       };
      
//       // Act & Assert
//       service.register(registrationData).subscribe(
//         () => fail('Expected registration to fail'),
//         error => {
//           expect(error.error.message).toBe('Email already in use');
//         }
//       );
      
//       // Simulate error response
//       const req = httpMock.expectOne(`${apiUrl}/register`);
//       req.flush(errorResponse.error, errorResponse);
      
//       // Verify localStorage wasn't updated
//       expect(localStorage.getItem('currentUser')).toBeNull();
//       expect(localStorage.getItem('token')).toBeNull();
//     });

//     it('should navigate to profile completion on registerAndNavigate', () => {
//       // Arrange
//       const registrationData = {
//         name: 'New User',
//         email: 'newuser@test.com',
//         role: 'seeker' as const,
//         password: 'Password123!'
//       };
      
//       const mockResponse = {
//         user: {
//           userId: 123,
//           name: registrationData.name,
//           email: registrationData.email,
//           role: registrationData.role,
//           isProfileComplete: false
//         },
//         token: mockToken,
//         message: 'Registration successful'
//       };
      
//       // Act
//       service.registerAndNavigate(registrationData).subscribe();
      
//       // Respond with mock data
//       const req = httpMock.expectOne(`${apiUrl}/register`);
//       req.flush(mockResponse);
      
//       // Assert - Check navigation
//       expect(router.navigate).toHaveBeenCalledWith(
//         ['/profile'], 
//         { queryParams: { firstLogin: 'true', userId: mockResponse.user.userId } }
//       );
//     });
//   });

//   // Test login functionality
//   describe('User Login', () => {
//     it('should log in a user successfully', () => {
//       // Arrange
//       const credentials = {
//         email: 'seeker@test.com',
//         password: 'Password123!'
//       };
      
//       const mockResponse = {
//         token: mockToken,
//         user: mockSeeker
//       };
      
//       // Act
//       let result: any;
//       service.login(credentials).subscribe(resp => {
//         result = resp;
//       });
      
//       // Assert - Check HTTP request
//       const req = httpMock.expectOne(`${apiUrl}/login`);
//       expect(req.request.method).toBe('POST');
//       expect(req.request.body).toEqual(credentials);
      
//       // Respond with mock data
//       req.flush(mockResponse);
      
//       // Verify results
//       expect(result).toEqual(mockResponse);
//       expect(localStorage.getItem('currentUser')).toBeTruthy();
//       expect(localStorage.getItem('token')).toBe(mockToken);
      
//       // Verify the BehaviorSubject was updated
//       let currentUser: User | null = null;
//       service.currentUser$.subscribe(user => {
//         currentUser = user;
//       });
//       expect(currentUser).toEqual(mockSeeker);
//     });
    
//     it('should handle login errors', () => {
//       // Arrange
//       const credentials = {
//         email: 'wrong@test.com',
//         password: 'WrongPassword'
//       };
      
//       const errorResponse = {
//         status: 401,
//         statusText: 'Unauthorized',
//         error: { message: 'Invalid credentials' }
//       };
      
//       // Act & Assert
//       service.login(credentials).subscribe(
//         () => fail('Expected login to fail'),
//         error => {
//           expect(error.error.message).toBe('Invalid credentials');
//         }
//       );
      
//       // Simulate error response
//       const req = httpMock.expectOne(`${apiUrl}/login`);
//       req.flush(errorResponse.error, errorResponse);
      
//       // Verify localStorage wasn't updated
//       expect(localStorage.getItem('currentUser')).toBeNull();
//       expect(localStorage.getItem('token')).toBeNull();
//     });

//     it('should navigate to dashboard on loginAndNavigate', () => {
//       // Arrange
//       const credentials = {
//         email: 'seeker@test.com',
//         password: 'Password123!'
//       };
      
//       const mockResponse = {
//         token: mockToken,
//         user: mockSeeker
//       };
      
//       // Act
//       service.loginAndNavigate(credentials).subscribe();
      
//       // Respond with mock data
//       const req = httpMock.expectOne(`${apiUrl}/login`);
//       req.flush(mockResponse);
      
//       // Assert - Check navigation
//       expect(router.navigate).toHaveBeenCalledWith(['/userdash']);
//     });
//   });

//   // Test logout
//   describe('User Logout', () => {
//     it('should clear user data and navigate to login on logout', () => {
//       // Arrange - Setup logged in state
//       localStorage.setItem('currentUser', JSON.stringify(mockSeeker));
//       localStorage.setItem('token', mockToken);
      
//       // Act
//       service.logout();
      
//       // Assert
//       expect(localStorage.getItem('currentUser')).toBeNull();
//       expect(localStorage.getItem('token')).toBeNull();
//       expect(router.navigate).toHaveBeenCalledWith(['/login']);
      
//       // Verify the BehaviorSubject was updated
//       let currentUser: User | null = null;
//       service.currentUser$.subscribe(user => {
//         currentUser = user;
//       });
//       expect(currentUser).toBeNull();
//     });
//   });

//   // Test user status methods
//   describe('User Status Methods', () => {
//     it('should correctly detect logged in status', () => {
//       // Arrange - Not logged in initially
//       expect(service.isLoggedIn()).toBeFalsy();
      
//       // Act - Set up logged in state
//       localStorage.setItem('currentUser', JSON.stringify(mockSeeker));
//       localStorage.setItem('token', mockToken);
      
//       // Force reload stored user to simulate app state
//       (service as any).loadStoredUser();
      
//       // Assert
//       expect(service.isLoggedIn()).toBeTruthy();
//     });
    
//     it('should return current user ID when logged in', () => {
//       // Arrange - Set up logged in state
//       localStorage.setItem('currentUser', JSON.stringify(mockSeeker));
//       localStorage.setItem('token', mockToken);
//       (service as any).loadStoredUser();
      
//       // Act & Assert
//       expect(service.getCurrentUserId()).toBe(mockSeeker.id);
//     });
    
//     it('should return undefined user ID when not logged in', () => {
//       // Act & Assert - No setup needed, should be logged out by default
//       expect(service.getCurrentUserId()).toBeUndefined();
//     });
    
//     it('should return correct user role', () => {
//       // Arrange - Set up logged in state with different roles
      
//       // Test with seeker
//       localStorage.setItem('currentUser', JSON.stringify(mockSeeker));
//       localStorage.setItem('token', mockToken);
//       (service as any).loadStoredUser();
//       expect(service.getUserRole()).toBe('seeker');
//       expect(service.isSeeker()).toBeTruthy();
//       expect(service.isCounselor()).toBeFalsy();
//       expect(service.isAdmin()).toBeFalsy();
      
//       // Clear and test with counselor
//       localStorage.clear();
//       localStorage.setItem('currentUser', JSON.stringify(mockCounselor));
//       localStorage.setItem('token', mockToken);
//       (service as any).loadStoredUser();
//       expect(service.getUserRole()).toBe('counselor');
//       expect(service.isSeeker()).toBeFalsy();
//       expect(service.isCounselor()).toBeTruthy();
//       expect(service.isAdmin()).toBeFalsy();
      
//       // Clear and test with admin
//       localStorage.clear();
//       localStorage.setItem('currentUser', JSON.stringify(mockAdmin));
//       localStorage.setItem('token', mockToken);
//       (service as any).loadStoredUser();
//       expect(service.getUserRole()).toBe('admin');
//       expect(service.isSeeker()).toBeFalsy();
//       expect(service.isCounselor()).toBeFalsy();
//       expect(service.isAdmin()).toBeTruthy();
//     });
    
//     it('should return empty role when not logged in', () => {
//       // Act & Assert - No setup needed, should be logged out by default
//       expect(service.getUserRole()).toBe('');
//     });
    
//     it('should return correct user object', () => {
//       // Arrange - Set up logged in state
//       localStorage.setItem('currentUser', JSON.stringify(mockSeeker));
//       localStorage.setItem('token', mockToken);
//       (service as any).loadStoredUser();
      
//       // Act & Assert
//       expect(service.getCurrentUser()).toEqual(mockSeeker);
//     });
    
//     it('should return null user when not logged in', () => {
//       // Act & Assert - No setup needed, should be logged out by default
//       expect(service.getCurrentUser()).toBeNull();
//     });
//   });

//   // Test profile methods
//   describe('User Profile Methods', () => {
//     it('should update user profile successfully', () => {
//       // Arrange - Setup logged in state
//       localStorage.setItem('currentUser', JSON.stringify(mockSeeker));
//       localStorage.setItem('token', mockToken);
//       (service as any).loadStoredUser();
      
//       const profileUpdates = {
//         faculty: 'Computer Science',
//         wantsDailyEmails: true,
//         status: 'busy' as const
//       };
      
//       const updatedProfile = {
//         ...mockSeeker,
//         ...profileUpdates
//       };
      
//       // Act
//       let result: any;
//       service.updateProfile(profileUpdates).subscribe(resp => {
//         result = resp;
//       });
      
//       // Assert - Check HTTP request
//       const req = httpMock.expectOne(`${apiUrl}/profile/${mockSeeker.id}`);
//       expect(req.request.method).toBe('PUT');
//       expect(req.request.body).toEqual(profileUpdates);
      
//       // Respond with mock data
//       req.flush(updatedProfile);
      
//       // Verify results
//       expect(result).toEqual(updatedProfile);
      
//       // Verify the stored user was updated
//       const storedUser = JSON.parse(localStorage.getItem('currentUser') || '');
//       expect(storedUser.faculty).toBe(profileUpdates.faculty);
//       expect(storedUser.wantsDailyEmails).toBe(profileUpdates.wantsDailyEmails);
//       expect(storedUser.status).toBe(profileUpdates.status);
//       expect(storedUser.isProfileComplete).toBe(true);
      
//       // Verify the BehaviorSubject was updated
//       let currentUser: User | null = null;
//       service.currentUser$.subscribe(user => {
//         currentUser = user;
//       });
//       expect(currentUser?.faculty).toBe(profileUpdates.faculty);
//     });
    
//     it('should throw error when updating profile while not logged in', () => {
//       // Act & Assert
//       expect(() => service.updateProfile({ faculty: 'Test' }))
//         .toThrowError('User is not logged in');
//     });
    
//     it('should get user profile successfully', () => {
//       // Arrange - Setup logged in state
//       localStorage.setItem('currentUser', JSON.stringify(mockSeeker));
//       localStorage.setItem('token', mockToken);
//       (service as any).loadStoredUser();
      
//       // Act
//       let result: any;
//       service.getProfile().subscribe(resp => {
//         result = resp;
//       });
      
//       // Assert - Check HTTP request
//       const req = httpMock.expectOne(`${apiUrl}/profile/${mockSeeker.id}`);
//       expect(req.request.method).toBe('GET');
      
//       // Respond with mock data
//       req.flush(mockSeeker);
      
//       // Verify results
//       expect(result).toEqual(mockSeeker);
//     });
    
//     it('should throw error when getting profile while not logged in', () => {
//       // Act & Assert
//       expect(() => service.getProfile())
//         .toThrowError('User is not logged in');
//     });
//   });

//   // Test token methods
//   describe('Token Methods', () => {
//     it('should return the correct auth token', () => {
//       // Arrange - Set up with token
//       localStorage.setItem('token', mockToken);
      
//       // Act & Assert
//       expect(service.getToken()).toBe(mockToken);
//     });
    
//     it('should return null when no token exists', () => {
//       // Act & Assert - No setup needed, token should be null by default
//       expect(service.getToken()).toBeNull();
//     });
//   });
// });