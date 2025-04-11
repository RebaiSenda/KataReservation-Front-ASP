import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import RoomService from './room.service';
import { ApiService } from './api.service';
import Room from '../models/room';
import { RoomResponse, RoomsResponse } from '../responses/room.response';

describe('RoomService', () => {
  let service: RoomService;
  let apiServiceMock: jasmine.SpyObj<ApiService>;

  const mockRoomResponse: RoomResponse = {
    id: 1,
    roomName: 'Salle Test',
    bookings: []
  };

  const mockRoomsResponse: RoomsResponse = {
    rooms: [
      { id: 1, roomName: 'Salle 1', bookings: [] },
      { id: 2, roomName: 'Salle 2', bookings: [] }
    ]
  };

  const mockRoom: Room = {
    Id: 1,
    RoomName: 'Salle Test',
    Bookings: []
  };

  beforeEach(() => {
    const spy = jasmine.createSpyObj('ApiService', ['get', 'post', 'put', 'delete']);
    
    TestBed.configureTestingModule({
      providers: [
        RoomService,
        { provide: ApiService, useValue: spy }
      ]
    });
    
    service = TestBed.inject(RoomService);
    apiServiceMock = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('list', () => {
    it('should return an array of rooms', () => {
      apiServiceMock.get.and.returnValue(of(mockRoomsResponse));
      
      service.list().subscribe(rooms => {
        expect(rooms.length).toBe(2);
        expect(rooms[0].Id).toBe(1);
        expect(rooms[0].RoomName).toBe('Salle 1');
        expect(rooms[1].Id).toBe(2);
        expect(rooms[1].RoomName).toBe('Salle 2');
      });
      
      expect(apiServiceMock.get).toHaveBeenCalledWith('/rooms');
    });

    it('should return empty array when response has no rooms', () => {
      apiServiceMock.get.and.returnValue(of({ rooms: null }));
      
      service.list().subscribe(rooms => {
        expect(rooms).toEqual([]);
      });
    });

    it('should handle error when fetching rooms fails', (done) => {
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

  describe('get', () => {
    it('should return a single room by id', () => {
      apiServiceMock.get.and.returnValue(of(mockRoomResponse));
      
      service.get(1).subscribe(room => {
        expect(room.Id).toBe(1);
        expect(room.RoomName).toBe('Salle Test');
      });
      
      expect(apiServiceMock.get).toHaveBeenCalledWith('/rooms/1');
    });

    it('should handle error when fetching a room fails', (done) => {
      apiServiceMock.get.and.returnValue(throwError(() => new Error('Not found')));
      
      service.get(99).subscribe({
        next: () => done.fail('Expected error, but got result'),
        error: (error) => {
          expect(error).toBeTruthy();
          done();
        }
      });
    });
  });

  describe('add', () => {
    it('should create a new room', () => {
      apiServiceMock.post.and.returnValue(of(mockRoomResponse));
      
      const newRoom: Room = {
        Id: 0,
        RoomName: 'Salle Test',
        Bookings: []
      };
      
      service.add(newRoom).subscribe(room => {
        expect(room.Id).toBe(1);
        expect(room.RoomName).toBe('Salle Test');
      });
      
      expect(apiServiceMock.post).toHaveBeenCalledWith('/rooms', { roomName: 'Salle Test' });
    });

    it('should handle error when creating a room fails', (done) => {
      apiServiceMock.post.and.returnValue(throwError(() => new Error('Creation error')));
      
      const newRoom: Room = {
        Id: 0,
        RoomName: 'Salle Test',
        Bookings: []
      };
      
      service.add(newRoom).subscribe({
        next: () => done.fail('Expected error, but got result'),
        error: (error) => {
          expect(error).toBeTruthy();
          done();
        }
      });
    });
  });

  describe('update', () => {
    it('should update a room', () => {
      apiServiceMock.put.and.returnValue(of(mockRoomResponse));
      
      service.update(1, mockRoom).subscribe(room => {
        expect(room.Id).toBe(1);
        expect(room.RoomName).toBe('Salle Test');
      });
      
      expect(apiServiceMock.put).toHaveBeenCalledWith('/rooms/1', { roomName: 'Salle Test' });
    });

    it('should handle error when updating a room fails', (done) => {
      apiServiceMock.put.and.returnValue(throwError(() => new Error('Update error')));
      
      service.update(1, mockRoom).subscribe({
        next: () => done.fail('Expected error, but got result'),
        error: (error) => {
          expect(error).toBeTruthy();
          done();
        }
      });
    });
  });

  describe('delete', () => {
    it('should delete a room', () => {
      apiServiceMock.delete.and.returnValue(of(void 0));
      
      service.delete(1).subscribe(() => {
        expect(apiServiceMock.delete).toHaveBeenCalledWith('/rooms/1');
      });
    });

    it('should handle error when deleting a room fails', (done) => {
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

  describe('mapToRoom', () => {
    it('should correctly map API response to Room model', () => {
      apiServiceMock.get.and.returnValue(of(mockRoomResponse));
      
      service.get(1).subscribe(room => {
        expect(room).toEqual({
          Id: 1,
          RoomName: 'Salle Test',
          Bookings: []
        });
      });
    });

    it('should handle empty bookings array', () => {
      const responseWithoutBookings = {
        id: 1,
        roomName: 'Salle Test'
      };
      
      apiServiceMock.get.and.returnValue(of(responseWithoutBookings));
      
      service.get(1).subscribe(room => {
        expect(room.Bookings).toEqual([]);
      });
    });
  });
});