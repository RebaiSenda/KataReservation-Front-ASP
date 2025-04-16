import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';
import Room from '../../models/room';
import Person from '../../models/person';
import Booking from '../../models/booking';
import BookingComponent from './booking.component';
import BookingService from 'src/app/services/booking.service';
import RoomService from 'src/app/services/room.service';
import PersonService from 'src/app/services/person.service';
import AppModalService from 'src/app/services/modal.service';

describe('BookingComponent', () => {
  let component: BookingComponent;
  let fixture: ComponentFixture<BookingComponent>;
  let bookingService: jasmine.SpyObj<BookingService>;
  let roomService: jasmine.SpyObj<RoomService>;
  let personService: jasmine.SpyObj<PersonService>;
  let modalService: jasmine.SpyObj<AppModalService>;

  beforeEach(async () => {
    const bookingServiceMock = jasmine.createSpyObj('BookingService', ['list', 'create', 'delete']);
    const roomServiceMock = jasmine.createSpyObj('RoomService', ['list']);
    const personServiceMock = jasmine.createSpyObj('PersonService', ['list']);
    const modalServiceMock = jasmine.createSpyObj('AppModalService', ['alert']);

    await TestBed.configureTestingModule({
      imports: [FormsModule, BookingComponent],
      providers: [
        { provide: BookingService, useValue: bookingServiceMock },
        { provide: RoomService, useValue: roomServiceMock },
        { provide: PersonService, useValue: personServiceMock },
        { provide: AppModalService, useValue: modalServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BookingComponent);
    component = fixture.componentInstance;
    bookingService = TestBed.inject(BookingService) as jasmine.SpyObj<BookingService>;
    roomService = TestBed.inject(RoomService) as jasmine.SpyObj<RoomService>;
    personService = TestBed.inject(PersonService) as jasmine.SpyObj<PersonService>;
    modalService = TestBed.inject(AppModalService) as jasmine.SpyObj<AppModalService>;

    // 👇 Mock du confirm() natif pour éviter le pop-up
    spyOn(window, 'confirm').and.returnValue(true);
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load rooms and persons on init', async () => {
    const rooms: Room[] = [
      { Id: 1, RoomName: 'Salle 1', Bookings: [] },
      { Id: 2, RoomName: 'Salle 2', Bookings: [] }
    ];

    const persons: Person[] = [
      { id: 1, firstName: 'John', lastName: 'Doe', bookings: [] },
      { id: 2, firstName: 'Jane', lastName: 'Smith', bookings: [] }
    ];

    roomService.list.and.returnValue(of(rooms));
    personService.list.and.returnValue(of(persons));

    await component.ngOnInit();

    expect(component.rooms).toEqual(rooms);
    expect(component.persons).toEqual(persons);
  });

  it('should create a booking', async () => {
    const booking: Booking = {
      Id: 1,
      RoomId: 1,
      PersonId: 1,
      BookingDate: new Date(),
      StartSlot: 1,
      EndSlot: 2
    };

    bookingService.create.and.returnValue(of(booking));

    component.newBooking = { ...booking };
    component.bookingDateString = '2025-04-16';

    await component.createBooking();

    expect(bookingService.create).toHaveBeenCalledWith(jasmine.objectContaining({
      RoomId: 1,
      PersonId: 1,
      StartSlot: 1,
      EndSlot: 2
    }));

    expect(modalService.alert).toHaveBeenCalledWith('Réservation créée avec succès.');
  });

  it('should handle error when creating a booking', async () => {
    bookingService.create.and.returnValue(throwError(() => new Error('Erreur de création')));

    component.newBooking = {
      Id: 0,
      RoomId: 1,
      PersonId: 2,
      BookingDate: new Date(),
      StartSlot: 3,
      EndSlot: 4
    };
    component.bookingDateString = '2025-04-16';

    await component.createBooking();

    expect(modalService.alert).toHaveBeenCalledWith('Erreur de création');
  });

  it('should delete a booking', async () => {
    const bookingId = 1;
    bookingService.delete.and.returnValue(of(undefined));

    await component.deleteBooking(bookingId);

    expect(bookingService.delete).toHaveBeenCalledWith(bookingId);
    expect(modalService.alert).toHaveBeenCalledWith('Réservation supprimée avec succès.');
  });

  it('should handle error when deleting a booking', async () => {
    const bookingId = 1;
    bookingService.delete.and.returnValue(throwError(() => new Error('Erreur de suppression')));

    await component.deleteBooking(bookingId);

    expect(modalService.alert).toHaveBeenCalledWith('Erreur de suppression');
  });
});
