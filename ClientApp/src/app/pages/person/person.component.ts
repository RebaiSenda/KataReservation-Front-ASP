import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { firstValueFrom } from 'rxjs';
import AppPersonService from '../../services/person.service'; 
import Person from '../../models/person';
import { PersonRequest } from '../../requests/person.request';

@Component({
    selector: 'app-person',
    templateUrl: './person.component.html',
    styleUrls: ['./person.component.css'],
    standalone: true,
    imports: [CommonModule, FormsModule]
})

export class PersonComponent implements OnInit {
    persons: Person[] = [];
    newPerson: PersonRequest = { firstName: '', lastName: '' };
    editingPerson: Person | null = null;

    constructor(private personService: AppPersonService) {}

    async ngOnInit() {
        await this.loadPersons();
    }

    private async loadPersons() {
        try {
            const response = await firstValueFrom(this.personService.list());
            console.log('Réponse de l\'API:', response);
            console.log('Type de réponse:', Array.isArray(response) ? 'Array' : typeof response);
            
            // Si la réponse n'est pas un tableau mais un objet avec une propriété data ou similaire
            if (!Array.isArray(response) && typeof response === 'object') {
                // Rechercher une propriété qui pourrait contenir le tableau
                const possibleArrayProps = Object.keys(response).filter(key => 
                    Array.isArray(response[key])
                );
                
                if (possibleArrayProps.length > 0) {
                    this.persons = response[possibleArrayProps[0]];
                } else {
                    // Si aucun tableau n'est trouvé, convertir l'objet en tableau
                    const personArray = Object.values(response).filter(val => 
                        typeof val === 'object' && val !== null && 'id' in val
                    );
                    this.persons = personArray as Person[];
                }
            } else {
                // Si c'est déjà un tableau
                this.persons = Array.isArray(response) ? response : [];
            }
        } catch (error) {
            console.error('Erreur lors du chargement des personnes:', error);
            this.persons = [];
        }
    }

    async addPerson() {
        try {
            const person = await firstValueFrom(this.personService.add(this.newPerson));
            console.log('Personne ajoutée:', person);
            
            // S'assurer que this.persons est un tableau
            if (!Array.isArray(this.persons)) {
                this.persons = [];
            }
            
            if (person) {
                this.persons = [...this.persons, person]; // Utiliser un nouveau tableau
                this.newPerson = { firstName: '', lastName: '' };
            } else {
                console.error('La réponse de l\'ajout n\'est pas valide:', person);
            }
        } catch (error) {
            console.error('Erreur lors de l\'ajout de la personne:', error);
        }
    }

    async deletePerson(id: number) {
        try {
            await firstValueFrom(this.personService.delete(id));
            this.persons = this.persons.filter(person => person.id !== id);
        } catch (error) {
            console.error('Erreur lors de la suppression de la personne:', error);
        }
    }

    editPerson(person: Person) {
        this.editingPerson = { ...person };
    }

    async updatePerson(person: Person) {
        try {
            await firstValueFrom(this.personService.update(person));
            const index = this.persons.findIndex(p => p.id === person.id);
            if (index !== -1) {
                const updatedPersons = [...this.persons];
                updatedPersons[index] = person;
                this.persons = updatedPersons;
            }
            this.editingPerson = null;
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la personne:', error);
        }
    }

    cancelEdit() {
        this.editingPerson = null;
    }
}