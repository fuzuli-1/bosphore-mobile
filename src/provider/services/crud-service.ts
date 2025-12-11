import { Injectable } from '@angular/core';
import { Api } from '../api/api';

@Injectable({
  providedIn: 'root',
})
export class CrudService {
  constructor(private api: Api) {}

  list(endpoint: string, params?: any) {
    return this.api.get(endpoint, params);
  }

  getById(endpoint: string, id: number | string) {
    return this.api.get(`${endpoint}/${id}`);
  }

  create(endpoint: string, body: any) {
    return this.api.post(endpoint, body);
  }

  update(endpoint: string, id: number | string, body: any) {
    return this.api.put(`${endpoint}/${id}`, body);
  }

  delete(endpoint: string, id: number | string) {
    return this.api.delete(`${endpoint}/${id}`);
  }

  count(endpoint: string, params?: any) {
    return this.api.get(`${endpoint}/count`, params);
  }
}
