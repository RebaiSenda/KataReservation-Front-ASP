import { Component, OnInit } from '@angular/core';
import { CommonModule ,NgIf,NgFor} from '@angular/common';
import Person from '../../models/person';
import PersonService from '../../services/person.service';
import AppModalService from '../../services/modal.service';
import { CreatePersonRequest, UpdatePersonRequest } from '../../requests/person.request';

@Component({
  selector: 'app-person',
  templateUrl: './person.component.html',
  styleUrls: ['./person.component.css'],
  imports: [CommonModule, NgIf, NgFor],
  standalone: true  
})
export class PersonComponent implements OnInit {
  persons: Person[] = [];
  newPerson: CreatePersonRequest = { firstName: '', lastName: '' };
  editingPerson: UpdatePersonRequest & { id: number } | null = null;

  constructor(
    private personService: PersonService,
    private modalService: AppModalService
  ) {}

  ngOnInit(): void {
    this.loadPersons();
  }

  loadPersons(): void {
    this.personService.list().subscribe({
      next: (data) => {
        this.persons = data;
      },
      error: (err) => {
        this.modalService.alert(`Erreur lors du chargement des personnes: ${err.message}`);
      }
    });
  }

  addPerson(): void {
    this.personService.add(this.newPerson).subscribe({
      next: () => {
        this.loadPersons();
        this.newPerson = { firstName: '', lastName: '' };
        this.modalService.alert('Personne ajoutée avec succès');
      },
      error: (err) => {
        this.modalService.alert(`Erreur lors de l'ajout: ${err.message}`);
      }
    });
  }

  editPerson(person: Person): void {
    this.editingPerson = {
      id: person.id,
      firstName: person.firstName,
      lastName: person.lastName
    };
  }

  updatePerson(): void {
    if (!this.editingPerson) return;
    
    this.personService.update(this.editingPerson.id, this.editingPerson).subscribe({
      next: () => {
        this.loadPersons();
        this.cancelEdit();
        this.modalService.alert('Personne mise à jour avec succès');
      },
      error: (err) => {
        this.modalService.alert(`Erreur lors de la mise à jour: ${err.message}`);
      }
    });
  }

  deletePerson(id: number): void {
    this.personService.delete(id).subscribe({
      next: () => {
        this.loadPersons();
        this.modalService.alert('Personne supprimée avec succès');
      },
      error: (err) => {
        this.modalService.alert(`Erreur lors de la suppression: ${err.message}`);
      }
    });
  }

  cancelEdit(): void {
    this.editingPerson = null;
  }

  hasBookings(person: Person): boolean {
    return person.bookings && person.bookings.length > 0;
  }

  getBookingsCount(person: Person): number {
    return person.bookings ? person.bookings.length : 0;
  }

  updateFirstName(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.newPerson.firstName = target.value;
  }

  updateLastName(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.newPerson.lastName = target.value;
  }

  updateEditingFirstName(event: Event): void {
    if (!this.editingPerson) return;
    const target = event.target as HTMLInputElement;
    this.editingPerson.firstName = target.value;
  }

  updateEditingLastName(event: Event): void {
    if (!this.editingPerson) return;
    const target = event.target as HTMLInputElement;
    this.editingPerson.lastName = target.value;
  }
}