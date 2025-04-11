import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';
import RoomComponent from './room.component';
import RoomService from '../../services/room.service';
import AppModalService from '../../services/modal.service';
import Room from '../../models/room';

describe('RoomComponent', () => {
  let component: RoomComponent;
  let fixture: ComponentFixture<RoomComponent>;
  let roomServiceMock: jasmine.SpyObj<RoomService>;
  let modalServiceMock: jasmine.SpyObj<AppModalService>;
  
  const mockRooms: Room[] = [
    { Id: 1, RoomName: 'Salle 1', Bookings: [] },
    { Id: 2, RoomName: 'Salle 2', Bookings: [] }
  ];

  beforeEach(waitForAsync(() => {
    roomServiceMock = jasmine.createSpyObj('RoomService', ['list', 'add', 'update', 'delete']);
    modalServiceMock = jasmine.createSpyObj('AppModalService', ['alert']);
    
    TestBed.configureTestingModule({
      imports: [FormsModule, RoomComponent],
      providers: [
        { provide: RoomService, useValue: roomServiceMock },
        { provide: AppModalService, useValue: modalServiceMock }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoomComponent);
    component = fixture.componentInstance;
    roomServiceMock.list.and.returnValue(of(mockRooms));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load rooms on initialization', fakeAsync(() => {
      component.ngOnInit();
      tick();
      
      expect(roomServiceMock.list).toHaveBeenCalled();
      expect(component.rooms).toEqual(mockRooms);
    }));

    it('should show error message when rooms loading fails', fakeAsync(() => {
      roomServiceMock.list.and.returnValue(throwError(() => new Error('Network error')));
      
      component.ngOnInit();
      tick();
      
      expect(modalServiceMock.alert).toHaveBeenCalledWith('Impossible de charger la liste des salles.');
      expect(component.rooms).toEqual([]);
    }));
  });

  describe('createRoom', () => {
    it('should create a new room successfully', fakeAsync(() => {
      const newRoom: Room = { Id: 0, RoomName: 'Nouvelle salle', Bookings: [] };
      const createdRoom: Room = { Id: 3, RoomName: 'Nouvelle salle', Bookings: [] };
      
      roomServiceMock.add.and.returnValue(of(createdRoom));
      roomServiceMock.list.and.returnValue(of([...mockRooms, createdRoom]));
      
      component.newRoomName = 'Nouvelle salle';
      component.createRoom();
      tick();
      
      expect(roomServiceMock.add).toHaveBeenCalledWith(newRoom);
      expect(roomServiceMock.list).toHaveBeenCalled();
      expect(component.newRoomName).toBe('');
      expect(modalServiceMock.alert).toHaveBeenCalledWith('La salle a été créée avec succès.');
    }));

    it('should handle error when creating a room fails', fakeAsync(() => {
      roomServiceMock.add.and.returnValue(throwError(() => new Error('Creation error')));
      
      component.newRoomName = 'Nouvelle salle';
      component.createRoom();
      tick();
      
      expect(modalServiceMock.alert).toHaveBeenCalledWith('Erreur lors de la création de la salle.');
    }));

    it('should not attempt to create a room if name is empty', fakeAsync(() => {
      component.newRoomName = '';
      component.createRoom();
      tick();
      
      expect(roomServiceMock.add).not.toHaveBeenCalled();
    }));
  });

  describe('deleteRoom', () => {
    it('should delete a room successfully', fakeAsync(() => {
      roomServiceMock.delete.and.returnValue(of(void 0));
      roomServiceMock.list.and.returnValue(of([mockRooms[1]]));
      
      component.deleteRoom(1);
      tick();
      
      expect(roomServiceMock.delete).toHaveBeenCalledWith(1);
      expect(roomServiceMock.list).toHaveBeenCalled();
      expect(modalServiceMock.alert).toHaveBeenCalledWith('La salle a été supprimée avec succès.');
    }));

    it('should handle error when deleting a room fails', fakeAsync(() => {
      roomServiceMock.delete.and.returnValue(throwError(() => new Error('Deletion error')));
      
      component.deleteRoom(1);
      tick();
      
      expect(modalServiceMock.alert).toHaveBeenCalledWith('Erreur lors de la suppression de la salle.');
    }));
  });

  describe('editRoom', () => {
    it('should set editingRoom when editing starts', () => {
      const room = mockRooms[0];
      component.editRoom(room);
      
      expect(component.editingRoom).toEqual(room);
      expect(component.editingRoom).not.toBe(room); // should be a copy
    });
  });

  describe('updateRoom', () => {
    it('should update a room successfully', fakeAsync(() => {
      const updatedRoom: Room = { Id: 1, RoomName: 'Salle 1 Modifiée', Bookings: [] };
      
      component.editingRoom = updatedRoom;
      roomServiceMock.update.and.returnValue(of(updatedRoom));
      roomServiceMock.list.and.returnValue(of([updatedRoom, mockRooms[1]]));
      
      component.updateRoom();
      tick();
      
      expect(roomServiceMock.update).toHaveBeenCalledWith(1, updatedRoom);
      expect(component.editingRoom).toBeNull();
      expect(modalServiceMock.alert).toHaveBeenCalledWith('La salle a été mise à jour avec succès.');
    }));

    it('should handle error when updating a room fails', fakeAsync(() => {
      component.editingRoom = mockRooms[0];
      roomServiceMock.update.and.returnValue(throwError(() => new Error('Update error')));
      
      component.updateRoom();
      tick();
      
      expect(modalServiceMock.alert).toHaveBeenCalledWith('Erreur lors de la mise à jour de la salle.');
      expect(component.editingRoom).not.toBeNull();
    }));

    it('should not attempt to update if editingRoom is null', fakeAsync(() => {
      component.editingRoom = null;
      component.updateRoom();
      tick();
      
      expect(roomServiceMock.update).not.toHaveBeenCalled();
    }));
  });

  describe('cancelEdit', () => {
    it('should reset editingRoom when canceling edit', () => {
      component.editingRoom = mockRooms[0];
      component.cancelEdit();
      
      expect(component.editingRoom).toBeNull();
    });
  });

  describe('viewRoomDetails', () => {
    it('should log room ID when viewing details', () => {
      spyOn(console, 'log');
      component.viewRoomDetails(1);
      
      expect(console.log).toHaveBeenCalledWith('Afficher les détails de la salle avec l\'ID: 1');
    });
  });
});

