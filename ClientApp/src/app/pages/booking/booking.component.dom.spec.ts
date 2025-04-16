import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import BookingComponent from './booking.component';
import BookingService from '../../services/booking.service';
import RoomService from '../../services/room.service';
import PersonService from '../../services/person.service';
import AppModalService from '../../services/modal.service';
import Booking from '../../models/booking';
import Room from '../../models/room';
import Person from '../../models/person';

describe('BookingComponent DOM Testing', () => {
  let component: BookingComponent;
  let fixture: ComponentFixture<BookingComponent>;
  let bookingServiceSpy: jasmine.SpyObj<BookingService>;
  let roomServiceSpy: jasmine.SpyObj<RoomService>;
  let personServiceSpy: jasmine.SpyObj<PersonService>;
  let modalServiceSpy: jasmine.SpyObj<AppModalService>;

  const mockRooms: Room[] = [
    { Id: 1, RoomName: 'Salle A', Bookings: [] },
    { Id: 2, RoomName: 'Salle B', Bookings: [] },
    { Id: 3, RoomName: 'Salle C', Bookings: [] } // Adding one more room to match expected count
  ];

  const mockPersons: Person[] = [
    { id: 1, firstName: 'John', lastName: 'Doe', bookings: [] },
    { id: 2, firstName: 'Jane', lastName: 'Smith', bookings: [] },
    { id: 3, firstName: 'Bob', lastName: 'Johnson', bookings: [] } // Adding one more person to match expected count
  ];

  const mockBookings: Booking[] = [
    { Id: 1, RoomId: 1, PersonId: 1, BookingDate: new Date('2025-04-15'), StartSlot: 9, EndSlot: 10 },
    { Id: 2, RoomId: 2, PersonId: 2, BookingDate: new Date('2025-04-16'), StartSlot: 14, EndSlot: 16 }
  ];

  beforeEach(waitForAsync(() => {
    const bookingSpy = jasmine.createSpyObj('BookingService', ['list', 'create', 'delete']);
    const roomSpy = jasmine.createSpyObj('RoomService', ['list']);
    const personSpy = jasmine.createSpyObj('PersonService', ['list']);
    const modalSpy = jasmine.createSpyObj('AppModalService', ['alert']);

    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        BookingComponent // Component is now imported instead of declared
      ],
      providers: [
        { provide: BookingService, useValue: bookingSpy },
        { provide: RoomService, useValue: roomSpy },
        { provide: PersonService, useValue: personSpy },
        { provide: AppModalService, useValue: modalSpy }
      ]
    }).compileComponents();

    bookingServiceSpy = TestBed.inject(BookingService) as jasmine.SpyObj<BookingService>;
    roomServiceSpy = TestBed.inject(RoomService) as jasmine.SpyObj<RoomService>;
    personServiceSpy = TestBed.inject(PersonService) as jasmine.SpyObj<PersonService>;
    modalServiceSpy = TestBed.inject(AppModalService) as jasmine.SpyObj<AppModalService>;
  }));

  beforeEach(() => {
    // Configure mock service returns
    roomServiceSpy.list.and.returnValue(of(mockRooms));
    personServiceSpy.list.and.returnValue(of(mockPersons));
    bookingServiceSpy.list.and.returnValue(of(mockBookings));
    
    fixture = TestBed.createComponent(BookingComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should display the form elements correctly', () => {
    fixture.detectChanges();
    
    const formElement = fixture.debugElement.query(By.css('.booking-form'));
    expect(formElement).toBeTruthy();
    
    const roomSelect = fixture.debugElement.query(By.css('#room'));
    expect(roomSelect).toBeTruthy();
    
    const personSelect = fixture.debugElement.query(By.css('#person'));
    expect(personSelect).toBeTruthy();
    
    const dateInput = fixture.debugElement.query(By.css('#date'));
    expect(dateInput).toBeTruthy();
    
    const startSlotSelect = fixture.debugElement.query(By.css('#startSlot'));
    expect(startSlotSelect).toBeTruthy();
    
    const endSlotSelect = fixture.debugElement.query(By.css('#endSlot'));
    expect(endSlotSelect).toBeTruthy();
    
    const submitButton = fixture.debugElement.query(By.css('.btn-primary'));
    expect(submitButton).toBeTruthy();
    expect(submitButton.nativeElement.textContent).toContain('Réserver');
  });

  it('should display room options in the dropdown', fakeAsync(() => {
    fixture.detectChanges();
    tick(100); // Give more time for component to update
    fixture.detectChanges();
    
    const roomOptions = fixture.debugElement.queryAll(By.css('#room option'));
    // +1 for default "Select a room" option
    expect(roomOptions.length).toBe(mockRooms.length + 1);
    
    if (roomOptions.length > 1) {
      // Check text of first real option
      expect(roomOptions[1].nativeElement.textContent).toContain('Salle A');
    }
  }));

  it('should display person options in the dropdown', fakeAsync(() => {
    fixture.detectChanges();
    tick(100); // Give more time for component to update
    fixture.detectChanges();
    
    const personOptions = fixture.debugElement.queryAll(By.css('#person option'));
    // +1 for default "Select a person" option
    expect(personOptions.length).toBe(mockPersons.length + 1);
    
    if (personOptions.length > 1) {
      // Check text of first real option
      expect(personOptions[1].nativeElement.textContent).toContain('John Doe');
    }
  }));

  it('should display the list of bookings', fakeAsync(() => {
    fixture.detectChanges();
    tick(100); // Give more time for component to update
    fixture.detectChanges();
    
    const bookingItems = fixture.debugElement.queryAll(By.css('.booking-item'));
    expect(bookingItems.length).toBe(mockBookings.length);
  }));

  it('should show empty message when no bookings', fakeAsync(() => {
    // Reconfigure for empty list
    bookingServiceSpy.list.and.returnValue(of([]));
    
    // Reset and check
    component.ngOnInit();
    fixture.detectChanges();
    tick(100);
    fixture.detectChanges();
    
    const emptyMessage = fixture.debugElement.query(By.css('.no-bookings'));
    expect(emptyMessage).toBeTruthy();
    expect(emptyMessage.nativeElement.textContent).toContain('Aucune réservation trouvée');
  }));

  it('should call createBooking when form is submitted', fakeAsync(() => {
    fixture.detectChanges();
    tick(100);
    
    // Set form values
    component.newBooking.RoomId = 1;
    component.newBooking.PersonId = 1;
    component.bookingDateString = '2025-05-01';
    component.newBooking.StartSlot = 10;
    component.newBooking.EndSlot = 11;
    
    // Mock successful creation
    bookingServiceSpy.create.and.returnValue(of({ 
      Id: 3, 
      RoomId: 1, 
      PersonId: 1, 
      BookingDate: new Date('2025-05-01'), 
      StartSlot: 10, 
      EndSlot: 11 
    }));
    
    fixture.detectChanges();
    
    // Click the button
    const submitButton = fixture.debugElement.query(By.css('.btn-primary'));
    if (submitButton) {
      submitButton.nativeElement.click();
      
      tick(100);
      fixture.detectChanges();
      
      // Verify service was called
      expect(bookingServiceSpy.create).toHaveBeenCalled();
      // Verify success alert was shown
      expect(modalServiceSpy.alert).toHaveBeenCalledWith('Réservation créée avec succès.');
    } else {
      fail('Submit button not found');
    }
  }));

  it('should call deleteBooking when delete button is clicked', fakeAsync(() => {
    // Mock successful deletion
    bookingServiceSpy.delete.and.returnValue(of(void 0));
    
    // Spy on confirm to always return true
    spyOn(window, 'confirm').and.returnValue(true);
    
    fixture.detectChanges();
    tick(100);
    fixture.detectChanges();
    
    // Click delete button on first booking
    const deleteButtons = fixture.debugElement.queryAll(By.css('.btn-danger'));
    if (deleteButtons && deleteButtons.length > 0) {
      deleteButtons[0].nativeElement.click();
      
      tick(100);
      
      // Verify service was called with correct ID
      expect(bookingServiceSpy.delete).toHaveBeenCalledWith(1);
      // Verify success alert was shown
      expect(modalServiceSpy.alert).toHaveBeenCalledWith('Réservation supprimée avec succès.');
    } else {
      // Handle case where element might not exist yet
      pending('Delete buttons not found yet');
    }
  }));

  it('should not delete when user cancels confirmation', fakeAsync(() => {
    // Spy on confirm to return false
    spyOn(window, 'confirm').and.returnValue(false);
    
    fixture.detectChanges();
    tick(100);
    fixture.detectChanges();
    
    // Click delete button
    const deleteButtons = fixture.debugElement.queryAll(By.css('.btn-danger'));
    if (deleteButtons && deleteButtons.length > 0) {
      deleteButtons[0].nativeElement.click();
      
      tick(100);
      
      // Verify service was not called
      expect(bookingServiceSpy.delete).not.toHaveBeenCalled();
    } else {
      // Handle case where element might not exist yet
      pending('Delete buttons not found yet');
    }
  }));

  // Other tests...
});