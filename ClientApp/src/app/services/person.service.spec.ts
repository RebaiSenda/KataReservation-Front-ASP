import { TestBed } from '@angular/core/testing';
import PersonService from './person.service';
import { ApiService } from './api.service';
import { of } from 'rxjs';
import { PersonResponse, PersonsResponse } from '../responses/person.response';
import { CreatePersonRequest, UpdatePersonRequest } from '../requests/person.request';

describe('PersonService', () => {
  let service: PersonService;
  let mockApiService: jasmine.SpyObj<ApiService>;

  const mockPersonsResponse: PersonsResponse = {
    persons: [
      { id: 1, firstName: 'John', lastName: 'Doe', bookings: [] },
      { 
        id: 2, 
        firstName: 'Jane', 
        lastName: 'Smith', 
        bookings: [{ id: 1, roomId: 101, personId: 2, bookingDate: '2023-01-01', startSlot: 1, endSlot: 2 }] 
      }
    ]
  };

  const mockPersonResponse: PersonResponse = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    bookings: []
  };

  beforeEach(() => {
    mockApiService = jasmine.createSpyObj('ApiService', ['get', 'post', 'put', 'delete']);

    mockApiService.get.and.returnValue(of(mockPersonsResponse));
    mockApiService.post.and.returnValue(of(mockPersonResponse));
    mockApiService.put.and.returnValue(of(mockPersonResponse));
    mockApiService.delete.and.returnValue(of(void 0));

    TestBed.configureTestingModule({
      providers: [
        PersonService,
        { provide: ApiService, useValue: mockApiService }
      ]
    });
    
    service = TestBed.inject(PersonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get list of persons', (done) => {
    service.list().subscribe(persons => {
      expect(persons.length).toBe(2);
      expect(persons[0].id).toBe(1);
      expect(persons[0].firstName).toBe('John');
      expect(persons[0].lastName).toBe('Doe');
      expect(persons[1].bookings.length).toBe(1);
      done();
    });
    
    expect(mockApiService.get).toHaveBeenCalledWith('/persons');
  });

  it('should handle empty persons response', (done) => {
    mockApiService.get.and.returnValue(of({ persons: [] }));
    
    service.list().subscribe(persons => {
      expect(persons).toEqual([]);
      done();
    });
  });

  it('should handle null persons response', (done) => {
    mockApiService.get.and.returnValue(of({ persons: null }));
    
    service.list().subscribe(persons => {
      expect(persons).toEqual([]);
      done();
    });
  });

  it('should get a single person by id', (done) => {
    mockApiService.get.and.returnValue(of(mockPersonResponse));
    
    service.get(1).subscribe(person => {
      expect(person.id).toBe(1);
      expect(person.firstName).toBe('John');
      expect(person.lastName).toBe('Doe');
      done();
    });
    
    expect(mockApiService.get).toHaveBeenCalledWith('/persons/1');
  });

  it('should add a new person', (done) => {
    const newPerson: CreatePersonRequest = { firstName: 'New', lastName: 'Person' };
    mockApiService.post.and.returnValue(of({ id: 3, firstName: 'New', lastName: 'Person', bookings: [] }));
    
    service.add(newPerson).subscribe(person => {
      expect(person.id).toBe(3);
      expect(person.firstName).toBe('New');
      expect(person.lastName).toBe('Person');
      done();
    });
    
    expect(mockApiService.post).toHaveBeenCalledWith('/persons', newPerson);
  });

  it('should update an existing person', (done) => {
    const updatePerson: UpdatePersonRequest = { firstName: 'Updated', lastName: 'Person' };
    mockApiService.put.and.returnValue(of({ id: 1, firstName: 'Updated', lastName: 'Person', bookings: [] }));
    
    service.update(1, updatePerson).subscribe(person => {
      expect(person.id).toBe(1);
      expect(person.firstName).toBe('Updated');
      expect(person.lastName).toBe('Person');
      done();
    });
    
    expect(mockApiService.put).toHaveBeenCalledWith('/persons/1', updatePerson);
  });

  it('should delete a person', (done) => {
    service.delete(1).subscribe(() => {
      done();
    });
    
    expect(mockApiService.delete).toHaveBeenCalledWith('/persons/1');
  });

  it('should correctly map booking dates', (done) => {
    const personWithBooking: PersonResponse = {
      id: 2,
      firstName: 'Jane',
      lastName: 'Smith',
      bookings: [
        { id: 1, roomId: 101, personId: 2, bookingDate: '2023-01-01', startSlot: 1, endSlot: 2 }
      ]
    };
    
    mockApiService.get.and.returnValue(of(personWithBooking));
    
    service.get(2).subscribe(person => {
      expect(person.bookings[0].BookingDate instanceof Date).toBeTrue();
      expect(person.bookings[0].BookingDate.toISOString().split('T')[0]).toBe('2023-01-01');
      done();
    });
  });
});