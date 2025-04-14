import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';

import RoomComponent from './room.component';
import RoomService from '../../services/room.service';
import AppModalService from '../../services/modal.service';
import Room from '../../models/room';

describe('RoomComponent DOM Tests', () => {
  let component: RoomComponent;
  let fixture: ComponentFixture<RoomComponent>;
  let roomServiceMock: jasmine.SpyObj<RoomService>;
  let modalServiceMock: jasmine.SpyObj<AppModalService>;
  
  const mockRooms: Room[] = [
    { Id: 1, RoomName: 'Salle 1', Bookings: [] },
    { Id: 2, RoomName: 'Salle 2', Bookings: [] }
  ];

  beforeEach(async () => {
    roomServiceMock = jasmine.createSpyObj('RoomService', ['list', 'add', 'update', 'delete']);
    modalServiceMock = jasmine.createSpyObj('AppModalService', ['alert']);
    
    await TestBed.configureTestingModule({
      imports: [FormsModule, RoomComponent],
      providers: [
        { provide: RoomService, useValue: roomServiceMock },
        { provide: AppModalService, useValue: modalServiceMock }
      ]
    }).compileComponents();
    
    roomServiceMock.list.and.returnValue(of(mockRooms));
    
    fixture = TestBed.createComponent(RoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should display page title properly', () => {
    const titleElement = fixture.debugElement.query(By.css('h2'));
    expect(titleElement).toBeTruthy();
    expect(titleElement.nativeElement.textContent).toBe('Gestion des Salles');
  });

  it('should have create form with input and button', () => {
    const formSection = fixture.debugElement.query(By.css('.room-form'));
    expect(formSection).toBeTruthy();
    
    const formTitle = formSection.query(By.css('h3'));
    expect(formTitle.nativeElement.textContent).toBe('Créer une nouvelle salle');
    
    const input = formSection.query(By.css('input'));
    expect(input).toBeTruthy();
    expect(input.attributes['placeholder']).toBe('Nom de la salle');
    
    const button = formSection.query(By.css('button'));
    expect(button).toBeTruthy();
    expect(button.nativeElement.textContent.trim()).toBe('Créer');
  });

  it('should display rooms list section with title', () => {
    const listSection = fixture.debugElement.query(By.css('.room-list'));
    expect(listSection).toBeTruthy();
    
    const listTitle = listSection.query(By.css('h3'));
    expect(listTitle.nativeElement.textContent).toBe('Liste des Salles');
  });

  it('should display correct number of room items', fakeAsync(() => {
    component.ngOnInit();
    tick();
    fixture.detectChanges();
    
    const roomItems = fixture.debugElement.queryAll(By.css('.room-item'));
    expect(roomItems.length).toBe(2);
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

  it('should show "no rooms" message when rooms array is empty', () => {
    component.rooms = [];
    fixture.detectChanges();
    
    const noRoomsMessage = fixture.debugElement.query(By.css('.no-rooms'));
    expect(noRoomsMessage).toBeTruthy();
    expect(noRoomsMessage.nativeElement.textContent).toContain('Aucune salle disponible');
    
    const roomItems = fixture.debugElement.queryAll(By.css('.room-item'));
    expect(roomItems.length).toBe(0);
  });

  it('should disable create button when input is empty', () => {
    component.newRoomName = '';
    fixture.detectChanges();
    
    const createButton = fixture.debugElement.query(By.css('.room-form button'));
    expect(createButton.nativeElement.disabled).toBeTruthy();
  });

  it('should enable create button when input has value', () => {
    component.newRoomName = 'Nouvelle salle';
    fixture.detectChanges();
    
    const createButton = fixture.debugElement.query(By.css('.room-form button'));
    expect(createButton.nativeElement.disabled).toBeFalsy();
  });

  it('should call createRoom when create button is clicked', () => {
    spyOn(component, 'createRoom');
    component.newRoomName = 'Nouvelle salle';
    fixture.detectChanges();
    
    const createButton = fixture.debugElement.query(By.css('.room-form button'));
    createButton.triggerEventHandler('click', null);
    
    expect(component.createRoom).toHaveBeenCalled();
  });

  it('should call deleteRoom with correct ID when delete button is clicked', () => {
    spyOn(component, 'deleteRoom');
    fixture.detectChanges();
    
    const deleteButtons = fixture.debugElement.queryAll(By.css('.btn-delete'));
    expect(deleteButtons.length).toBe(2);
    
    deleteButtons[0].triggerEventHandler('click', null);
    expect(component.deleteRoom).toHaveBeenCalledWith(1);
    
    deleteButtons[1].triggerEventHandler('click', null);
    expect(component.deleteRoom).toHaveBeenCalledWith(2);
  });

  it('should not display edit form initially', () => {
    const editForm = fixture.debugElement.query(By.css('.edit-room'));
    expect(editForm).toBeNull();
  });

  it('should call editRoom with correct room when edit button is clicked', () => {
    spyOn(component, 'editRoom');
    fixture.detectChanges();
    
    const editButtons = fixture.debugElement.queryAll(By.css('.btn-edit'));
    editButtons[0].triggerEventHandler('click', null);
    
    expect(component.editRoom).toHaveBeenCalledWith(mockRooms[0]);
  });

  it('should display edit form when editingRoom has value', fakeAsync(() => {
    component.editingRoom = { ...mockRooms[0] };
    fixture.detectChanges();
    tick(); // Donner le temps à Angular de mettre à jour le DOM
    
    const editForm = fixture.debugElement.query(By.css('.edit-room'));
    expect(editForm).toBeTruthy();
    
    const modalTitle = editForm.query(By.css('h3'));
    expect(modalTitle.nativeElement.textContent).toBe('Modifier la salle');
    
    const input = editForm.query(By.css('input'));
    expect(input).toBeTruthy();
    expect(input.nativeElement.value).toBe('Salle 1');
    
    const buttons = editForm.queryAll(By.css('button'));
    expect(buttons.length).toBe(2);
    expect(buttons[0].nativeElement.textContent.trim()).toBe('Mettre à jour');
    expect(buttons[1].nativeElement.textContent.trim()).toBe('Annuler');
  }));

  it('should call updateRoom when update button is clicked', () => {
    spyOn(component, 'updateRoom');
    component.editingRoom = { ...mockRooms[0] };
    fixture.detectChanges();
    
    const updateButton = fixture.debugElement.query(By.css('.btn-update'));
    updateButton.triggerEventHandler('click', null);
    
    expect(component.updateRoom).toHaveBeenCalled();
  });

  it('should call cancelEdit when cancel button is clicked', () => {
    spyOn(component, 'cancelEdit');
    component.editingRoom = { ...mockRooms[0] };
    fixture.detectChanges();
    
    const cancelButton = fixture.debugElement.query(By.css('.btn-cancel'));
    cancelButton.triggerEventHandler('click', null);
    
    expect(component.cancelEdit).toHaveBeenCalled();
  });

  it('should hide edit form when cancelEdit is called', () => {
    component.editingRoom = { ...mockRooms[0] };
    fixture.detectChanges();
    
    expect(fixture.debugElement.query(By.css('.edit-room'))).toBeTruthy();
    
    component.cancelEdit();
    fixture.detectChanges();
    
    expect(fixture.debugElement.query(By.css('.edit-room'))).toBeNull();
  });

  it('should bind input value with ngModel for new room name', () => {
    const input = fixture.debugElement.query(By.css('.room-form input'));
    
    input.nativeElement.value = 'Test Room';
    input.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    
    expect(component.newRoomName).toBe('Test Room');
  });

  it('should bind input value with ngModel for editing room', () => {
    component.editingRoom = { ...mockRooms[0] };
    fixture.detectChanges();
    
    const input = fixture.debugElement.query(By.css('.edit-room input'));
    
    input.nativeElement.value = 'Updated Room Name';
    input.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    
    expect(component.editingRoom.RoomName).toBe('Updated Room Name');
  });

  it('should include backdrop in edit modal', () => {
    component.editingRoom = { ...mockRooms[0] };
    fixture.detectChanges();
    
    const backdrop = fixture.debugElement.query(By.css('.modal-backdrop'));
    expect(backdrop).toBeTruthy();
  });

  it('should have proper structure for room items', fakeAsync(() => {
    component.ngOnInit();
    tick();
    fixture.detectChanges();
    
    const roomItem = fixture.debugElement.query(By.css('.room-item'));
    expect(roomItem).toBeTruthy(); // Vérifier que l'élément existe avant de continuer
    
    const roomInfo = roomItem.query(By.css('.room-info'));
    expect(roomInfo).toBeTruthy();
    
    const roomName = roomInfo.query(By.css('.room-name'));
    expect(roomName).toBeTruthy();
    
    const roomActions = roomInfo.query(By.css('.room-actions'));
    expect(roomActions).toBeTruthy();
    
    const buttons = roomActions.queryAll(By.css('button'));
    expect(buttons.length).toBe(2);
  }));
});