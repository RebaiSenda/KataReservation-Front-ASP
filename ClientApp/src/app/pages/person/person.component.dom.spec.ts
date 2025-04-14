import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PersonComponent } from './person.component';
import PersonService from '../../services/person.service';
import AppModalService from '../../services/modal.service';
import { of, throwError } from 'rxjs';
import Person from '../../models/person';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

describe('PersonComponent DOM Tests', () => {
  let component: PersonComponent;
  let fixture: ComponentFixture<PersonComponent>;
  let mockPersonService: jasmine.SpyObj<PersonService>;
  let mockModalService: jasmine.SpyObj<AppModalService>;
  let el: DebugElement;

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
    el = fixture.debugElement;
    fixture.detectChanges();
  });

  it('should display the correct number of persons in the list', () => {
    const personItems = el.queryAll(By.css('.person-list li'));
    expect(personItems.length).toBe(2);
  });

  it('should display person names correctly', () => {
    const personNames = el.queryAll(By.css('.person-name'));
    expect(personNames[0].nativeElement.textContent).toContain('John Doe');
    expect(personNames[1].nativeElement.textContent).toContain('Jane Smith');
  });

  it('should show booking badge only for persons with bookings', () => {
    const bookingBadges = el.queryAll(By.css('.booking-badge'));
    expect(bookingBadges.length).toBe(1);
    expect(bookingBadges[0].nativeElement.textContent.trim()).toBe('1 réservation(s)');
  });

  it('should display edit/delete buttons for each person', () => {
    const personItems = el.queryAll(By.css('.person-list li'));
    const firstPersonButtons = personItems[0].queryAll(By.css('button'));
    
    expect(firstPersonButtons.length).toBe(2);
    expect(firstPersonButtons[0].nativeElement.textContent).toContain('Modifier');
    expect(firstPersonButtons[1].nativeElement.textContent).toContain('Supprimer');
  });

  it('should display empty list message when there are no persons', () => {
    component.persons = [];
    fixture.detectChanges();
    
    const emptyMessage = el.query(By.css('.empty-list'));
    expect(emptyMessage).toBeTruthy();
    expect(emptyMessage.nativeElement.textContent).toContain('Aucune personne disponible');
  });

  it('should show add person form', () => {
    const addForm = el.query(By.css('.person-form form'));
    const inputs = addForm.queryAll(By.css('input'));
    const submitButton = addForm.query(By.css('button[type="submit"]'));
    
    expect(addForm).toBeTruthy();
    expect(inputs.length).toBe(2);
    expect(submitButton.nativeElement.textContent).toContain('Ajouter');
  });

  it('should have add button disabled when form is empty', () => {
    const addButton = el.query(By.css('.person-form button[type="submit"]'));
    expect(addButton.nativeElement.disabled).toBeTrue();
  });

  it('should enable add button when form is filled', () => {
    // Set form values
    component.newPerson = { firstName: 'Test', lastName: 'User' };
    fixture.detectChanges();
    
    const addButton = el.query(By.css('.person-form button[type="submit"]'));
    expect(addButton.nativeElement.disabled).toBeFalse();
  });

  it('should not show edit form by default', () => {
    const editForm = el.query(By.css('.edit-person'));
    expect(editForm).toBeNull();
  });

  it('should show edit form when editing a person', () => {
    component.editPerson(mockPersons[0]);
    fixture.detectChanges();
    
    const editForm = el.query(By.css('.edit-person'));
    const inputs = editForm.queryAll(By.css('input'));
    const buttons = editForm.queryAll(By.css('button'));
    
    expect(editForm).toBeTruthy();
    expect(inputs.length).toBe(2);
    expect(inputs[0].nativeElement.value).toBe('John');
    expect(inputs[1].nativeElement.value).toBe('Doe');
    expect(buttons.length).toBe(2);
    expect(buttons[0].nativeElement.textContent).toContain('Mettre à jour');
    expect(buttons[1].nativeElement.textContent).toContain('Annuler');
  });

  it('should hide edit form after cancelling', () => {
    component.editPerson(mockPersons[0]);
    fixture.detectChanges();
    
    const cancelButton = el.query(By.css('.edit-person button[type="button"]'));
    cancelButton.nativeElement.click();
    fixture.detectChanges();
    
    const editForm = el.query(By.css('.edit-person'));
    expect(editForm).toBeNull();
  });

  it('should call addPerson when add form is submitted', () => {
    spyOn(component, 'addPerson');
    component.newPerson = { firstName: 'Test', lastName: 'User' };
    fixture.detectChanges();
    
    const form = el.query(By.css('.person-form form'));
    form.triggerEventHandler('submit', { preventDefault: () => {} });
    
    expect(component.addPerson).toHaveBeenCalled();
  });

  it('should call updatePerson when edit form is submitted', () => {
    spyOn(component, 'updatePerson');
    component.editPerson(mockPersons[0]);
    fixture.detectChanges();
    
    const form = el.query(By.css('.edit-person form'));
    form.triggerEventHandler('submit', { preventDefault: () => {} });
    
    expect(component.updatePerson).toHaveBeenCalled();
  });

  it('should call editPerson when modify button is clicked', () => {
    spyOn(component, 'editPerson');
    
    const editButtons = el.queryAll(By.css('.person-actions button:first-child'));
    editButtons[0].nativeElement.click();
    
    expect(component.editPerson).toHaveBeenCalledWith(mockPersons[0]);
  });

  it('should call deletePerson when delete button is clicked', () => {
    spyOn(component, 'deletePerson');
    
    const deleteButtons = el.queryAll(By.css('.person-actions button:last-child'));
    deleteButtons[0].nativeElement.click();
    
    expect(component.deletePerson).toHaveBeenCalledWith(1);
  });

  // Test corrigé sans variables inutilisées
  it('should update input values when typing', fakeAsync(() => {
    // Vérifier que les champs d'entrée existent
    const inputElements = el.queryAll(By.css('.person-form input'));
    expect(inputElements.length).toBe(2);
    
    // Simuler directement les événements via les méthodes du composant
    component.updateFirstName({ target: { value: 'New' } } as unknown as Event);
    component.updateLastName({ target: { value: 'Person' } } as unknown as Event);
    
    // Vérifier que les valeurs ont été mises à jour
    expect(component.newPerson.firstName).toBe('New');
    expect(component.newPerson.lastName).toBe('Person');
  }));

  it('should update editing input values when typing', fakeAsync(() => {
    // Préparer l'édition
    component.editPerson(mockPersons[0]);
    fixture.detectChanges();
    
    // Vérifier que l'objet d'édition existe
    expect(component.editingPerson).not.toBeNull();
    
    // Simuler directement les événements d'édition
    component.updateEditingFirstName({ target: { value: 'Updated' } } as unknown as Event);
    component.updateEditingLastName({ target: { value: 'Name' } } as unknown as Event);
    
    // Vérifier que les valeurs ont été mises à jour
    expect(component.editingPerson?.firstName).toBe('Updated');
    expect(component.editingPerson?.lastName).toBe('Name');
  }));

  it('should perform add operation when form is submitted', fakeAsync(() => {
    component.newPerson = { firstName: 'New', lastName: 'Person' };
    fixture.detectChanges();
    
    const addForm = el.query(By.css('.person-form form'));
    addForm.triggerEventHandler('submit', { preventDefault: () => {} });
    
    tick();
    
    expect(mockPersonService.add).toHaveBeenCalledWith({ firstName: 'New', lastName: 'Person' });
    expect(mockModalService.alert).toHaveBeenCalledWith('Personne ajoutée avec succès');
    expect(component.newPerson).toEqual({ firstName: '', lastName: '' });
  }));

  it('should perform update operation when edit form is submitted', fakeAsync(() => {
    component.editPerson(mockPersons[0]);
    fixture.detectChanges();
    
    component.editingPerson!.firstName = 'Updated';
    fixture.detectChanges();
    
    const editForm = el.query(By.css('.edit-person form'));
    editForm.triggerEventHandler('submit', { preventDefault: () => {} });
    
    tick();
    
    expect(mockPersonService.update).toHaveBeenCalledWith(1, jasmine.objectContaining({
      id: 1,
      firstName: 'Updated',
      lastName: 'Doe'
    }));
    expect(mockModalService.alert).toHaveBeenCalledWith('Personne mise à jour avec succès');
    expect(component.editingPerson).toBeNull();
  }));

  it('should show error alert when loading persons fails', fakeAsync(() => {
    mockPersonService.list.and.returnValue(throwError(() => new Error('API error')));
    component.loadPersons();
    tick();
    
    expect(mockModalService.alert).toHaveBeenCalledWith('Erreur lors du chargement des personnes: API error');
  }));

  it('should reload persons list after successful operations', fakeAsync(() => {
    // Correctly type the spy
    const loadPersonsSpy = spyOn(component, 'loadPersons').and.callThrough();
    
    // Test add
    component.addPerson();
    tick();
    expect(loadPersonsSpy).toHaveBeenCalled();
    loadPersonsSpy.calls.reset();
    
    // Test update
    component.editingPerson = { id: 1, firstName: 'Updated', lastName: 'Person' };
    component.updatePerson();
    tick();
    expect(loadPersonsSpy).toHaveBeenCalled();
    loadPersonsSpy.calls.reset();
    
    // Test delete
    component.deletePerson(1);
    tick();
    expect(loadPersonsSpy).toHaveBeenCalled();
  }));
});