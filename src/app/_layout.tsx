//Tab: Define la navegacion de tipo stack
//La navegación tipo Stack organiza pantallas como una pila, permitiendo avanzar a nuevas vistas y regresar a las anteriores.
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Tabs } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const qc = new QueryClient() //Administra la cache y el ciclo de vida de todos los Query

export default function Layout(){
  const insets = useSafeAreaInsets()

  return(
    <QueryClientProvider client = {qc}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#E30613',
          tabBarInactiveTintColor: '#737373',
          tabBarLabelStyle: { fontSize: 12, fontWeight: '700' },
          tabBarStyle: {
            backgroundColor: '#E9EDF2',
            borderTopColor: '#FFFFFF',
            height: 62 + insets.bottom,
            paddingTop: 5,
            paddingBottom: insets.bottom + 5,
            shadowColor: '#B8C0CA',
            shadowOffset: { width: 0, height: -3 },
            shadowOpacity: 0.45,
            shadowRadius: 5,
            elevation: 8,
          },
        }}
      >
        <Tabs.Screen name="index" options={{ title: 'Agregar' }} />
        <Tabs.Screen name="explore" options={{ title: 'Mis carros' }} />
      </Tabs>
    </QueryClientProvider>
  )
}

//Todos los componenetes hijos pueden utilizar useQuery, ya que se integra Tanstack con expo.