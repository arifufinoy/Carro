import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { useCarros, useEditarCarro, useEliminarCarro } from '../hooks/use-carros'
import { Carro } from '../types/carro'
import { carFieldValidators, type CarroField } from '../utils/car-validation'

const colors = {
  red: '#E30613',
  darkRed: '#B80012',
  background: '#E9EDF2',
  surface: '#EEF1F5',
  inset: '#E3E8EE',
  text: '#242424',
  muted: '#737373',
  border: '#FFFFFF',
  white: '#FFFFFF',
  green: '#147A42',
}

export default function Explore() {
  const { data: carros = [], isLoading, error } = useCarros()
  const [carroEnEdicion, setCarroEnEdicion] = useState<Carro | null>(null)
  const [carroPorEliminar, setCarroPorEliminar] = useState<Carro | null>(null)
  const {
    mutate: editarCarro,
    isPending: editando,
    isSuccess: edicionExitosa,
    isError: errorEdicion,
    error: detalleErrorEdicion,
    reset: resetEdicion,
  } = useEditarCarro()
  const {
    mutate: eliminarCarro,
    isPending: eliminando,
    isSuccess: eliminacionExitosa,
    isError: errorEliminacion,
    error: detalleErrorEliminacion,
    reset: resetEliminacion,
  } = useEliminarCarro()

  const form = useForm({
    defaultValues: {
      marca: '',
      color: '',
      modelo: '',
      tipo: '',
    },
    onSubmit: ({ value }) => {
      if (!carroEnEdicion) return

      editarCarro(
        { id: carroEnEdicion.id, carro: value },
        { onSuccess: () => setCarroEnEdicion(null) },
      )
    },
  })

  const iniciarEdicion = (carro: Carro) => {
    resetEdicion()
    setCarroEnEdicion(carro)
    form.reset({
      marca: carro.marca,
      color: carro.color,
      modelo: carro.modelo,
      tipo: carro.tipo,
    })
    void form.validateAllFields('change')
  }

  const renderField = (
    name: CarroField,
    label: string,
  ) => (
    <form.Field
      name={name}
      validators={carFieldValidators(name)}
    >
      {(field) => (
        <View style={styles.field}>
          <Text style={styles.label}>{label}</Text>
          <TextInput
            placeholder={label}
            placeholderTextColor={colors.muted}
            value={field.state.value}
            onChangeText={field.handleChange}
            style={styles.input}
            accessibilityLabel={label}
          />
          {field.state.meta.errors.map(fieldError => (
            <Text key={fieldError} style={styles.fieldError}>{fieldError}</Text>
          ))}
        </View>
      )}
    </form.Field>
  )

  const actionButton = (
    title: string,
    onPress: () => void,
    variant: 'primary' | 'secondary' | 'danger',
    disabled = false,
  ) => (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.actionButton,
        variant === 'primary' && styles.primaryButton,
        variant === 'secondary' && styles.secondaryButton,
        variant === 'danger' && styles.dangerButton,
        disabled && styles.disabledButton,
        pressed && !disabled && styles.pressedButton,
      ]}
    >
      <Text style={[
        styles.actionButtonText,
        variant === 'secondary' && styles.secondaryButtonText,
        variant === 'danger' && styles.dangerButtonText,
      ]}>
        {title}
      </Text>
    </Pressable>
  )

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={styles.content}
      data={carros}
      keyExtractor={item => item.id}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.eyebrow}>PATIO TUERCA · MI GARAJE</Text>
          <Text style={styles.title}>Mis carros</Text>
          <Text style={styles.subtitle}>Administra la información de tus vehículos.</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryText}>
              <Text style={styles.summaryTitle}>Tu garaje</Text>
              <Text style={styles.summaryCopy}>
                {carros.length} {carros.length === 1 ? 'vehículo registrado' : 'vehículos registrados'}
              </Text>
            </View>
            <View style={styles.summaryCount}>
              <Text style={styles.summaryCountText}>{carros.length}</Text>
            </View>
          </View>
        </View>
      }
      ListEmptyComponent={
        isLoading ? (
          <View style={styles.stateCard}>
            <ActivityIndicator color={colors.red} size="large" />
            <Text style={styles.stateText}>Cargando tus carros...</Text>
          </View>
        ) : error ? (
          <View style={styles.stateCard}>
            <Text style={styles.emptyTitle}>No pudimos cargar tus carros</Text>
            <Text style={styles.stateText}>{error.message}</Text>
          </View>
        ) : (
          <View style={styles.stateCard}>
            <Text style={styles.emptyTitle}>Tu garaje está vacío</Text>
            <Text style={styles.stateText}>Agrega un carro para verlo aquí.</Text>
          </View>
        )
      }
      renderItem={({ item }) => {
        const editing = carroEnEdicion?.id === item.id
        const confirmingDelete = carroPorEliminar?.id === item.id

        return (
          <View style={styles.carCard}>
            <View style={styles.carCardHeading}>
              <View style={styles.carInfo}>
                <Text style={styles.carName}>{item.marca} {item.modelo}</Text>
                <Text style={styles.carMeta}>{item.tipo} · {item.color}</Text>
                <Text style={styles.carId}>Registro #{item.id}</Text>
              </View>
            </View>

            {!editing && !confirmingDelete && (
              <View style={styles.buttonRow}>
                {actionButton('Editar', () => iniciarEdicion(item), 'secondary', editando || eliminando)}
                {actionButton('Eliminar', () => {
                  resetEliminacion()
                  setCarroPorEliminar(item)
                }, 'danger', editando || eliminando)}
              </View>
            )}

            {editing && (
              <View style={styles.inlinePanel}>
                <Text style={styles.panelTitle}>Editar vehículo</Text>
                {renderField('marca', 'Marca')}
                {renderField('modelo', 'Modelo')}
                <View style={styles.fieldRow}>
                  <View style={styles.halfField}>{renderField('color', 'Color')}</View>
                  <View style={styles.halfField}>{renderField('tipo', 'Tipo')}</View>
                </View>
                <form.Subscribe selector={state => state.canSubmit}>
                  {(canSubmit) => (
                    <View style={styles.buttonRow}>
                      {actionButton(
                        editando ? 'Guardando...' : 'Guardar cambios',
                        () => void form.handleSubmit(),
                        'primary',
                        !canSubmit || editando || eliminando,
                      )}
                      {actionButton(
                        'Cancelar',
                        () => setCarroEnEdicion(null),
                        'secondary',
                        editando,
                      )}
                    </View>
                  )}
                </form.Subscribe>
              </View>
            )}

            {confirmingDelete && (
              <View style={styles.confirmPanel}>
                <Text style={styles.panelTitle}>¿Eliminar este carro?</Text>
                <Text style={styles.confirmCopy}>Esta acción quitará el vehículo de tu garaje.</Text>
                <View style={styles.buttonRow}>
                  {actionButton(
                    eliminando ? 'Eliminando...' : 'Sí, eliminar',
                    () => eliminarCarro(item.id, {
                      onSuccess: () => setCarroPorEliminar(null),
                    }),
                    'danger',
                    eliminando || editando,
                  )}
                  {actionButton(
                    'Cancelar',
                    () => setCarroPorEliminar(null),
                    'secondary',
                    eliminando,
                  )}
                </View>
              </View>
            )}
          </View>
        )
      }}
      ListFooterComponent={
        <View style={styles.feedback}>
          {edicionExitosa && <Text style={styles.successText}>Carro editado correctamente.</Text>}
          {errorEdicion && (
            <Text style={styles.errorText}>Error al editar el carro: {detalleErrorEdicion.message}</Text>
          )}
          {eliminacionExitosa && <Text style={styles.successText}>Carro eliminado correctamente.</Text>}
          {errorEliminacion && (
            <Text style={styles.errorText}>Error al eliminar el carro: {detalleErrorEliminacion.message}</Text>
          )}
        </View>
      }
    />
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 16,
  },
  eyebrow: {
    color: colors.red,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 6,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 5,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 15,
    marginBottom: 16,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 13,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#B8C0CA',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.55,
    shadowRadius: 7,
    elevation: 4,
  },
  summaryText: {
    flex: 1,
  },
  summaryTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 3,
  },
  summaryCopy: {
    color: colors.muted,
    fontSize: 14,
  },
  summaryCount: {
    minWidth: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: colors.inset,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    shadowColor: '#B8C0CA',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.45,
    shadowRadius: 3,
  },
  summaryCountText: {
    color: colors.darkRed,
    fontSize: 16,
    fontWeight: '800',
  },
  carCard: {
    backgroundColor: colors.surface,
    borderColor: '#FFFFFF',
    borderWidth: 1,
    borderRadius: 15,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#B8C0CA',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.55,
    shadowRadius: 7,
    elevation: 4,
  },
  carCardHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 13,
  },
  carInfo: {
    flex: 1,
  },
  carName: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  carMeta: {
    color: colors.muted,
    fontSize: 14,
    marginBottom: 4,
  },
  carId: {
    color: '#929292',
    fontSize: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 9,
  },
  actionButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  primaryButton: {
    backgroundColor: colors.red,
    borderColor: '#F35C65',
    shadowColor: colors.darkRed,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 3,
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    borderColor: '#FFFFFF',
    shadowColor: '#B8C0CA',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 2,
  },
  dangerButton: {
    backgroundColor: colors.inset,
    borderColor: '#FFFFFF',
    shadowColor: '#B8C0CA',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  secondaryButtonText: {
    color: colors.text,
  },
  dangerButtonText: {
    color: colors.darkRed,
  },
  disabledButton: {
    opacity: 0.55,
  },
  pressedButton: {
    transform: [{ translateY: 1 }],
    borderBottomWidth: 1,
    opacity: 0.9,
  },
  inlinePanel: {
    backgroundColor: colors.inset,
    borderColor: '#FFFFFF',
    borderWidth: 1,
    borderRadius: 11,
    padding: 12,
    marginTop: 2,
  },
  panelTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 11,
  },
  field: {
    marginBottom: 11,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  input: {
    height: 48,
    backgroundColor: colors.inset,
    borderColor: '#FFFFFF',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 11,
    color: colors.text,
    fontSize: 15,
    shadowColor: '#B8C0CA',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  fieldError: {
    color: colors.darkRed,
    fontSize: 12,
    marginTop: 4,
  },
  fieldRow: {
    flexDirection: 'row',
    gap: 10,
  },
  halfField: {
    flex: 1,
  },
  confirmPanel: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: colors.inset,
    borderColor: '#FFFFFF',
    borderWidth: 1,
    marginTop: 2,
  },
  confirmCopy: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: -5,
    marginBottom: 12,
  },
  stateCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 13,
    padding: 22,
    shadowColor: '#B8C0CA',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 3,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  stateText: {
    color: colors.muted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 7,
  },
  feedback: {
    paddingTop: 4,
  },
  successText: {
    color: colors.green,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginVertical: 4,
  },
  errorText: {
    color: colors.darkRed,
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 4,
  },
})