// Tests UI dans une suite séparée
describe('RoomComponent UI Tests', () => {
  let component: RoomComponent;
  let fixture: ComponentFixture<RoomComponent>;
  let roomServiceMock: jasmine.SpyObj<RoomService>;
  let modalServiceMock: jasmine.SpyObj<AppModalService>;
  
  const mockRooms: Room[] = [
    { Id: 1, RoomName: 'Salle 1', Bookings: [] },
    { Id: 2, RoomName: 'Salle 2', Bookings: [] }
  ];

  // Configuration pour ce bloc de tests spécifique
  beforeEach(() => {
    roomServiceMock = jasmine.createSpyObj('RoomService', ['list', 'add', 'update', 'delete']);
    modalServiceMock = jasmine.createSpyObj('AppModalService', ['alert']);
    
    TestBed.configureTestingModule({
      imports: [FormsModule, RoomComponent],
      providers: [
        { provide: RoomService, useValue: roomServiceMock },
        { provide: AppModalService, useValue: modalServiceMock }
      ]
    });
    
    fixture = TestBed.createComponent(RoomComponent);
    component = fixture.componentInstance;
    roomServiceMock.list.and.returnValue(of(mockRooms));
  });

  it('should have input for new room name', fakeAsync(() => {
    component.ngOnInit();
    tick();
    fixture.detectChanges();
    
    const input = fixture.debugElement.query(By.css('input[placeholder="Nom de la salle"]'));
    expect(input).toBeTruthy();
  }));

  it('should call createRoom when create button is clicked', fakeAsync(() => {
    component.ngOnInit();
    tick();
    fixture.detectChanges();
    
    spyOn(component, 'createRoom');
    const createButton = fixture.debugElement.query(By.css('.room-form button'));
    expect(createButton).toBeTruthy();
    createButton.triggerEventHandler('click', null);
    
    expect(component.createRoom).toHaveBeenCalled();
  }));

  it('should display rooms list', fakeAsync(() => {
    component.ngOnInit();
    tick();
    fixture.detectChanges();
    
    const roomElements = fixture.debugElement.queryAll(By.css('.room-item'));
    expect(roomElements.length).toBe(2);
  }));

  it('should display room names correctly', fakeAsync(() => {
    component.ngOnInit();
    tick();
    fixture.detectChanges();
    
    const roomNames = fixture.debugElement.queryAll(By.css('.room-name'));
    expect(roomNames.length).toBe(2);
    expect(roomNames[0].nativeElement.textContent).toContain('Salle 1');
    expect(roomNames[1].nativeElement.textContent).toContain('Salle 2');
  }));

  it('should show edit form when edit button is clicked', fakeAsync(() => {
    component.ngOnInit();
    tick();
    fixture.detectChanges();
    
    // Verify edit form is not shown initially
    let editForm = fixture.debugElement.query(By.css('.edit-room'));
    expect(editForm).toBeFalsy();
    
    // Click edit button
    const editButton = fixture.debugElement.query(By.css('.btn-edit'));
    editButton.triggerEventHandler('click', null);
    
    fixture.detectChanges();
    
    // Verify edit form is now shown
    editForm = fixture.debugElement.query(By.css('.edit-room'));
    expect(editForm).toBeTruthy();
  }));

  it('should call deleteRoom when delete button is clicked', fakeAsync(() => {
    component.ngOnInit();
    tick();
    fixture.detectChanges();
    
    spyOn(component, 'deleteRoom');
    const deleteButton = fixture.debugElement.query(By.css('.btn-delete'));
    deleteButton.triggerEventHandler('click', null);
    
    expect(component.deleteRoom).toHaveBeenCalled();
  }));
  
  it('should show no rooms message when rooms array is empty', fakeAsync(() => {
    component.rooms = [];
    fixture.detectChanges();
    
    const noRoomsMessage = fixture.debugElement.query(By.css('.no-rooms'));
    expect(noRoomsMessage).toBeTruthy();
    expect(noRoomsMessage.nativeElement.textContent).toContain('Aucune salle disponible');
  }));
});