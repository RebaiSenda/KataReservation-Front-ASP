import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import BookingService from './booking.service';
import { ApiService } from './api.service';
import Booking from '../models/booking';

describe('BookingService', () => {
  let service: BookingService;
  let apiServiceMock: jasmine.SpyObj<ApiService>;

  const mockBookingResponse = {
    id: 1,
    roomId: 2,
    personId: 3,
    bookingDate: '2025-04-15',
    startSlot: 4,
    endSlot: 6
  };

  const mockBookingsResponse = [
    {
      id: 1,
      roomId: 2,
      personId: 3,
      bookingDate: '2025-04-15',
      startSlot: 4,
      endSlot: 6
    },
    {
      id: 2,
      roomId: 1,
      personId: 5,
      bookingDate: '2025-04-16',
      startSlot: 2,
      endSlot: 3
    }
  ];

  const mockBooking: Booking = {
    Id: 1,
    RoomId: 2,
    PersonId: 3,
    BookingDate: new Date('2025-04-15'),
    StartSlot: 4,
    EndSlot: 6
  };

  beforeEach(() => {
    const spy = jasmine.createSpyObj('ApiService', ['get', 'post', 'put', 'delete']);
    
    TestBed.configureTestingModule({
      providers: [
        BookingService,
        { provide: ApiService, useValue: spy }
      ]
    });
    
    service = TestBed.inject(BookingService);
    apiServiceMock = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('create', () => {
    it('should create a new booking', () => {
      apiServiceMock.post.and.returnValue(of(mockBookingResponse));
      
      const newBooking: Booking = {
        Id: 0,
        RoomId: 2,
        PersonId: 3,
        BookingDate: new Date('2025-04-15'),
        StartSlot: 4,
        EndSlot: 6
      };
      
      service.create(newBooking).subscribe(booking => {
        expect(booking.Id).toBe(1);
        expect(booking.RoomId).toBe(2);
        expect(booking.PersonId).toBe(3);
        expect(booking.BookingDate.toISOString().split('T')[0]).toBe('2025-04-15');
        expect(booking.StartSlot).toBe(4);
        expect(booking.EndSlot).toBe(6);
      });
      
      expect(apiServiceMock.post).toHaveBeenCalledWith('/bookings', {
        roomId: 2,
        personId: 3,
        bookingDate: '2025-04-15',
        startSlot: 4,
        endSlot: 6
      });
    });

    it('should handle 409 conflict error', (done) => {
      const conflictError = {
        status: 409,
        error: {
          message: 'Conflit de réservation',
          availableSlots: [1, 2, 3]
        }
      };
      
      apiServiceMock.post.and.returnValue(throwError(() => conflictError));
      
      service.create(mockBooking).subscribe({
        next: () => done.fail('Expected error, but got result'),
        error: (error) => {
          expect(error.status).toBe(409);
          expect(error.message).toBe('Conflit de réservation');
          expect(error.availableSlots).toEqual([1, 2, 3]);
          done();
        }
      });
    });

    it('should handle general error when creating a booking fails', (done) => {
      apiServiceMock.post.and.returnValue(throwError(() => new Error('Creation error')));
      
      service.create(mockBooking).subscribe({
        next: () => done.fail('Expected error, but got result'),
        error: (error) => {
          expect(error).toBeTruthy();
          done();
        }
      });
    });
  });

  describe('list', () => {
    it('should return an array of bookings', () => {
      apiServiceMock.get.and.returnValue(of(mockBookingsResponse));
      
      service.list().subscribe(bookings => {
        expect(bookings.length).toBe(2);
        expect(bookings[0].Id).toBe(1);
        expect(bookings[0].RoomId).toBe(2);
        expect(bookings[1].Id).toBe(2);
        expect(bookings[1].RoomId).toBe(1);
      });
      
      expect(apiServiceMock.get).toHaveBeenCalledWith('/bookings');
    });

    it('should return empty array when response is not an array', () => {
      apiServiceMock.get.and.returnValue(of({}));
      
      service.list().subscribe(bookings => {
        expect(bookings).toEqual([]);
      });
    });

    it('should handle error when fetching bookings fails', (done) => {
      apiServiceMock.get.and.returnValue(throwError(() => new Error('Network error')));
      
      service.list().subscribe({
        next: () => done.fail('Expected error, but got result'),
        error: (error) => {
          expect(error).toBeTruthy();
          done();
        }
      });
    });
  });

  describe('delete', () => {
    it('should delete a booking', () => {
      apiServiceMock.delete.and.returnValue(of(void 0));
      
      service.delete(1).subscribe(() => {
        expect(apiServiceMock.delete).toHaveBeenCalledWith('/bookings/1');
      });
    });

    it('should handle error when deleting a booking fails', (done) => {
      apiServiceMock.delete.and.returnValue(throwError(() => new Error('Deletion error')));
      
      service.delete(1).subscribe({
        next: () => done.fail('Expected error, but got result'),
        error: (error) => {
          expect(error).toBeTruthy();
          done();
        }
      });
    });
  });

  describe('mapToBooking', () => {
    it('should correctly map API response to Booking model', () => {
      // Configurer le mock pour retourner une réponse valide
      apiServiceMock.post.and.returnValue(of(mockBookingResponse));
      
      // Cette fois, utilisons réellement la méthode create pour éviter l'accès direct à une méthode privée
      const bookingToCreate: Booking = {
        Id: 0,
        RoomId: 2,
        PersonId: 3,
        BookingDate: new Date('2025-04-15'),
        StartSlot: 4,
        EndSlot: 6
      };
      
      service.create(bookingToCreate).subscribe(result => {
        // Vérifier que le mappage est correct
        expect(result).toEqual({
          Id: 1,
          RoomId: 2,
          PersonId: 3,
          BookingDate: jasmine.any(Date),
          StartSlot: 4,
          EndSlot: 6
        });
        expect(result.BookingDate.toISOString().split('T')[0]).toBe('2025-04-15');
      });

      // Vérifier que post a été appelé
      expect(apiServiceMock.post).toHaveBeenCalled();
    });
  });

  describe('formatDate', () => {
    it('should format a valid date to YYYY-MM-DD', () => {
      const booking: Booking = {
        Id: 0,
        RoomId: 2,
        PersonId: 3,
        BookingDate: new Date('2025-05-20'),
        StartSlot: 4,
        EndSlot: 6
      };
      
      apiServiceMock.post.and.returnValue(of(mockBookingResponse));
      
      service.create(booking).subscribe(() => {
        // La vérification se fait sur l'appel à apiService.post
        expect(apiServiceMock.post).toHaveBeenCalledWith('/bookings', jasmine.objectContaining({
          bookingDate: '2025-05-20'
        }));
      });
    });

    it('should handle invalid date and use current date', () => {
      const booking: Booking = {
        Id: 0,
        RoomId: 2,
        PersonId: 3,
        BookingDate: new Date('invalid date'),
        StartSlot: 4,
        EndSlot: 6
      };
      
      apiServiceMock.post.and.returnValue(of(mockBookingResponse));
      
      // Espionner console.warn
      spyOn(console, 'warn');
      
      service.create(booking).subscribe(() => {
        expect(console.warn).toHaveBeenCalledWith("Date invalide, utilisation de la date actuelle");
        expect(apiServiceMock.post).toHaveBeenCalledWith('/bookings', jasmine.objectContaining({
          bookingDate: jasmine.any(String)
        }));
      });
    });
  });
});