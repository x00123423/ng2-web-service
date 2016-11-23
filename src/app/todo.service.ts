// Imports

import { Injectable } from '@angular/core';

import { Headers, Http } from '@angular/http';

import { Observable } from 'rxjs/Observable';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import 'rxjs/add/operator/map';

import {Todo} from './todo';

@Injectable()

export class TodoService {

/* Represents a value that changes over time.

Observers can subscribe to the subject to receive

the last (or initial) value and all subsequent notifications */

private _todos: BehaviorSubject<Todo[]>;

// Base URL of RESTful service - replace with your own

private baseUrl = 'http://5835abca85c70c1200ed69cf.mockapi.io';

// Define header content type - very important!

private headers = new Headers({'Content-Type': 'application/json'});

// This is for a local copy of the data

private dataStore: {

todos: Todo[]

};

constructor(private http: Http) {

this.dataStore = { todos: [] };

// BehaviorSubject can recieve and emit new Todo lists.

this._todos = <BehaviorSubject<Todo[]>>new BehaviorSubject([]);

}

// a public getter for _todos (public readonly)

get todos() {

return this._todos.asObservable();

}

// Connect to the WS endpoint which returns all data (get)

loadAll() {

this.http.get(`${this.baseUrl}/todos`)

// Get the response and 'subscribe' it to the local data

// This enables ansyc update of local data

.map(response => response.json()).subscribe(data => {

this.dataStore.todos = data;

this._todos.next(Object.assign({}, this.dataStore).todos);

}, error => console.log('Could not load todos.'));

}

// Connect to the WS endpoint which returns a single item by id (get)

load(id: number | string) {

this.http.get(`${this.baseUrl}/todos/${id}`)

.map(response => response.json())

.subscribe(data => {

let notFound = true;

this.dataStore.todos

.forEach((item, index) => {

if (item.id === data.id) {

this.dataStore.todos[index] = data;

notFound = false;

}

});

if (notFound) {

this.dataStore.todos.push(data);

}

this._todos.next(Object.assign({}, this.dataStore).todos);

}, error => console.log('Could not load todo.'));

}

// Connect to the WS endpoint which posts data to add a new Todo (post)

create(todo: Todo) {

console.log(JSON.stringify(todo));

this.http.post(`${this.baseUrl}/todos`,

// Convert object to JSON

JSON.stringify(todo),

// Send headers to define content

{headers: this.headers})

// Update the local data with the new object

.map(response => response.json())

.subscribe(data => {

this.dataStore.todos.push(data);

this._todos.next(Object.assign({}, this.dataStore).todos);

}, error => console.log('Could not create todo.'));

}

// Connect to the WS endpoint to modify a Todo (put)

toggleTodoComplete(todo: Todo) {

this.http.put(`${this.baseUrl}/todos/${todo.id}`,

JSON.stringify(todo))

.map(response => response.json()).subscribe(data => {

this.dataStore.todos.forEach((t, i) => {

if (t.id === data.id) {

// Set complete to be opposite its current value

data.complete = !t.complete;

this.dataStore.todos[i] = data;

}

});

this._todos.next(Object.assign({}, this.dataStore).todos);

}, error => console.log('Could not update todo.'));

}

// Connect to the WS endpoint to delete a Todo by id (delete)

remove(todoId: number) {

this.http.delete(`${this.baseUrl}/todos/${todoId}`)

.subscribe(response => {

this.dataStore.todos.forEach((t, i) => {

if (t.id === todoId) {

this.dataStore.todos.splice(i, 1);

}

});

this._todos.next(Object.assign({},

this.dataStore).todos);

}, error => console.log('Could not delete todo.'));

}

}