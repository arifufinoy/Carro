//Importamos los hooks de tanstack query
/*
    useQuery: Para consultas GET
    useMutation: POST/PUT/DELETE
    useQueryClient: Interactuar con la cache.
*/
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query'
import { carrosService } from '@/api/carros.service'
import { Carro } from '@/types/carro'

//Creamos una KEY relacionada solo con carros.
const KEY = ['carros']

export function useCarros(){
    return useQuery({
        queryKey: ['carros'],
        queryFn: () => { console.log("Get ejecutado con useQuery TanStack")
            return carrosService.getAll()
        },

        //Cuanto tiempo los datos se consideran frescos.
        staleTime: 1000*60*5 //Cache valido por 5 minutos.

    })
}

//HOOK con logica para agregar un carro.
export function useAgregarCarro() {
    const qc = useQueryClient()
    //useMutation para poder realizar un POST y asi llamar a carrosService.add
    return useMutation({
        mutationFn: (carro: Omit<Carro, 'id'>) => carrosService.add(carro),
        onSuccess: () => qc.invalidateQueries({queryKey: KEY}) //Refresca la lista automaticamente.
    })
}

export function useEditarCarro() {
    const qc = useQueryClient()

    return useMutation({
        mutationFn: ({id, carro}: {id: string; carro: Omit<Carro, 'id'>}) =>
            carrosService.update(id, carro),
        onSuccess: () => qc.invalidateQueries({queryKey: KEY})
    })
}

export function useEliminarCarro() {
    const qc = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => carrosService.remove(id),
        onMutate: async (id) => {
            await qc.cancelQueries({queryKey: KEY})
            const previousCarros = qc.getQueryData<Carro[]>(KEY)

            qc.setQueryData<Carro[]>(KEY, carros =>
                carros?.filter(carro => carro.id !== id)
            )

            return {previousCarros}
        },
        onError: (_error, _id, context) => {
            if (context?.previousCarros) {
                qc.setQueryData(KEY, context.previousCarros)
            }
        },
        onSettled: () => qc.invalidateQueries({queryKey: KEY})
    })
}
