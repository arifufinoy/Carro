import { Carro } from '../types/carro'
import { client } from './client'

export const carrosService = {
    //Metodo get para obtener los carros
    getAll: async(): Promise<Carro[]> => {
        const {data} = await client.get<Carro[]>('Patio')
        return data
    },

    add: async (carro: Omit<Carro, 'id'>): Promise<Carro> => {
        const{data} = await client.post<Carro>('Patio', carro)
        return data
    },

    update: async (id: string, carro: Omit<Carro, 'id'>): Promise<Carro> => {
        const {data} = await client.put<Carro>(`Patio/${encodeURIComponent(id)}`, carro)
        return data
    },

    remove: async (id: string): Promise<void> => {
        await client.delete(`Patio/${encodeURIComponent(id)}`)
    }


}