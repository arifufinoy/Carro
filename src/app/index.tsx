import { useForm } from '@tanstack/react-form'
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { useAgregarCarro, useCarros } from '../hooks/use-carros'
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
}

export default function App() {
    const { data: carros = [], isLoading, error } = useCarros()
    const { mutate: agregarCarro, isPending: agregando } = useAgregarCarro()

    const form = useForm({
        defaultValues: {
            marca: '',
            color: '',
            modelo: '',
            tipo: '',
        },
        onSubmit: ({ value }) => {
            agregarCarro(value, {
                onSuccess: () => {
                    form.reset()
                    void form.validateAllFields('change')
                },
            })
        },
    })

    const renderField = (
        name: CarroField,
        label: string,
        placeholder: string,
    ) => (
        <form.Field
            name={name}
            validators={carFieldValidators(name)}
        >
            {(field) => (
                <View style={styles.field}>
                    <Text style={styles.label}>{label}</Text>
                    <TextInput
                        placeholder={placeholder}
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

    if (isLoading) {
        return (
            <View style={styles.centerState}>
                <ActivityIndicator color={colors.red} size="large" />
                <Text style={styles.stateText}>Cargando tus carros...</Text>
            </View>
        )
    }

    if (error) {
        return (
            <View style={styles.centerState}>
                <Text style={styles.stateTitle}>No pudimos cargar tus carros</Text>
                <Text style={styles.stateText}>{error.message}</Text>
            </View>
        )
    }

    return (
        <FlatList
            style={styles.screen}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            data={carros}
            keyExtractor={item => item.id}
            ListHeaderComponent={
                <View>
                    <View style={styles.hero}>
                        <Text style={styles.eyebrow}>PATIO TUERCA · MI GARAJE</Text>
                        <Text style={styles.heroTitle}>Tu carro, siempre a punto.</Text>
                        <Text style={styles.heroCopy}>Registra los datos de tu vehículo para tenerlos a mano.</Text>
                        <View style={styles.heroBadge}>
                            <Text style={styles.heroBadgeText}>{carros.length} {carros.length === 1 ? 'carro registrado' : 'carros registrados'}</Text>
                        </View>
                    </View>

                    <View style={styles.formCard}>
                        <View style={styles.cardHeading}>
                            <View>
                                <Text style={styles.cardTitle}>Agregar carro</Text>
                                <Text style={styles.cardSubtitle}>Completa la información del vehículo</Text>
                            </View>
                        </View>

                        {renderField('marca', 'Marca', 'Ej. Chevrolet')}
                        {renderField('modelo', 'Modelo', 'Ej. Sail')}
                        <View style={styles.row}>
                            <View style={styles.halfField}>{renderField('color', 'Color', 'Ej. Rojo')}</View>
                            <View style={styles.halfField}>{renderField('tipo', 'Tipo', 'Ej. Sedán')}</View>
                        </View>

                        <form.Subscribe selector={state => state.canSubmit}>
                            {(canSubmit) => (
                                <Pressable
                                    accessibilityRole="button"
                                    onPress={() => void form.handleSubmit()}
                                    disabled={!canSubmit || agregando}
                                    style={({ pressed }) => [
                                        styles.primaryButton,
                                        (!canSubmit || agregando) && styles.disabledButton,
                                        pressed && canSubmit && !agregando && styles.pressedButton,
                                    ]}
                                >
                                    <Text style={styles.primaryButtonText}>
                                        {agregando ? 'Guardando...' : 'Agregar a mi garaje'}
                                    </Text>
                                </Pressable>
                            )}
                        </form.Subscribe>
                    </View>

                    <View style={styles.listHeading}>
                        <Text style={styles.sectionTitle}>Tus vehículos</Text>
                        <Text style={styles.sectionCount}>{carros.length}</Text>
                    </View>
                </View>
            }
            ListEmptyComponent={
                <View style={styles.emptyCard}>
                    <Text style={styles.emptyTitle}>Aún no tienes carros</Text>
                    <Text style={styles.emptyCopy}>Completa el formulario para registrar el primero.</Text>
                </View>
            }
            renderItem={({ item }) => (
                <View style={styles.carCard}>
                    <View style={styles.carInfo}>
                        <Text style={styles.carName}>{item.marca} {item.modelo}</Text>
                        <Text style={styles.carMeta}>{item.tipo} · {item.color}</Text>
                    </View>
                </View>
            )}
        />
    )
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 32,
    },
    hero: {
        backgroundColor: colors.surface,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#FFFFFF',
        borderLeftWidth: 4,
        borderLeftColor: colors.red,
        padding: 20,
        marginBottom: 18,
        shadowColor: '#B8C0CA',
        shadowOffset: { width: 5, height: 5 },
        shadowOpacity: 0.55,
        shadowRadius: 8,
        elevation: 5,
    },
    eyebrow: {
        color: colors.red,
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 1.1,
        marginBottom: 10,
    },
    heroTitle: {
        color: colors.text,
        fontSize: 24,
        lineHeight: 30,
        fontWeight: '800',
        marginBottom: 7,
    },
    heroCopy: {
        color: colors.muted,
        fontSize: 15,
        lineHeight: 20,
        maxWidth: 280,
    },
    heroBadge: {
        alignSelf: 'flex-start',
        backgroundColor: colors.inset,
        borderColor: '#FFFFFF',
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginTop: 14,
    },
    heroBadgeText: {
        color: colors.darkRed,
        fontSize: 14,
        fontWeight: '700',
    },
    formCard: {
        backgroundColor: colors.surface,
        borderColor: '#FFFFFF',
        borderWidth: 1,
        borderRadius: 16,
        padding: 16,
        marginBottom: 22,
        shadowColor: '#B8C0CA',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.55,
        shadowRadius: 7,
        elevation: 2,
    },
    cardHeading: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 18,
        gap: 12,
    },
    cardTitle: {
        color: colors.text,
        fontSize: 20,
        fontWeight: '800',
        marginBottom: 3,
    },
    cardSubtitle: {
        color: colors.muted,
        fontSize: 14,
    },
    field: {
        marginBottom: 14,
    },
    label: {
        color: colors.text,
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 7,
    },
    input: {
        height: 52,
        backgroundColor: colors.inset,
        borderColor: '#FFFFFF',
        borderWidth: 1,
        borderRadius: 9,
        paddingHorizontal: 13,
        color: colors.text,
        fontSize: 16,
        shadowColor: '#B8C0CA',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 4,
    },
    fieldError: {
        color: colors.darkRed,
        fontSize: 12,
        marginTop: 5,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    halfField: {
        flex: 1,
    },
    primaryButton: {
        minHeight: 52,
        backgroundColor: colors.red,
        borderRadius: 9,
        borderColor: '#F35C65',
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 2,
        shadowColor: colors.darkRed,
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 0.35,
        shadowRadius: 5,
        elevation: 4,
    },
    primaryButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '800',
    },
    disabledButton: {
        opacity: 0.55,
    },
    pressedButton: {
        transform: [{ translateY: 2 }],
        borderBottomWidth: 1,
    },
    listHeading: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 10,
    },
    sectionTitle: {
        color: colors.text,
        fontSize: 18,
        fontWeight: '800',
    },
    sectionCount: {
        minWidth: 23,
        overflow: 'hidden',
        borderRadius: 12,
        backgroundColor: '#FDE7E9',
        color: colors.darkRed,
        textAlign: 'center',
        fontSize: 12,
        fontWeight: '800',
        paddingHorizontal: 6,
        paddingVertical: 3,
    },
    emptyCard: {
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 14,
        padding: 18,
        alignItems: 'center',
    },
    emptyTitle: {
        color: colors.text,
        fontSize: 17,
        fontWeight: '700',
        marginBottom: 5,
    },
    emptyCopy: {
        color: colors.muted,
        fontSize: 14,
        textAlign: 'center',
    },
    carCard: {
        minHeight: 82,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 13,
        padding: 12,
        marginBottom: 10,
        shadowColor: '#B8C0CA',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 6,
        elevation: 3,
    },
    carInfo: {
        flex: 1,
    },
    carName: {
        color: colors.text,
        fontSize: 16,
        fontWeight: '800',
        marginBottom: 4,
    },
    carMeta: {
        color: colors.muted,
        fontSize: 14,
    },
    centerState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background,
        padding: 24,
    },
    stateTitle: {
        color: colors.text,
        fontSize: 17,
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: 8,
    },
    stateText: {
        color: colors.muted,
        fontSize: 15,
        textAlign: 'center',
        marginTop: 10,
    },
})
