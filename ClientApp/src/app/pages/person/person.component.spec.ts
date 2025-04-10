import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PersonComponent } from './person.component';
import PersonService from '../../services/person.service';
import AppModalService from '../../services/modal.service';
import { of, throwError } from 'rxjs';
import Person from '../../models/person';

describe('PersonComponent', () => {
  let component: PersonComponent;
  let fixture: ComponentFixture<PersonComponent>;
  let mockPersonService: jasmine.SpyObj<PersonService>;
  let mockModalService: jasmine.SpyObj<AppModalService>;

  const mockPersons: Person[] = [
    { id: 1, firstName: 'John', lastName: 'Doe', bookings: [] },
    { id: 2, firstName: 'Jane', lastName: 'Smith', bookings: [{ Id: 1, RoomId: 101, PersonId: 2, BookingDate: new Date(), StartSlot: 1, EndSlot: 2 }] }
  ];

  beforeEach(async () => {
    mockPersonService = jasmine.createSpyObj('PersonService', ['list', 'add', 'update', 'delete']);
    mockModalService = jasmine.createSpyObj('AppModalService', ['alert']);

    mockPersonService.list.and.returnValue(of(mockPersons));
    mockPersonService.add.and.returnValue(of({ id: 3, firstName: 'New', lastName: 'Person', bookings: [] }));
    mockPersonService.update.and.returnValue(of({ id: 1, firstName: 'Updated', lastName: 'Person', bookings: [] }));
    mockPersonService.delete.and.returnValue(of(void 0));

    await TestBed.configureTestingModule({
      imports: [PersonComponent], // Importing the standalone component
      providers: [
        { provide: PersonService, useValue: mockPersonService },
        { provide: AppModalService, useValue: mockModalService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PersonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load persons on init', () => {
    component.loadPersons();
    expect(mockPersonService.list).toHaveBeenCalled();
    expect(component.persons).toEqual(mockPersons);
  });

  it('should handle error when loading persons fails', fakeAsync(() => {
    mockPersonService.list.and.returnValue(throwError(() => new Error('API error')));
    component.loadPersons();
    tick();
    expect(mockModalService.alert).toHaveBeenCalledWith('Erreur lors du chargement des personnes: API error');
  }));

  it('should add a new person successfully', fakeAsync(() => {
    // Stocker la valeur dans une variable séparée
    const personToAdd = { firstName: 'New', lastName: 'Person' };
    component.newPerson = personToAdd;
    
    spyOn(component, 'loadPersons');
    component.addPerson();
    tick();
    
    // Utiliser la variable stockée au lieu de component.newPerson
    expect(mockPersonService.add).toHaveBeenCalledWith(personToAdd);
    expect(component.loadPersons).toHaveBeenCalled();
    expect(mockModalService.alert).toHaveBeenCalledWith('Personne ajoutée avec succès');
    expect(component.newPerson).toEqual({ firstName: '', lastName: '' }); // Vérifier que le formulaire est réinitialisé
  }));

  it('should handle error when adding a person fails', fakeAsync(() => {
    mockPersonService.add.and.returnValue(throwError(() => new Error('Add error')));
    component.newPerson = { firstName: 'New', lastName: 'Person' };
    component.addPerson();
    tick();
    expect(mockModalService.alert).toHaveBeenCalledWith('Erreur lors de l\'ajout: Add error');
  }));

  it('should prepare person for editing', () => {
    const person = mockPersons[0];
    component.editPerson(person);
    expect(component.editingPerson).toEqual({ id: person.id, firstName: person.firstName, lastName: person.lastName });
  });

  it('should update a person successfully', fakeAsync(() => {
    // Stockez l'objet editingPerson dans une variable séparée
    const personToUpdate = { id: 1, firstName: 'Updated', lastName: 'Person' };
    component.editingPerson = personToUpdate;
    spyOn(component, 'loadPersons');
    
    component.updatePerson();
    tick();
    
    // Utilisez la variable stockée au lieu de component.editingPerson
    expect(mockPersonService.update).toHaveBeenCalledWith(1, personToUpdate);
    expect(component.loadPersons).toHaveBeenCalled();
    expect(mockModalService.alert).toHaveBeenCalledWith('Personne mise à jour avec succès');
    expect(component.editingPerson).toBeNull(); // Vérifie que cancelEdit a été appelé
  }));

  it('should handle error when updating a person fails', fakeAsync(() => {
    mockPersonService.update.and.returnValue(throwError(() => new Error('Update error')));
    component.editingPerson = { id: 1, firstName: 'Updated', lastName: 'Person' };
    component.updatePerson();
    tick();
    expect(mockModalService.alert).toHaveBeenCalledWith('Erreur lors de la mise à jour: Update error');
  }));

  it('should not attempt to update when editingPerson is null', () => {
    component.editingPerson = null;
    component.updatePerson();
    expect(mockPersonService.update).not.toHaveBeenCalled();
  });

  it('should delete a person successfully', fakeAsync(() => {
    spyOn(component, 'loadPersons');
    component.deletePerson(1);
    tick();
    expect(mockPersonService.delete).toHaveBeenCalledWith(1);
    expect(component.loadPersons).toHaveBeenCalled();
    expect(mockModalService.alert).toHaveBeenCalledWith('Personne supprimée avec succès');
  }));

  it('should handle error when deleting a person fails', fakeAsync(() => {
    mockPersonService.delete.and.returnValue(throwError(() => new Error('Delete error')));
    component.deletePerson(1);
    tick();
    expect(mockModalService.alert).toHaveBeenCalledWith('Erreur lors de la suppression: Delete error');
  }));

  it('should cancel editing', () => {
    component.editingPerson = { id: 1, firstName: 'Test', lastName: 'User' };
    component.cancelEdit();
    expect(component.editingPerson).toBeNull();
  });

  it('should check if a person has bookings', () => {
    expect(component.hasBookings(mockPersons[0])).toBeFalse();
    expect(component.hasBookings(mockPersons[1])).toBeTrue();
  });

  it('should get booking count for a person', () => {
    expect(component.getBookingsCount(mockPersons[0])).toBe(0);
    expect(component.getBookingsCount(mockPersons[1])).toBe(1);
  });

  it('should update newPerson firstName', () => {
    const event = { target: { value: 'TestName' } } as unknown as Event;
    component.updateFirstName(event);
    expect(component.newPerson.firstName).toBe('TestName');
  });

  it('should update newPerson lastName', () => {
    const event = { target: { value: 'TestSurname' } } as unknown as Event;
    component.updateLastName(event);
    expect(component.newPerson.lastName).toBe('TestSurname');
  });

  it('should update editingPerson firstName', () => {
    component.editingPerson = { id: 1, firstName: 'Old', lastName: 'Name' };
    const event = { target: { value: 'New' } } as unknown as Event;
    component.updateEditingFirstName(event);
    expect(component.editingPerson.firstName).toBe('New');
  });

  it('should update editingPerson lastName', () => {
    component.editingPerson = { id: 1, firstName: 'Old', lastName: 'Name' };
    const event = { target: { value: 'Surname' } } as unknown as Event;
    component.updateEditingLastName(event);
    expect(component.editingPerson.lastName).toBe('Surname');
  });

  it('should not update editingPerson when it is null', () => {
    component.editingPerson = null;
    const event = { target: { value: 'Test' } } as unknown as Event;
    component.updateEditingFirstName(event);
    component.updateEditingLastName(event);
    expect(component.editingPerson).toBeNull();
  });
});